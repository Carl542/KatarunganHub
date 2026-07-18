"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import { useCurrentProfile } from "@/lib/useCurrentProfile";

const STATUS_COLOR = {
  Closed: "text-accent",
  Active: "text-warning",
  "Under Mediation": "text-warning",
  New: "text-primary",
};

export default function CasesPage() {
  const profile = useCurrentProfile();
  const [cases, setCases] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/complaints")
      .then(setCases)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cases.filter((c) => {
    const q = query.toLowerCase();
    return (
      (c.reference_number || "").toLowerCase().includes(q) ||
      (c.title || "").toLowerCase().includes(q) ||
      (c.status || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Cases</h1>
          <p className="text-sm text-foreground-muted mt-1">Complaints filed at the barangay and their status.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {cases.length > 0 && (
            <input
              type="search"
              placeholder="Search by reference, title, or status…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white w-full sm:w-72 focus-visible:outline-3 focus-visible:outline-primary"
            />
          )}
          {profile?.role === "secretary" && (
            <Link
              href="/dashboard/cases/register"
              className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 px-4 py-2 text-sm font-medium whitespace-nowrap"
            >
              Register Case
            </Link>
          )}
        </div>
      </div>

      {loading && <p className="text-foreground-muted">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && cases.length === 0 && (
        <p className="text-foreground-muted">No cases found.</p>
      )}
      {!loading && cases.length > 0 && filtered.length === 0 && (
        <p className="text-foreground-muted">No cases match &ldquo;{query}&rdquo;.</p>
      )}

      {filtered.length > 0 && (
        <div className="bg-white/90 rounded-sm border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left border-b-2 border-brass/40">
              <tr>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Reference</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Title</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Type</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/60 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/cases/${c.id}`} className="ref-number text-primary hover:underline font-medium">
                      {c.reference_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{c.title}</td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3">
                    <span className={`stamp ${STATUS_COLOR[c.status] || "text-foreground-muted"}`}>{c.status}</span>
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
