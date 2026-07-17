import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";

const router = Router();

router.get("/", requireAuth, requireRole("admin", "punong", "secretary", "lupon"), async (req, res) => {
  const supabase = getSupabaseClient();
  let query = supabase.from("audit_logs").select("*, actor:profiles(full_name), complaint:complaints(reference_number)");

  if (req.query.complaintId) {
    query = query.eq("complaint_id", req.query.complaintId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
