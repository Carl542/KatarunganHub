import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getSupabaseClient } from "../lib/supabaseClient.js";
import { logAudit } from "../lib/auditLog.js";

const router = Router();
const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];
const PUBLIC_KEYS = [
  "barangay_name",
  "barangay_address",
  "barangay_contact",
  "municipality",
  "province",
  "official_email",
  "office_hours",
  "default_venue",
  "case_prefix",
  "current_year",
];

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

router.post("/test-sms", requireAuth, requireRole("admin"), async (req, res) => {
  const { phoneNumber, message } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: "Phone number is required" });

  let formattedNumber = phoneNumber.replace(/[^\d+]/g, "");
  if (formattedNumber.startsWith("+639")) formattedNumber = "09" + formattedNumber.slice(4);

  const text = message || "KatarunganHub Live Test: Official hearing notification broadcast.";

  try {
    if (process.env.TEXTBEE_API_KEY && process.env.TEXTBEE_DEVICE_ID) {
      const deviceId = process.env.TEXTBEE_DEVICE_ID;
      const apiKey = process.env.TEXTBEE_API_KEY;
      const response = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`, {
        method: "POST",
        headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ recipients: [formattedNumber], message: text }),
      });
      const data = await response.json();
      if (!response.ok) return res.status(500).json({ error: data.message || "Failed to send SMS via Textbee" });
      logAudit({ actorId: req.user.id, action: `Sent test SMS to ${formattedNumber}`, module: "Settings", complaintId: null });
      return res.json({ success: true, provider: "Textbee", data });
    } else if (process.env.SEMAPHORE_API_KEY) {
      const body = new URLSearchParams({
        apikey: process.env.SEMAPHORE_API_KEY,
        number: formattedNumber,
        message: text,
      });
      const response = await fetch("https://api.semaphore.co/api/v4/messages", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) return res.status(500).json({ error: "Failed to send SMS via Semaphore" });
      logAudit({ actorId: req.user.id, action: `Sent test SMS to ${formattedNumber}`, module: "Settings", complaintId: null });
      return res.json({ success: true, provider: "Semaphore", data });
    } else {
      return res.status(400).json({ error: "No SMS Gateway configured. Please set TEXTBEE_API_KEY or SEMAPHORE_API_KEY." });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
