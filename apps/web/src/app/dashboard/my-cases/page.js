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

export default function MyCasesPage() {
  const profile = useCurrentProfile();
  const [cases, setCases] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/complaints")
      .then(setCases)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold">My Cases</h1>
        <p className="text-sm text-foreground-muted mt-1">Complaints you filed or are named in.</p>
      </div>

      {loading && <p className="text-foreground-muted">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && cases.length === 0 && (
        <p className="text-foreground-muted">You have no cases on record.</p>
      )}

      {cases.length > 0 && (
        <div className="bg-white/90 rounded-sm border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left border-b-2 border-brass/40">
              <tr>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Reference</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Title</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Your role</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/60 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/cases/${c.id}`} className="ref-number text-primary hover:underline font-medium">
                      {c.reference_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{c.title}</td>
                  <td className="px-4 py-3">
                    {profile && c.complainant_id === profile.id ? "Complainant" : "Respondent"}
                  </td>
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
