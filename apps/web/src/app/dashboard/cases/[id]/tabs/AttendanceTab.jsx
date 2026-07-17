"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

export default function AttendanceTab({ caseId }) {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    scheduleId: "",
    complainantAttendance: "Present",
    respondentAttendance: "Present",
    luponAttendance: "",
    result: "Complete",
    remarks: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiFetch(`/complaints/${caseId}/attendance`)
      .then(setRecords)
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
      await apiFetch(`/complaints/${caseId}/attendance`, { method: "POST", body: JSON.stringify(form) });
      setForm({ ...form, scheduleId: "", remarks: "" });
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
            <span className="text-sm font-medium">Schedule ID</span>
            <input
              value={form.scheduleId}
              onChange={(e) => setForm({ ...form, scheduleId: e.target.value })}
              className="border rounded-md px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Lupon/Pangkat attendance</span>
            <input
              required
              value={form.luponAttendance}
              onChange={(e) => setForm({ ...form, luponAttendance: e.target.value })}
              className="border rounded-md px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Complainant attendance</span>
            <select
              value={form.complainantAttendance}
              onChange={(e) => setForm({ ...form, complainantAttendance: e.target.value })}
              className="border rounded-md px-3 py-2"
            >
              <option>Present</option>
              <option>Absent</option>
              <option>Excused</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Respondent attendance</span>
            <select
              value={form.respondentAttendance}
              onChange={(e) => setForm({ ...form, respondentAttendance: e.target.value })}
              className="border rounded-md px-3 py-2"
            >
              <option>Present</option>
              <option>Absent</option>
              <option>Excused</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Remarks</span>
          <textarea
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            className="border rounded-md px-3 py-2"
          />
        </label>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button type="submit" className="bg-primary text-white rounded-md py-2 font-medium self-start px-4">
          Record attendance
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left">
              <tr>
                <th className="px-4 py-2">Complainant</th>
                <th className="px-4 py-2">Respondent</th>
                <th className="px-4 py-2">Lupon</th>
                <th className="px-4 py-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-gray-500" colSpan={4}>
                    No attendance recorded yet.
                  </td>
                </tr>
              )}
              {records.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2">{r.complainant_attendance}</td>
                  <td className="px-4 py-2">{r.respondent_attendance}</td>
                  <td className="px-4 py-2">{r.lupon_attendance}</td>
                  <td className="px-4 py-2">{r.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
