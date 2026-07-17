"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CHART_COLORS = ["#0038a8", "#c9a227", "#3f6b4b", "#c8102e", "#786956", "#9c6b1f"];

function toChartData(obj) {
  return Object.entries(obj).map(([name, value]) => ({ name, value }));
}

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/90 rounded-sm border border-border p-4">
              <h2 className="font-display text-lg font-semibold mb-2">By status</h2>
              {Object.keys(summary.byStatus).length === 0 ? (
                <p className="text-foreground-muted text-sm">No data for this range.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={toChartData(summary.byStatus)} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78}>
                        {toChartData(summary.byStatus).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {Object.entries(summary.byStatus).map(([status, count], i) => (
                    <div key={status} className="flex justify-between text-sm py-1 border-t border-border first:border-0">
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                          aria-hidden="true"
                        />
                        {status}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
            <div className="bg-white/90 rounded-sm border border-border p-4">
              <h2 className="font-display text-lg font-semibold mb-2">By type</h2>
              {Object.keys(summary.byType).length === 0 ? (
                <p className="text-foreground-muted text-sm">No data for this range.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={toChartData(summary.byType)}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#786956" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#786956" }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0038a8" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
