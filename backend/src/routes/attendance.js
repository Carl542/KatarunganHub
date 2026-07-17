import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireCaseAccess } from "../middleware/caseAccess.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";
import { logAudit } from "../lib/auditLog.js";

const router = Router({ mergeParams: true });
const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

router.post("/", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const { scheduleId, complainantAttendance, respondentAttendance, luponAttendance, result, remarks } =
    req.body;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attendance_records")
    .insert({
      complaint_id: req.params.complaintId,
      schedule_id: scheduleId || null,
      complainant_attendance: complainantAttendance,
      respondent_attendance: respondentAttendance,
      lupon_attendance: luponAttendance,
      result,
      remarks,
      recorded_by: req.user.id,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);

  logAudit({
    actorId: req.user.id,
    action: "Recorded attendance",
    module: "Attendance",
    complaintId: req.params.complaintId,
  });
});

router.get("/", requireAuth, requireCaseAccess, async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("complaint_id", req.params.complaintId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
