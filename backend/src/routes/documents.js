import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireCaseAccess } from "../middleware/caseAccess.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";
import { VALID_DOCUMENT_TYPES } from "../lib/documentTypes.js";
import { logAudit } from "../lib/auditLog.js";

const router = Router({ mergeParams: true });
const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

router.post("/", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const { type } = req.body;

  if (!VALID_DOCUMENT_TYPES.includes(type)) {
    return res.status(400).json({ error: `"${type}" is not a recognized document type` });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      complaint_id: req.params.complaintId,
      type,
      status: "Draft",
      version: "v1.0",
      prepared_by: req.user.id,
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
