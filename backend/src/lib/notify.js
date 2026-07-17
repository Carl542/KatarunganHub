import { getSupabaseClient } from "./supabaseClient.js";

// Writes a queued notification record. Does not send anything — the SMS
// provider is still an open decision (see plan docs). Swapping in a real
// provider later means implementing delivery here; callers never change.
export async function notify({ recipientId, complaintId, message, channel = "SMS" }) {
  if (!recipientId) return;

  const supabase = getSupabaseClient();
  try {
    await supabase.from("notifications").insert({
      recipient_id: recipientId,
      complaint_id: complaintId,
      message,
      channel,
      status: "Queued",
    });
  } catch (err) {
    console.error("notify() failed:", err.message);
  }
}
