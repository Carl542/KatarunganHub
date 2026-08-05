import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireCaseAccess } from "../middleware/caseAccess.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";
import { logAudit } from "../lib/auditLog.js";

const router = Router({ mergeParams: true });
const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];
const BUCKET = "case-documents";
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/", requireAuth, requireRole(...STAFF_ROLES), upload.single("file"), async (req, res) => {
  const { scheduleId, complainantAttendance, respondentAttendance, luponAttendance, result, remarks } =
    req.body;

  const supabase = getSupabaseClient();
  let attachmentPath = null;
  let originalFilename = null;

  if (req.file) {
    attachmentPath = `${req.params.complaintId}/attendance-${Date.now()}-${req.file.originalname}`;
    originalFilename = req.file.originalname;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(attachmentPath, req.file.buffer, { contentType: req.file.mimetype });
    if (uploadError) return res.status(500).json({ error: uploadError.message });
  }

  const baseRecord = {
    complaint_id: req.params.complaintId,
    schedule_id: scheduleId || null,
    complainant_attendance: complainantAttendance || "Present",
    respondent_attendance: respondentAttendance || "Present",
    lupon_attendance: luponAttendance || null,
    result: result || null,
    remarks: remarks || null,
    recorded_by: req.user.id,
  };

  const fullRecord = attachmentPath
    ? { ...baseRecord, attachment_path: attachmentPath, original_filename: originalFilename }
    : baseRecord;

  let { data, error } = await supabase
    .from("attendance_records")
    .insert(fullRecord)
    .select()
    .single();

  // Fallback retry if attachment_path column is missing in legacy schema
  if (error && error.message && error.message.includes("attachment_path")) {
    const retry = await supabase
      .from("attendance_records")
      .insert(baseRecord)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);

  logAudit({
    actorId: req.user.id,
    action: "Recorded attendance with session snapshot",
    module: "Attendance",
    complaintId: req.params.complaintId,
  });
});

router.get("/:recordId/attachment", requireAuth, requireCaseAccess, async (req, res) => {
  const supabase = getSupabaseClient();
  const { data: record, error } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("id", req.params.recordId)
    .single();

  if (error || !record || !record.attachment_path) {
    return res.status(404).json({ error: "Attachment not found" });
  }

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(record.attachment_path, 60);

  if (signed?.signedUrl) {
    return res.redirect(signed.signedUrl);
  }

  const { data: downloadData, error: downloadError } = await supabase.storage
    .from(BUCKET)
    .download(record.attachment_path);

  if (downloadError || !downloadData) {
    return res.status(500).json({ error: downloadError?.message || "Failed to download attachment" });
  }

  const buffer = Buffer.from(await downloadData.arrayBuffer());
  res.setHeader("Content-Disposition", `inline; filename="${record.original_filename || "snapshot"}"`);
  res.send(buffer);
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
