import { getSupabaseClient } from "./supabaseClient.js";
import { notify } from "./notify.js";

export async function runAutomated24HourReminders() {
  try {
    const supabase = getSupabaseClient();
    const startOfTomorrow = new Date();
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const startOfDayAfter = new Date(startOfTomorrow);
    startOfDayAfter.setDate(startOfDayAfter.getDate() + 1);

    const { data: schedules, error } = await supabase
      .from("mediation_schedules")
      .select(
        "id, type, scheduled_at, venue, complaint_id, complaint:complaints(reference_number, complainant_id, respondent_id)"
      )
      .is("reminder_sent_at", null)
      .eq("status", "Scheduled")
      .gte("scheduled_at", startOfTomorrow.toISOString())
      .lt("scheduled_at", startOfDayAfter.toISOString());

    if (error || !schedules || schedules.length === 0) return 0;

    let count = 0;
    for (const schedule of schedules) {
      const when = new Date(schedule.scheduled_at).toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      const message = `PAHINUMDOM (24 Hours): Adunay ${schedule.type} ugma, ${when} sa ${schedule.venue || "Barangay Hall"} (Ref: ${schedule.complaint?.reference_number}). Palihug sa pag-abot sa saktong oras.`;

      if (schedule.complaint?.complainant_id) {
        notify({ recipientId: schedule.complaint.complainant_id, complaintId: schedule.complaint_id, message });
      }
      if (schedule.complaint?.respondent_id) {
        notify({ recipientId: schedule.complaint.respondent_id, complaintId: schedule.complaint_id, message });
      }

      await supabase
        .from("mediation_schedules")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", schedule.id);

      count++;
    }

    if (count > 0) {
      console.log(`[AutoSMS Cron] Sent 24-hour reminders for ${count} upcoming schedules.`);
    }
    return count;
  } catch (err) {
    console.error("[AutoSMS Cron] Automated reminder check error:", err.message);
    return 0;
  }
}
