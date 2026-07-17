import { getSupabaseClient } from "./supabaseClient.js";

const SEMAPHORE_API_URL = "https://api.semaphore.co/api/v4/messages";

// Writes a queued notification record, then (SMS channel only, and only when
// SEMAPHORE_API_KEY is configured) sends it through Semaphore and updates the
// row's status to Sent/Failed. Callers never change regardless of provider.
export async function notify({ recipientId, complaintId, message, channel = "SMS" }) {
  if (!recipientId) return;

  const supabase = getSupabaseClient();
  try {
    const { data: record } = await supabase
      .from("notifications")
      .insert({
        recipient_id: recipientId,
        complaint_id: complaintId,
        message,
        channel,
        status: "Queued",
      })
      .select()
      .single();

    if (channel === "SMS" && process.env.SEMAPHORE_API_KEY) {
      await sendSms(supabase, record.id, recipientId, message);
    }
  } catch (err) {
    console.error("notify() failed:", err.message);
  }
}

async function sendSms(supabase, notificationId, recipientId, message) {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("phone_number")
      .eq("id", recipientId)
      .single();

    if (!profile?.phone_number) {
      await supabase.from("notifications").update({ status: "Failed" }).eq("id", notificationId);
      return;
    }

    const body = new URLSearchParams({
      apikey: process.env.SEMAPHORE_API_KEY,
      number: profile.phone_number,
      message,
    });
    if (process.env.SEMAPHORE_SENDER_NAME) body.set("sendername", process.env.SEMAPHORE_SENDER_NAME);

    const response = await fetch(SEMAPHORE_API_URL, { method: "POST", body });

    await supabase
      .from("notifications")
      .update({ status: response.ok ? "Sent" : "Failed" })
      .eq("id", notificationId);
  } catch (err) {
    console.error("sendSms() failed:", err.message);
    await supabase.from("notifications").update({ status: "Failed" }).eq("id", notificationId);
  }
}
