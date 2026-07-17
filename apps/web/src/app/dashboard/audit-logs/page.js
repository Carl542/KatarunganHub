"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/audit-logs")
      .then(setLogs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l) => {
    const q = query.toLowerCase();
    return (
      (l.actor?.full_name || "").toLowerCase().includes(q) ||
      (l.action || "").toLowerCase().includes(q) ||
      (l.module || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Audit Logs</h1>
          <p className="text-sm text-foreground-muted mt-1">Read-only record of staff actions.</p>
        </div>
        {logs.length > 0 && (
          <input
            type="search"
            placeholder="Search by actor, action, or module…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white w-full sm:w-72 focus-visible:outline-3 focus-visible:outline-primary"
          />
        )}
      </div>

      {loading && <p className="text-foreground-muted">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && logs.length === 0 && <p className="text-foreground-muted">No audit entries yet.</p>}
      {!loading && logs.length > 0 && filtered.length === 0 && (
        <p className="text-foreground-muted">No entries match &ldquo;{query}&rdquo;.</p>
      )}

      {filtered.length > 0 && (
        <div className="bg-white/90 rounded-sm border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left border-b-2 border-brass/40">
              <tr>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Date</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Actor</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Action</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Module</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Case</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-border hover:bg-muted/60 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-foreground-muted">
                    {new Date(l.created_at).toLocaleString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium">{l.actor?.full_name || l.actor_id || "—"}</td>
                  <td className="px-4 py-3">{l.action}</td>
                  <td className="px-4 py-3">
                    <span className="stamp text-primary">{l.module}</span>
                  </td>
                  <td className="px-4 py-3">
                    {l.complaint?.reference_number ? (
                      <Link href={`/dashboard/cases/${l.complaint_id}`} className="ref-number text-primary hover:underline">
                        {l.complaint.reference_number}
                      </Link>
                    ) : (
                      <span className="text-foreground-muted">—</span>
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
