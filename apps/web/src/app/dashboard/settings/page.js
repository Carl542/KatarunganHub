"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import Icon from "@/components/Icon";

const FIELDS = [
  { key: "barangay_name", label: "Barangay name" },
  { key: "barangay_address", label: "Address" },
  { key: "barangay_contact", label: "Contact details" },
];

export default function SettingsPage() {
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [remindersResult, setRemindersResult] = useState(null);
  const [remindersError, setRemindersError] = useState("");

  useEffect(() => {
    apiFetch("/settings")
      .then(setValues)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await apiFetch("/settings", { method: "PATCH", body: JSON.stringify(values) });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendReminders() {
    setRemindersError("");
    setRemindersResult(null);
    setSendingReminders(true);
    try {
      const result = await apiFetch("/schedules/send-reminders", { method: "POST" });
      setRemindersResult(result.remindersSent);
    } catch (err) {
      setRemindersError(err.message);
    } finally {
      setSendingReminders(false);
    }
  }

  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState("");

  async function handleSendTestSms(e) {
    e.preventDefault();
    setTestError("");
    setTestResult(null);
    setSendingTest(true);
    try {
      const res = await apiFetch("/settings/test-sms", {
        method: "POST",
        body: JSON.stringify({ phoneNumber: testPhone, message: testMessage }),
      });
      setTestResult(res);
    } catch (err) {
      setTestError(err.message);
    } finally {
      setSendingTest(false);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Barangay identity shown in the dashboard sidebar and the public case-tracking page.
        </p>
      </div>

      {loading ? (
        <p className="text-foreground-muted">Loading…</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white/90 rounded-sm border border-border p-6 flex flex-col gap-4 max-w-xl">
          {FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">{f.label}</span>
              <input
                value={values[f.key] || ""}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
              />
            </label>
          ))}

          {error && (
            <p className="flex items-center gap-2 text-sm text-danger bg-danger/10 border border-danger rounded-sm px-3 py-2">
              <Icon name="alert-circle" className="w-4 h-4 shrink-0" />
              {error}
            </p>
          )}
          {saved && !error && (
            <p className="flex items-center gap-2 text-sm text-accent bg-accent/10 border border-accent rounded-sm px-3 py-2">
              <Icon name="check-circle" className="w-4 h-4 shrink-0" />
              Settings saved.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 py-2 font-medium disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </form>
      )}

      {!loading && (
        <div className="flex flex-col gap-4 max-w-xl mt-4">
          <form onSubmit={handleSendTestSms} className="bg-white/90 rounded-sm border border-border p-6 flex flex-col gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Icon name="mail" className="w-5 h-5 text-primary shrink-0" />
                Test Live SMS Broadcast
              </h2>
              <p className="text-sm text-foreground-muted mt-1">
                Enter any mobile phone number to test live SMS delivery via active SMS gateway (Textbee / Semaphore).
              </p>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Mobile Number *</span>
              <input
                required
                type="tel"
                placeholder="e.g. 09631221742"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Custom Message (Optional)</span>
              <textarea
                rows={2}
                placeholder="e.g. KatarunganHub Test: Hearing scheduled tomorrow at 9:00 AM."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="border border-border rounded-sm px-3 py-2 bg-white focus-visible:outline-3 focus-visible:outline-primary text-sm"
              />
            </label>

            {testError && (
              <p className="flex items-center gap-2 text-sm text-danger bg-danger/10 border border-danger rounded-sm px-3 py-2">
                <Icon name="alert-circle" className="w-4 h-4 shrink-0" />
                {testError}
              </p>
            )}
            {testResult && !testError && (
              <p className="flex items-center gap-2 text-sm text-accent bg-accent/10 border border-accent rounded-sm px-3 py-2">
                <Icon name="check-circle" className="w-4 h-4 shrink-0" />
                Test SMS queued & sent via {testResult.provider}! Check target phone.
              </p>
            )}

            <button
              type="submit"
              disabled={sendingTest || !testPhone}
              className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 px-4 font-medium disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Icon name="bell" className="w-4 h-4" />
              {sendingTest ? "Sending Test SMS…" : "Send Test SMS Now"}
            </button>
          </form>

          <div className="bg-white/90 rounded-sm border border-border p-6 flex flex-col gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Schedule Reminders</h2>
              <p className="text-sm text-foreground-muted mt-1">
                Sends an SMS reminder to both parties for every hearing scheduled tomorrow that hasn&rsquo;t been
                reminded yet.
              </p>
            </div>

            {remindersError && (
              <p className="flex items-center gap-2 text-sm text-danger bg-danger/10 border border-danger rounded-sm px-3 py-2">
                <Icon name="alert-circle" className="w-4 h-4 shrink-0" />
                {remindersError}
              </p>
            )}
            {remindersResult !== null && !remindersError && (
              <p className="flex items-center gap-2 text-sm text-accent bg-accent/10 border border-accent rounded-sm px-3 py-2">
                <Icon name="check-circle" className="w-4 h-4 shrink-0" />
                {remindersResult === 0
                  ? "No hearings scheduled for tomorrow — nothing to remind."
                  : `Reminder sent for ${remindersResult} hearing${remindersResult === 1 ? "" : "s"}.`}
              </p>
            )}

            <button
              type="button"
              onClick={handleSendReminders}
              disabled={sendingReminders}
              className="self-start border border-primary text-primary rounded-sm hover:bg-primary hover:text-white transition-colors min-h-11 px-4 font-medium disabled:opacity-60 flex items-center gap-2"
            >
              <Icon name="bell" className="w-4 h-4" />
              {sendingReminders ? "Sending…" : "Send Reminders Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
