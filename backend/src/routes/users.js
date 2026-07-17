import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";
import { logAudit } from "../lib/auditLog.js";

const router = Router();

router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("profiles").select("*").order("full_name", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { role, status, phone_number } = req.body;
  const updates = {};
  if (role) updates.role = role;
  if (status) updates.status = status;
  if (phone_number !== undefined) updates.phone_number = phone_number;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);

  logAudit({ actorId: req.user.id, action: "Updated user account", module: "User Accounts", complaintId: null });
});

export default router;
