import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";

const router = Router();
const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

router.get("/", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("mediation_schedules")
    .select("*, complaint:complaints(reference_number, title)")
    .order("scheduled_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
