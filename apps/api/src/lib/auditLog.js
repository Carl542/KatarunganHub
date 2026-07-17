import { getSupabaseClient } from "./supabaseClient.js";

export async function logAudit({ actorId, action, module, complaintId }) {
  const supabase = getSupabaseClient();
  try {
    await supabase.from("audit_logs").insert({
      actor_id: actorId,
      action,
      module,
      complaint_id: complaintId,
    });
  } catch (err) {
    console.error("logAudit() failed:", err.message);
  }
}
