import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { generateReferenceNumber } from "../lib/referenceNumber.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";
import * as luponWorkflow from "../lib/workflowDefinitions.js";
import * as nonLuponWorkflow from "../lib/nonLuponDefinitions.js";
import { notify } from "../lib/notify.js";
import { logAudit } from "../lib/auditLog.js";

function workflowModuleFor(type) {
  return type === "Non-Lupon" ? nonLuponWorkflow : luponWorkflow;
}

function titleCase(s) {
  return (s || "").replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1));
}

const router = Router();

// Public — no requireAuth. Registered before the auth-gated routes below.
// A second identifier (last name substring or exact mobile number) is
// required before any party names or case details are returned, so knowing
// only the reference number isn't enough to see who's involved.
router.post("/track", async (req, res) => {
  const { referenceNumber, verify } = req.body;
  if (!referenceNumber || !verify) {
    return res.status(400).json({ error: "Reference number and last name or mobile number are required" });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("complaints")
    .select(
      "id, reference_number, status, workflow_stage, type, title, filed_at, category:complaint_categories(name), complainant:profiles!complainant_id(full_name, phone_number), respondent:profiles!respondent_id(full_name, phone_number), status_logs:case_status_logs(next_stage, created_at)"
    )
    .eq("reference_number", referenceNumber)
    .single();

  if (error || !data) return res.status(404).json({ error: "Case not found" });

  const verifyValue = verify.trim();
  const verifyLower = verifyValue.toLowerCase();
  const matchesParty = [data.complainant, data.respondent].some((p) => {
    if (!p) return false;
    const nameMatch = p.full_name && p.full_name.toLowerCase().includes(verifyLower);
    const phoneMatch = p.phone_number && p.phone_number === verifyValue;
    return nameMatch || phoneMatch;
  });

  // Same 404 whether the reference number was wrong or the identifier didn't
  // match, so a guesser can't tell which case it was.
  if (!matchesParty) return res.status(404).json({ error: "Case not found" });

  const [{ data: schedules }, { data: notifs }] = await Promise.all([
    supabase
      .from("mediation_schedules")
      .select("type, scheduled_at, venue")
      .eq("complaint_id", data.id)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(1),
    supabase.from("notifications").select("message").eq("complaint_id", data.id).order("created_at", { ascending: false }).limit(1),
  ]);

  const timeline = [
    { label: "Case Encoded", date: data.filed_at },
    ...(data.status_logs || [])
      .slice()
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((log) => ({ label: titleCase(log.next_stage), date: log.created_at })),
  ];

  res.json({
    reference_number: data.reference_number,
    status: data.status,
    type: data.type,
    title: data.title,
    filed_at: data.filed_at,
    category: data.category?.name || null,
    complainant_name: data.complainant?.full_name || null,
    respondent_name: data.respondent?.full_name || null,
    assigned_to: data.type === "Non-Lupon" ? "Barangay Office" : "Lupong Tagapamayapa",
    timeline,
    next_schedule: schedules?.[0] || null,
    latest_update: notifs?.[0]?.message || null,
  });
});

router.post("/", requireAuth, requireRole("secretary"), async (req, res) => {
  const supabase = getSupabaseClient();
  const { title, complainantId, respondentId, type, narrative, relief, categoryId, priorityId } = req.body;

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
      category_id: categoryId || null,
      priority_id: priorityId || null,
      reference_number: referenceNumber,
      status: "New",
      created_by: req.user.id,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);

  notify({
    recipientId: data.complainant_id,
    complaintId: data.id,
    message: `Case ${data.reference_number} has been officially recorded.`,
  });
  logAudit({ actorId: req.user.id, action: "Registered case", module: "Cases", complaintId: data.id });
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
  const { data, error } = await supabase
    .from("complaints")
    .select(
      "*, creator:profiles!created_by(full_name), complainant:profiles!complainant_id(full_name), respondent:profiles!respondent_id(full_name), category:complaint_categories(name), priority:priority_levels(name), status_logs:case_status_logs(previous_stage, outcome, next_stage, notes, created_at, actor:profiles!authorized_by(full_name))"
    )
    .eq("id", req.params.id)
    .single();

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

  logAudit({ actorId: req.user.id, action: "Reviewed jurisdiction", module: "Jurisdiction", complaintId: req.params.id });
});

router.patch("/:id/workflow", requireAuth, async (req, res) => {
  const supabase = getSupabaseClient();
  const { outcome, notes } = req.body;

  const { data: existing, error: fetchError } = await supabase
    .from("complaints")
    .select("workflow_stage, type")
    .eq("id", req.params.id)
    .single();

  if (fetchError || !existing) return res.status(404).json({ error: "Case not found" });

  const workflow = workflowModuleFor(existing.type);
  const currentStage = existing.workflow_stage || workflow.STAGES[0];

  if (!workflow.canActOnStage(currentStage, req.user.role)) {
    return res.status(403).json({ error: `${req.user.role} cannot act on stage "${currentStage}"` });
  }

  if (!workflow.getAllowedOutcomes(currentStage).includes(outcome)) {
    return res.status(400).json({ error: `"${outcome}" is not a valid outcome for "${currentStage}"` });
  }

  let newStatus = activeStatus;
  if (nextStage === "Closed") {
    newStatus = "Closed";
  } else if (nextStage === "Settlement monitoring" || outcome === "Settlement reached") {
    newStatus = "Settlement monitoring";
  } else if (nextStage === "Proper disposition") {
    newStatus = "Proper disposition";
  }

  const { data, error } = await supabase
    .from("complaints")
    .update({
      workflow_stage: nextStage,
      status: newStatus,
    })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("case_status_logs").insert({
    complaint_id: req.params.id,
    previous_stage: currentStage,
    outcome,
    next_stage: nextStage,
    authorized_by: req.user.id,
    notes,
  });

  res.json(data);

  const message = `Case ${data.reference_number || req.params.id} moved to "${nextStage}" (${outcome}).`;
  notify({ recipientId: data.complainant_id, complaintId: data.id, message });
  notify({ recipientId: data.respondent_id, complaintId: data.id, message });
  logAudit({
    actorId: req.user.id,
    action: "Recorded workflow transition",
    module: "Workflow",
    complaintId: data.id,
  });
});

export default router;
