import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";
import { logAudit } from "../lib/auditLog.js";

const router = Router();
const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

router.get("/", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("lupon_profiles")
    .select("*, profile:profiles(full_name)")
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/", requireAuth, requireRole("admin", "punong"), async (req, res) => {
  const { profileId, position, term, contact, availability, skill, conflictNotes } = req.body;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("lupon_profiles")
    .insert({
      profile_id: profileId,
      position,
      term,
      contact,
      availability,
      skill,
      conflict_notes: conflictNotes,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);

  logAudit({ actorId: req.user.id, action: "Added Lupon profile", module: "Lupon Profiles", complaintId: null });
});

router.patch("/:id", requireAuth, requireRole("admin", "punong"), async (req, res) => {
  const { position, term, contact, availability, skill, conflictNotes } = req.body;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("lupon_profiles")
    .update({ position, term, contact, availability, skill, conflict_notes: conflictNotes })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
