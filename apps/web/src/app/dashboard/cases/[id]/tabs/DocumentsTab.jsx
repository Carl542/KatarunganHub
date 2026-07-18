"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiDownload } from "@/lib/apiClient";
import { useCurrentProfile } from "@/lib/useCurrentProfile";
import Icon from "@/components/Icon";
import { DOCUMENT_TYPES } from "@/lib/documentTypes";

export default function DocumentsTab({ caseId }) {
  const profile = useCurrentProfile();
  const [documents, setDocuments] = useState([]);
  const [type, setType] = useState(DOCUMENT_TYPES[0]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", type);
      if (file) formData.append("file", file);

      await apiFetch(`/complaints/${caseId}/documents`, { method: "POST", body: formData });
      setFile(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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

  async function handleDownload(doc) {
    setError("");
    try {
      await apiDownload(`/complaints/${caseId}/documents/${doc.id}/download`, doc.original_filename);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleCreate} className="bg-white/90 rounded-sm border border-border p-5 flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold">Case Documents</h2>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Document type</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary">
              {DOCUMENT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">File (optional)</span>
            <span className="border border-border rounded-sm px-3 min-h-11 bg-white text-sm flex items-center gap-2 cursor-pointer focus-within:outline-3 focus-within:outline-primary">
              <Icon name="upload" className="w-4 h-4 text-foreground-muted shrink-0" />
              <span className="text-foreground-muted truncate">{file ? file.name : "Choose file…"}</span>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="sr-only"
              />
            </span>
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 py-2 font-medium px-4 disabled:opacity-60"
          >
            {submitting ? "Uploading…" : "Create document"}
          </button>
        </div>
      </form>

      {error && <p className="text-danger text-sm">{error}</p>}

      {loading ? (
        <p className="text-foreground-muted">Loading…</p>
      ) : (
        <div className="bg-white/90 rounded-sm border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left">
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">File</th>
                <th className="px-4 py-2">Version</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 && (
                <tr>
                  <td className="px-4 py-16 text-center text-foreground-muted" colSpan={5}>
                    No documents yet.
                  </td>
                </tr>
              )}
              {documents.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-2">{d.type}</td>
                  <td className="px-4 py-2">
                    {d.storage_path ? (
                      <button onClick={() => handleDownload(d)} className="text-primary font-medium hover:underline">
                        {d.original_filename || "Download"}
                      </button>
                    ) : (
                      <span className="text-foreground-muted">—</span>
                    )}
                  </td>
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
