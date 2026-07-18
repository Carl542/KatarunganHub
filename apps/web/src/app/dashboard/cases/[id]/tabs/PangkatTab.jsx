"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import UserPicker from "@/components/UserPicker";

const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

export default function PangkatTab({ caseId }) {
  const [formations, setFormations] = useState([]);
  const [form, setForm] = useState({
    formationDate: "",
    chairpersonId: "",
    secretaryId: "",
    memberId: "",
    conflictNotes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiFetch(`/complaints/${caseId}/pangkat`)
      .then(setFormations)
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
      await apiFetch(`/complaints/${caseId}/pangkat`, { method: "POST", body: JSON.stringify(form) });
      setForm({ formationDate: "", chairpersonId: "", secretaryId: "", memberId: "", conflictNotes: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="bg-white/90 rounded-sm border border-border p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Formation date</span>
            <input
              type="date"
              required
              value={form.formationDate}
              onChange={(e) => setForm({ ...form, formationDate: e.target.value })}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Chairperson</span>
            <UserPicker
              required
              roles={STAFF_ROLES}
              value={form.chairpersonId}
              onChange={(v) => setForm({ ...form, chairpersonId: v })}
              placeholder="Select chairperson"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Secretary</span>
            <UserPicker
              required
              roles={STAFF_ROLES}
              value={form.secretaryId}
              onChange={(v) => setForm({ ...form, secretaryId: v })}
              placeholder="Select secretary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Member</span>
            <UserPicker
              required
              roles={STAFF_ROLES}
              value={form.memberId}
              onChange={(v) => setForm({ ...form, memberId: v })}
              placeholder="Select member"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Conflict of interest review notes</span>
          <textarea
            required
            value={form.conflictNotes}
            onChange={(e) => setForm({ ...form, conflictNotes: e.target.value })}
            className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
          />
        </label>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button type="submit" className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 py-2 font-medium self-start px-4">
          Save formation
        </button>
      </form>

      {loading ? (
        <p className="text-foreground-muted">Loading…</p>
      ) : (
        <div className="bg-white/90 rounded-sm border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Chairperson</th>
                <th className="px-4 py-2">Secretary</th>
                <th className="px-4 py-2">Member</th>
                <th className="px-4 py-2">Acceptance</th>
              </tr>
            </thead>
            <tbody>
              {formations.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-foreground-muted" colSpan={5}>
                    No Pangkat formation recorded yet.
                  </td>
                </tr>
              )}
              {formations.map((f) => (
                <tr key={f.id} className="border-t">
                  <td className="px-4 py-2">{f.formation_date}</td>
                  <td className="px-4 py-2">{f.chairperson?.full_name || "—"}</td>
                  <td className="px-4 py-2">{f.secretary?.full_name || "—"}</td>
                  <td className="px-4 py-2">{f.member?.full_name || "—"}</td>
                  <td className="px-4 py-2">{f.acceptance_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
