"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

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
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Formation date</span>
            <input
              type="date"
              required
              value={form.formationDate}
              onChange={(e) => setForm({ ...form, formationDate: e.target.value })}
              className="border rounded-md px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Chairperson ID</span>
            <input
              required
              value={form.chairpersonId}
              onChange={(e) => setForm({ ...form, chairpersonId: e.target.value })}
              className="border rounded-md px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Secretary ID</span>
            <input
              required
              value={form.secretaryId}
              onChange={(e) => setForm({ ...form, secretaryId: e.target.value })}
              className="border rounded-md px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Member ID</span>
            <input
              required
              value={form.memberId}
              onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              className="border rounded-md px-3 py-2"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Conflict of interest review notes</span>
          <textarea
            required
            value={form.conflictNotes}
            onChange={(e) => setForm({ ...form, conflictNotes: e.target.value })}
            className="border rounded-md px-3 py-2"
          />
        </label>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button type="submit" className="bg-primary text-white rounded-md py-2 font-medium self-start px-4">
          Save formation
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
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
                  <td className="px-4 py-3 text-gray-500" colSpan={5}>
                    No Pangkat formation recorded yet.
                  </td>
                </tr>
              )}
              {formations.map((f) => (
                <tr key={f.id} className="border-t">
                  <td className="px-4 py-2">{f.formation_date}</td>
                  <td className="px-4 py-2 text-xs">{f.chairperson_id}</td>
                  <td className="px-4 py-2 text-xs">{f.secretary_id}</td>
                  <td className="px-4 py-2 text-xs">{f.member_id}</td>
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
