"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

export default function ReportsPage() {
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "", filedBy: "" });
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      if (filters.filedBy) params.set("filedBy", filters.filedBy);
      const data = await apiFetch(`/reports/summary?${params.toString()}`);
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      <div className="bg-white/90 rounded-sm border border-border p-4 mb-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Filed from</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Filed to</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Filed by (staff ID)</span>
          <input
            value={filters.filedBy}
            onChange={(e) => setFilters({ ...filters, filedBy: e.target.value })}
            className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
          />
        </label>
        <button onClick={load} className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 px-4 py-2 font-medium">
          Apply
        </button>
      </div>

      {loading && <p className="text-foreground-muted">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {summary && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/90 rounded-sm border border-border p-4">
              <p className="text-sm text-foreground-muted">Total cases</p>
              <p className="text-3xl font-bold">{summary.total}</p>
            </div>
            <div className="bg-white/90 rounded-sm border border-border p-4">
              <p className="text-sm text-foreground-muted">Active</p>
              <p className="text-3xl font-bold">{summary.active}</p>
            </div>
            <div className="bg-white/90 rounded-sm border border-border p-4">
              <p className="text-sm text-foreground-muted">Closed</p>
              <p className="text-3xl font-bold">{summary.closed}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/90 rounded-sm border border-border p-4">
              <h2 className="font-bold mb-2">By status</h2>
              {Object.entries(summary.byStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between text-sm py-1 border-t first:border-0">
                  <span>{status}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
            <div className="bg-white/90 rounded-sm border border-border p-4">
              <h2 className="font-bold mb-2">By type</h2>
              {Object.entries(summary.byType).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm py-1 border-t first:border-0">
                  <span>{type}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
