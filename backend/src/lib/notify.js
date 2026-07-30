import { getSupabaseClient } from "./supabaseClient.js";

const SEMAPHORE_API_URL = "https://api.semaphore.co/api/v4/messages";

// Formats Philippine local mobile numbers (09XXXXXXXXX) into E.164 (+639XXXXXXXXX)
function formatPhNumber(num) {
  if (!num) return "";
  let clean = num.replace(/[^\d+]/g, "");
  if (clean.startsWith("09")) {
    clean = "+63" + clean.slice(1);
  }
  return clean;
}

// Writes a queued notification record, then sends through Textbee.dev or Semaphore
// if configured, updating the row's status to Sent/Failed.
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

    if (channel === "SMS") {
      if (process.env.TEXTBEE_API_KEY && process.env.TEXTBEE_DEVICE_ID) {
        await sendTextbeeSms(supabase, record.id, recipientId, message);
      } else if (process.env.SEMAPHORE_API_KEY) {
        await sendSemaphoreSms(supabase, record.id, recipientId, message);
      }
    }
  } catch (err) {
    console.error("notify() failed:", err.message);
  }
}

async function sendTextbeeSms(supabase, notificationId, recipientId, message) {
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

    const formattedNumber = formatPhNumber(profile.phone_number);
    const deviceId = process.env.TEXTBEE_DEVICE_ID;
    const apiKey = process.env.TEXTBEE_API_KEY;

    const url = `https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipients: [formattedNumber],
        message: message,
        sim: process.env.TEXTBEE_SIM ? parseInt(process.env.TEXTBEE_SIM, 10) : 2,
      }),
    });

    await supabase
      .from("notifications")
      .update({ status: response.ok ? "Sent" : "Failed" })
      .eq("id", notificationId);
  } catch (err) {
    console.error("sendTextbeeSms() failed:", err.message);
    await supabase.from("notifications").update({ status: "Failed" }).eq("id", notificationId);
  }
}

async function sendSemaphoreSms(supabase, notificationId, recipientId, message) {
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
    console.error("sendSemaphoreSms() failed:", err.message);
    await supabase.from("notifications").update({ status: "Failed" }).eq("id", notificationId);
  }
}
