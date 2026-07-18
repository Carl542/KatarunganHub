import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireCaseAccess } from "../middleware/caseAccess.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";
import { VALID_DOCUMENT_TYPES } from "../lib/documentTypes.js";
import { logAudit } from "../lib/auditLog.js";

const router = Router({ mergeParams: true });
const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];
const BUCKET = "case-documents";
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/", requireAuth, requireRole(...STAFF_ROLES), upload.single("file"), async (req, res) => {
  const { type } = req.body;

  if (!VALID_DOCUMENT_TYPES.includes(type)) {
    return res.status(400).json({ error: `"${type}" is not a recognized document type` });
  }

  const supabase = getSupabaseClient();
  let storagePath = null;
  let originalFilename = null;

  if (req.file) {
    storagePath = `${req.params.complaintId}/${Date.now()}-${req.file.originalname}`;
    originalFilename = req.file.originalname;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, req.file.buffer, { contentType: req.file.mimetype });
    if (uploadError) return res.status(500).json({ error: uploadError.message });
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      complaint_id: req.params.complaintId,
      type,
      status: "Draft",
      version: "v1.0",
      prepared_by: req.user.id,
      storage_path: storagePath,
      original_filename: originalFilename,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);

  logAudit({ actorId: req.user.id, action: "Created document", module: "Documents", complaintId: req.params.complaintId });
});

router.get("/", requireAuth, requireCaseAccess, async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("complaint_id", req.params.complaintId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/:docId/download", requireAuth, requireCaseAccess, async (req, res) => {
  const supabase = getSupabaseClient();
  const { data: doc, error } = await supabase
    .from("documents")
    .select("storage_path, original_filename, complaint_id")
    .eq("id", req.params.docId)
    .single();

  if (error || !doc || doc.complaint_id !== req.params.complaintId || !doc.storage_path) {
    return res.status(404).json({ error: "File not found" });
  }

  const { data: file, error: downloadError } = await supabase.storage.from(BUCKET).download(doc.storage_path);
  if (downloadError) return res.status(500).json({ error: downloadError.message });

  const buffer = Buffer.from(await file.arrayBuffer());
  res.setHeader("Content-Disposition", `attachment; filename="${doc.original_filename || "document"}"`);
  res.send(buffer);
});

router.patch("/:docId", requireAuth, requireRole("punong"), async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .update({ status: "Approved", approved_by: req.user.id })
    .eq("id", req.params.docId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);

  logAudit({ actorId: req.user.id, action: "Approved document", module: "Documents", complaintId: req.params.complaintId });
});

export default router;
