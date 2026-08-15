import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireCaseAccess } from "../middleware/caseAccess.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";
import { notify } from "../lib/notify.js";
import { logAudit } from "../lib/auditLog.js";

const router = Router({ mergeParams: true });
const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

router.post("/", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const supabase = getSupabaseClient();
  const { type, scheduledAt, venue, facilitatorId } = req.body;

  const { data, error } = await supabase
    .from("mediation_schedules")
    .insert({
      complaint_id: req.params.complaintId,
      type,
      scheduled_at: scheduledAt,
      venue,
      facilitator_id: facilitatorId || null,
      status: "Scheduled",
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);

  logAudit({ actorId: req.user.id, action: "Added schedule", module: "Scheduling", complaintId: req.params.complaintId });

  try {
    const { data: complaint } = await supabase
      .from("complaints")
      .select("complainant_id, respondent_id, reference_number")
      .eq("id", req.params.complaintId)
      .single();

    if (complaint) {
      let formattedDate = scheduledAt;
      try {
        formattedDate = new Date(scheduledAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Manila",
        });
      } catch (e) {
        /* fallback to raw */
      }
      const message = `A ${type} is scheduled for ${formattedDate} at ${venue} (case ${complaint.reference_number}).`;
      notify({ recipientId: complaint.complainant_id, complaintId: req.params.complaintId, message });
      notify({ recipientId: complaint.respondent_id, complaintId: req.params.complaintId, message });
    }
  } catch (err) {
    console.error("Failed to notify parties of new schedule:", err.message);
  }
});

router.get("/", requireAuth, requireCaseAccess, async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("mediation_schedules")
    .select("*, facilitator:profiles!facilitator_id(full_name)")
    .eq("complaint_id", req.params.complaintId)
    .order("scheduled_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
