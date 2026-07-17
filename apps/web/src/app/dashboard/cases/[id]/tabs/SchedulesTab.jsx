"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

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
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border rounded-md px-3 py-2"
            >
              <option>Summons</option>
              <option>Punong Barangay mediation</option>
              <option>Pangkat conciliation</option>
              <option>Follow-up conference</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Date &amp; time</span>
            <input
              type="datetime-local"
              required
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="border rounded-md px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Venue</span>
            <input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="border rounded-md px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Facilitator ID (optional)</span>
            <input
              value={form.facilitatorId}
              onChange={(e) => setForm({ ...form, facilitatorId: e.target.value })}
              className="border rounded-md px-3 py-2"
            />
          </label>
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button type="submit" className="bg-primary text-white rounded-md py-2 font-medium self-start px-4">
          Add schedule
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left">
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Date &amp; time</th>
                <th className="px-4 py-2">Venue</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-gray-500" colSpan={4}>
                    No schedules yet.
                  </td>
                </tr>
              )}
              {schedules.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2">{s.type}</td>
                  <td className="px-4 py-2">{new Date(s.scheduled_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{s.venue}</td>
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
