import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";
import { logAudit } from "../lib/auditLog.js";

const router = Router();
const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];
const PUBLIC_KEYS = ["barangay_name", "barangay_address", "barangay_contact"];

// Public — no requireAuth. Used by the login/track pages and dashboard
// header, which citizens and anonymous visitors also see.
router.get("/public", async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("system_settings").select("*");

  if (error) return res.status(500).json({ error: error.message });

  const flat = {};
  for (const row of data) {
    if (PUBLIC_KEYS.includes(row.key)) flat[row.key] = row.value;
  }
  res.json(flat);
});

router.get("/", requireAuth, requireRole(...STAFF_ROLES), async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("system_settings").select("*");

  if (error) return res.status(500).json({ error: error.message });

  const flat = {};
  for (const row of data) flat[row.key] = row.value;
  res.json(flat);
});

router.patch("/", requireAuth, requireRole("admin"), async (req, res) => {
  const rows = Object.entries(req.body).map(([key, value]) => ({ key, value }));

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("system_settings").upsert(rows);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ updated: rows.map((r) => r.key) });

  logAudit({ actorId: req.user.id, action: "Updated settings", module: "Settings", complaintId: null });
});

export default router;
