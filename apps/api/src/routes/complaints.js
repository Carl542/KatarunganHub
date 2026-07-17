import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { generateReferenceNumber } from "../lib/referenceNumber.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";

const router = Router();

// Public — no requireAuth. Registered before the auth-gated routes below.
router.get("/track/:referenceNumber", async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("complaints")
    .select("reference_number, status, type, title, filed_at")
    .eq("reference_number", req.params.referenceNumber)
    .single();

  if (error || !data) return res.status(404).json({ error: "Case not found" });
  res.json(data);
});

router.post("/", requireAuth, requireRole("secretary"), async (req, res) => {
  const supabase = getSupabaseClient();
  const { title, complainantId, respondentId, type, narrative, relief } = req.body;

  const { count } = await supabase.from("complaints").select("*", { count: "exact", head: true });
  const referenceNumber = generateReferenceNumber((count || 0) + 1);

  const { data, error } = await supabase
    .from("complaints")
    .insert({
      title,
      complainant_id: complainantId || null,
      respondent_id: respondentId || null,
      type,
      narrative,
      relief,
      reference_number: referenceNumber,
      status: "New",
      created_by: req.user.id,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.get("/", requireAuth, async (req, res) => {
  const supabase = getSupabaseClient();
  let query = supabase.from("complaints").select("*").order("filed_at", { ascending: false });

  if (["complainant", "respondent"].includes(req.user.role)) {
    query = query.or(`complainant_id.eq.${req.user.id},respondent_id.eq.${req.user.id}`);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/:id", requireAuth, async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("complaints").select("*").eq("id", req.params.id).single();

  if (error || !data) return res.status(404).json({ error: "Case not found" });

  const isParty = data.complainant_id === req.user.id || data.respondent_id === req.user.id;
  const isStaff = ["admin", "punong", "secretary", "lupon"].includes(req.user.role);
  if (!isStaff && !isParty) return res.status(403).json({ error: "Forbidden" });

  res.json(data);
});

router.patch("/:id/jurisdiction", requireAuth, requireRole("punong", "secretary"), async (req, res) => {
  const supabase = getSupabaseClient();
  const { result, reason } = req.body;

  const updatesByResult = {
    "Potentially covered": { type: "Lupon", workflow_stage: "Summons issued" },
    "Potentially not covered": { type: "Non-Lupon", workflow_stage: null },
    "Requires further verification": {},
  };
  const updates = updatesByResult[result];

  if (!updates) return res.status(400).json({ error: "Invalid jurisdiction result" });

  const { data, error } = await supabase
    .from("complaints")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("case_status_logs").insert({
    complaint_id: req.params.id,
    outcome: result,
    notes: reason,
    authorized_by: req.user.id,
  });

  res.json(data);
});

export default router;
