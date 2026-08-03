"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useCurrentProfile } from "@/lib/useCurrentProfile";

const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

function CheckBadge() {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-accent text-white shrink-0">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

function AttendanceSelect({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white w-full focus-visible:outline-3 focus-visible:outline-primary"
      >
        <option>Present</option>
        <option>Absent</option>
        <option>Excused</option>
      </select>
      {value === "Present" && (
        <span className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
          <CheckBadge />
        </span>
      )}
    </div>
  );
}

function AttendanceBadge({ value }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {value === "Present" && <CheckBadge />}
      {value || "—"}
    </span>
  );
}

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
  const [file, setFile] = useState(null);
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

      if (file) {
        const formData = new FormData();
        formData.append("scheduleId", form.scheduleId || "");
        formData.append("complainantAttendance", form.complainantAttendance);
        formData.append("respondentAttendance", form.respondentAttendance);
        formData.append("luponAttendance", luponAttendance);
        formData.append("result", form.result);
        formData.append("remarks", form.remarks);
        formData.append("file", file);

        await apiFetch(`/complaints/${caseId}/attendance`, {
          method: "POST",
          body: formData,
        });
      } else {
        await apiFetch(`/complaints/${caseId}/attendance`, {
          method: "POST",
          body: JSON.stringify({ ...form, luponAttendance }),
        });
      }

      setForm({ ...form, scheduleId: "", remarks: "" });
      setFile(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
      <form onSubmit={handleSubmit} className="bg-white/90 rounded-sm border border-border p-5 flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold">Record Attendance &amp; Proceedings</h2>
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
            <AttendanceSelect
              value={form.complainantAttendance}
              onChange={(e) => setForm({ ...form, complainantAttendance: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Respondent attendance</span>
            <AttendanceSelect
              value={form.respondentAttendance}
              onChange={(e) => setForm({ ...form, respondentAttendance: e.target.value })}
            />
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
                      <AttendanceSelect
                        value={pangkatAttendance[key]}
                        onChange={(e) => setPangkatAttendance({ ...pangkatAttendance, [key]: e.target.value })}
                      />
                    </label>
                  )
              )}
            </div>
          </div>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Remarks / Summary</span>
          <textarea
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            placeholder="Key agreements or summary of proceedings..."
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">
            📸 Attach Session Photo / Scanned Record Book (Optional)
          </span>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border border-border rounded-sm px-3 py-2 bg-white text-sm focus-visible:outline-3 focus-visible:outline-primary"
          />
        </label>

        {error && <p className="text-danger text-sm">{error}</p>}
        <button type="submit" className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 py-2 font-medium self-start px-4">
          Record attendance &amp; proceedings
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
                <th className="px-4 py-2">Snapshot / Signed Page</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr>
                  <td className="px-4 py-16 text-center text-foreground-muted" colSpan={5}>
                    No attendance recorded yet.
                  </td>
                </tr>
              )}
              {records.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2">
                    <AttendanceBadge value={r.complainant_attendance} />
                  </td>
                  <td className="px-4 py-2">
                    <AttendanceBadge value={r.respondent_attendance} />
                  </td>
                  <td className="px-4 py-2">
                    {r.lupon_attendance ? (
                      <ul className="space-y-0.5">
                        {r.lupon_attendance.split("; ").map((line, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            {line.trim().endsWith("Present") && <CheckBadge />}
                            {line}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2">{r.remarks}</td>
                  <td className="px-4 py-2">
                    {r.attachment_path ? (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/complaints/${caseId}/attendance/${r.id}/attachment`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-xs bg-primary/10 px-2 py-1 rounded-sm"
                      >
                        📸 View Snapshot ({r.original_filename || "Record"})
                      </a>
                    ) : (
                      <span className="text-foreground-muted text-xs">— No file attached</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
