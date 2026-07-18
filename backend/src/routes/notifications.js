import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const supabase = getSupabaseClient();
  let query = supabase.from("notifications").select("*, complaint:complaints(reference_number)");

  if (["complainant", "respondent"].includes(req.user.role)) {
    query = query.eq("recipient_id", req.user.id);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
