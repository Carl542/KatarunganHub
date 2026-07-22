"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useCurrentProfile } from "@/lib/useCurrentProfile";

const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

export default function AttendanceTab({ caseId }) {
  const profile = useCurrentProfile();
  const canManage = STAFF_ROLES.includes(profile?.role);
  const [records, setRecords] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [pangkat, setPangkat] = useState(null);
  const [pangkatAttendance, setPangkatAttendance] = useState({
    chairperson: "Present",
    secretary: "Present",
    member: "Present",
  });
  const [form, setForm] = useState({
    scheduleId: "",
    complainantAttendance: "Present",
    respondentAttendance: "Present",
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
    apiFetch(`/complaints/${caseId}/schedules`)
      .then(setSchedules)
      .catch(() => {});
    apiFetch(`/complaints/${caseId}/pangkat`)
      .then((formations) => setPangkat(formations[0] || null))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const luponAttendance = pangkat
        ? [
            pangkat.chairperson?.full_name && `${pangkat.chairperson.full_name} (Chairperson): ${pangkatAttendance.chairperson}`,
            pangkat.secretary?.full_name && `${pangkat.secretary.full_name} (Secretary): ${pangkatAttendance.secretary}`,
            pangkat.member?.full_name && `${pangkat.member.full_name} (Member): ${pangkatAttendance.member}`,
          ]
            .filter(Boolean)
            .join("; ")
        : "";

      await apiFetch(`/complaints/${caseId}/attendance`, {
        method: "POST",
        body: JSON.stringify({ ...form, luponAttendance }),
      });
      setForm({ ...form, scheduleId: "", remarks: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
      <form onSubmit={handleSubmit} className="bg-white/90 rounded-sm border border-border p-5 flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold">Record Attendance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Schedule</span>
            <select
              value={form.scheduleId}
              onChange={(e) => setForm({ ...form, scheduleId: e.target.value })}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            >
              <option value="">No specific schedule</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.type} — {new Date(s.scheduled_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Complainant attendance</span>
            <select
              value={form.complainantAttendance}
              onChange={(e) => setForm({ ...form, complainantAttendance: e.target.value })}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            >
              <option>Present</option>
              <option>Absent</option>
              <option>Excused</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Respondent attendance</span>
            <select
              value={form.respondentAttendance}
              onChange={(e) => setForm({ ...form, respondentAttendance: e.target.value })}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            >
              <option>Present</option>
              <option>Absent</option>
              <option>Excused</option>
            </select>
          </label>
        </div>

        {pangkat && (
          <div>
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Pangkat attendance</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
              {[
                { key: "chairperson", label: "Chairperson", name: pangkat.chairperson?.full_name },
                { key: "secretary", label: "Secretary", name: pangkat.secretary?.full_name },
                { key: "member", label: "Member", name: pangkat.member?.full_name },
              ].map(
                ({ key, label, name }) =>
                  name && (
                    <label key={key} className="flex flex-col gap-1">
                      <span className="text-xs text-foreground-muted">
                        {label} — {name}
                      </span>
                      <select
                        value={pangkatAttendance[key]}
                        onChange={(e) => setPangkatAttendance({ ...pangkatAttendance, [key]: e.target.value })}
                        className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                      >
                        <option>Present</option>
                        <option>Absent</option>
                        <option>Excused</option>
                      </select>
                    </label>
                  )
              )}
            </div>
          </div>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Remarks</span>
          <textarea
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
          />
        </label>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button type="submit" className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 py-2 font-medium self-start px-4">
          Record attendance
        </button>
      </form>
      )}

      {loading ? (
        <p className="text-foreground-muted">Loading…</p>
      ) : (
        <div className="bg-white/90 rounded-sm border border-border overflow-x-auto">
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
                  <td className="px-4 py-16 text-center text-foreground-muted" colSpan={4}>
                    No attendance recorded yet.
                  </td>
                </tr>
              )}
              {records.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2">{r.complainant_attendance}</td>
                  <td className="px-4 py-2">{r.respondent_attendance}</td>
                  <td className="px-4 py-2">
                    {r.lupon_attendance ? (
                      <ul className="space-y-0.5">
                        {r.lupon_attendance.split("; ").map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    ) : (
                      "—"
                    )}
                  </td>
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
