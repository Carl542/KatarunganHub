"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useCurrentProfile } from "@/lib/useCurrentProfile";

const DOCUMENT_TYPES = [
  "Complaint",
  "Summons",
  "Notice of hearing",
  "Mediation minutes",
  "Pangkat formation record",
  "Amicable settlement",
  "Arbitration agreement",
  "Arbitration award",
  "Certification to File Action",
  "Disposition record",
];

export default function DocumentsTab({ caseId }) {
  const profile = useCurrentProfile();
  const [documents, setDocuments] = useState([]);
  const [type, setType] = useState(DOCUMENT_TYPES[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiFetch(`/complaints/${caseId}/documents`)
      .then(setDocuments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await apiFetch(`/complaints/${caseId}/documents`, { method: "POST", body: JSON.stringify({ type }) });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleApprove(docId) {
    setError("");
    try {
      await apiFetch(`/complaints/${caseId}/documents/${docId}`, { method: "PATCH", body: JSON.stringify({}) });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-4 flex items-end gap-3">
        <label className="flex flex-col gap-1 flex-1">
          <span className="text-sm font-medium">Document type</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded-md px-3 py-2">
            {DOCUMENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="bg-primary text-white rounded-md py-2 font-medium px-4">
          Create document
        </button>
      </form>

      {error && <p className="text-danger text-sm">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left">
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Version</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-gray-500" colSpan={4}>
                    No documents yet.
                  </td>
                </tr>
              )}
              {documents.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-2">{d.type}</td>
                  <td className="px-4 py-2">{d.version}</td>
                  <td className="px-4 py-2">{d.status}</td>
                  <td className="px-4 py-2">
                    {d.status === "Draft" && profile?.role === "punong" && (
                      <button onClick={() => handleApprove(d.id)} className="text-primary font-medium">
                        Approve
                      </button>
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
