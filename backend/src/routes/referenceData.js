import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";

const router = Router();
const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

router.get("/", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const supabase = getSupabaseClient();

  const [{ data: categories, error: categoriesError }, { data: priorities, error: prioritiesError }] =
    await Promise.all([
      supabase.from("complaint_categories").select("id, name").order("name", { ascending: true }),
      supabase.from("priority_levels").select("id, name, rank").order("rank", { ascending: true }),
    ]);

  if (categoriesError) return res.status(500).json({ error: categoriesError.message });
  if (prioritiesError) return res.status(500).json({ error: prioritiesError.message });

  res.json({ categories, priorities });
});

export default router;
