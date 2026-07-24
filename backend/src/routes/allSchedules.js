import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";
import { notify } from "../lib/notify.js";

const router = Router();
const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

router.get("/", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("mediation_schedules")
    .select("*, complaint:complaints(reference_number, title)")
    .order("scheduled_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Called once a day by an external scheduler (Render Cron Job or similar),
// not by a signed-in user — a shared secret guards it instead of requireAuth.
// Sends a reminder SMS one day before each schedule and marks it sent so a
// second cron run the same day doesn't double-text anyone.
router.post("/send-reminders", async (req, res) => {
  if (!process.env.CRON_SECRET || req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabaseClient();
  const startOfTomorrow = new Date();
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  startOfTomorrow.setHours(0, 0, 0, 0);
  const startOfDayAfter = new Date(startOfTomorrow);
  startOfDayAfter.setDate(startOfDayAfter.getDate() + 1);

  const { data: schedules, error } = await supabase
    .from("mediation_schedules")
    .select(
      "id, type, scheduled_at, venue, complaint_id, complaint:complaints(reference_number, complainant_id, respondent_id)"
    )
    .is("reminder_sent_at", null)
    .eq("status", "Scheduled")
    .gte("scheduled_at", startOfTomorrow.toISOString())
    .lt("scheduled_at", startOfDayAfter.toISOString());

  if (error) return res.status(500).json({ error: error.message });

  for (const schedule of schedules) {
    const when = new Date(schedule.scheduled_at).toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const message = `Reminder: You have a ${schedule.type} scheduled tomorrow, ${when} at ${schedule.venue} (case ${schedule.complaint?.reference_number}).`;

    notify({ recipientId: schedule.complaint?.complainant_id, complaintId: schedule.complaint_id, message });
    notify({ recipientId: schedule.complaint?.respondent_id, complaintId: schedule.complaint_id, message });

    await supabase
      .from("mediation_schedules")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", schedule.id);
  }

  res.json({ remindersSent: schedules.length });
});

export default router;
