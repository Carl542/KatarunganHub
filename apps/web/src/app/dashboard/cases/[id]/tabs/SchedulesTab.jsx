"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import UserPicker from "@/components/UserPicker";

const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

export default function SchedulesTab({ caseId }) {
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({ type: "Summons", scheduledAt: "", venue: "Barangay Hall", facilitatorId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiFetch(`/complaints/${caseId}/schedules`)
      .then(setSchedules)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await apiFetch(`/complaints/${caseId}/schedules`, { method: "POST", body: JSON.stringify(form) });
      setForm({ type: "Summons", scheduledAt: "", venue: "Barangay Hall", facilitatorId: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="bg-white/90 rounded-sm border border-border p-5 flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold">Add Case Schedule</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            >
              <option>Summons</option>
              <option>Punong Barangay mediation</option>
              <option>Pangkat conciliation</option>
              <option>Follow-up conference</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Date &amp; time</span>
            <input
              type="datetime-local"
              required
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Venue</span>
            <input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Facilitator (optional)</span>
            <UserPicker
              roles={STAFF_ROLES}
              value={form.facilitatorId}
              onChange={(v) => setForm({ ...form, facilitatorId: v })}
              placeholder="Select facilitator"
            />
          </label>
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button type="submit" className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 py-2 font-medium self-start px-4">
          Add schedule
        </button>
      </form>

      {loading ? (
        <p className="text-foreground-muted">Loading…</p>
      ) : (
        <div className="bg-white/90 rounded-sm border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left">
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Date &amp; time</th>
                <th className="px-4 py-2">Venue</th>
                <th className="px-4 py-2">Facilitator</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 && (
                <tr>
                  <td className="px-4 py-16 text-center text-foreground-muted" colSpan={5}>
                    No schedules yet.
                  </td>
                </tr>
              )}
              {schedules.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2">{s.type}</td>
                  <td className="px-4 py-2">{new Date(s.scheduled_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{s.venue}</td>
                  <td className="px-4 py-2">{s.facilitator?.full_name || "—"}</td>
                  <td className="px-4 py-2">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
