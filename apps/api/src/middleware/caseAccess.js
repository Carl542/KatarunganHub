import { getSupabaseClient } from "../lib/supabaseClient.js";

const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

// Ensures the authenticated user is either staff or a party (complainant/
// respondent) on the case identified by req.params.complaintId. Attaches the
// fetched complaint as req.complaint so callers don't have to re-fetch it.
export async function requireCaseAccess(req, res, next) {
  const supabase = getSupabaseClient();
  const { data: complaint, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("id", req.params.complaintId)
    .single();

  if (error || !complaint) return res.status(404).json({ error: "Case not found" });

  const isParty = complaint.complainant_id === req.user.id || complaint.respondent_id === req.user.id;
  const isStaff = STAFF_ROLES.includes(req.user.role);
  if (!isStaff && !isParty) return res.status(403).json({ error: "Forbidden" });

  req.complaint = complaint;
  next();
}
