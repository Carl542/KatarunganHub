import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";

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
});

router.get("/", requireAuth, async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("mediation_schedules")
    .select("*")
    .eq("complaint_id", req.params.complaintId)
    .order("scheduled_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
