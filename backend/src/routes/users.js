import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";
import { logAudit } from "../lib/auditLog.js";
import { generateTempPassword } from "../lib/tempPassword.js";

const router = Router();
const SECRETARY_CREATABLE_ROLES = ["complainant", "respondent"];

function fallbackEmail(fullName, phoneNumber) {
  const slug = (phoneNumber || fullName || "resident").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${slug}.${Date.now()}@resident.katarunganhub.local`;
}

router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("profiles").select("*").order("full_name", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get(
  "/lookup",
  requireAuth,
  requireRole("admin", "punong", "secretary", "lupon"),
  async (req, res) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .order("full_name", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  }
);

router.post("/", requireAuth, requireRole("admin", "secretary"), async (req, res) => {
  const { fullName, email, phoneNumber, role } = req.body;

  if (req.user.role === "secretary" && !SECRETARY_CREATABLE_ROLES.includes(role)) {
    return res.status(403).json({ error: "Secretary can only register complainant or respondent accounts" });
  }

  const supabase = getSupabaseClient();
  const finalEmail = email || fallbackEmail(fullName, phoneNumber);
  const tempPassword = generateTempPassword();

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: finalEmail,
    password: tempPassword,
    email_confirm: true,
  });
  if (authError) return res.status(400).json({ error: authError.message });

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({ id: authData.user.id, full_name: fullName, role, phone_number: phoneNumber || null })
    .select()
    .single();
  if (profileError) return res.status(500).json({ error: profileError.message });

  res.status(201).json({ ...profile, email: finalEmail, tempPassword });

  logAudit({ actorId: req.user.id, action: `Registered new ${role} account`, module: "User Accounts", complaintId: null });
});

router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { role, status, phone_number, full_name } = req.body;
  const updates = {};
  if (role) updates.role = role;
  if (status) updates.status = status;
  if (phone_number !== undefined) updates.phone_number = phone_number;
  if (full_name) updates.full_name = full_name;

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
