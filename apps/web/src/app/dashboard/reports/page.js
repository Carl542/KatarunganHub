"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DonutChart, { CHART_COLORS } from "@/components/DonutChart";
import UserPicker from "@/components/UserPicker";
import StatCard from "@/components/StatCard";
import { tooltipStyle, barCursorFill } from "@/lib/chartTheme";

const STAFF_ROLES = ["admin", "punong", "secretary", "lupon"];

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

  const resolutionRate = summary && summary.total > 0 ? Math.round((summary.closed / summary.total) * 100) : 0;
  const byTypeRows = summary ? toChartData(summary.byType) : [];

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-foreground-muted mt-1">Case volume and outcomes across the barangay.</p>
      </div>

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
          <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Filed by</span>
          <UserPicker
            roles={STAFF_ROLES}
            value={filters.filedBy}
            onChange={(v) => setFilters({ ...filters, filedBy: v })}
            placeholder="Any staff member"
          />
        </label>
        <button
          onClick={load}
          className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 px-4 py-2 font-medium"
        >
          Apply
        </button>
      </div>

      {loading && <p className="text-foreground-muted">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Cases" value={summary.total} icon="clipboard-list" color="primary" />
            <StatCard label="Active" value={summary.active} icon="info" color="warning" />
            <StatCard label="Closed" value={summary.closed} icon="check-circle" color="accent" />
            <StatCard label="Resolution Rate" value={`${resolutionRate}%`} icon="shield" color="brass" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/90 rounded-sm border border-border p-4">
              <h2 className="font-display text-lg font-semibold mb-3">By status</h2>
              {Object.keys(summary.byStatus).length === 0 ? (
                <p className="text-foreground-muted text-sm">No data for this range.</p>
              ) : (
                <DonutChart data={summary.byStatus} centerValue={summary.total} centerLabel="Total" />
              )}
            </div>
            <div className="bg-white/90 rounded-sm border border-border p-4">
              <h2 className="font-display text-lg font-semibold mb-3">By type</h2>
              {byTypeRows.length === 0 ? (
                <p className="text-foreground-muted text-sm">No data for this range.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={byTypeRows}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#786956" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#786956" }} />
                    <Tooltip {...tooltipStyle} cursor={{ fill: barCursorFill }} />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={64}>
                      {byTypeRows.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white/90 rounded-sm border border-border p-4">
              <h2 className="font-display text-lg font-semibold mb-3">By category</h2>
              {Object.keys(summary.byCategory || {}).length === 0 ? (
                <p className="text-foreground-muted text-sm">No data for this range.</p>
              ) : (
                <DonutChart data={summary.byCategory} />
              )}
            </div>
            <div className="bg-white/90 rounded-sm border border-border p-4">
              <h2 className="font-display text-lg font-semibold mb-3">By priority</h2>
              {Object.keys(summary.byPriority || {}).length === 0 ? (
                <p className="text-foreground-muted text-sm">No data for this range.</p>
              ) : (
                <DonutChart data={summary.byPriority} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
