import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";

const router = Router({ mergeParams: true });

router.post("/", requireAuth, requireRole("punong", "secretary"), async (req, res) => {
  const { formationDate, chairpersonId, secretaryId, memberId, conflictNotes } = req.body;

  const distinctPeople = new Set([chairpersonId, secretaryId, memberId]);
  if (distinctPeople.size < 3) {
    return res.status(400).json({ error: "Chairperson, secretary, and member must be three distinct people" });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("pangkat_formations")
    .insert({
      complaint_id: req.params.complaintId,
      formation_date: formationDate,
      chairperson_id: chairpersonId,
      secretary_id: secretaryId,
      member_id: memberId,
      conflict_notes: conflictNotes,
      created_by: req.user.id,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.get("/", requireAuth, async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("pangkat_formations")
    .select("*")
    .eq("complaint_id", req.params.complaintId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
