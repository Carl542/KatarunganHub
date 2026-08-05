"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import { useCurrentProfile } from "@/lib/useCurrentProfile";
import Icon from "@/components/Icon";
import StatCard from "@/components/StatCard";

const STATUS_COLOR = {
  Sent: "text-accent",
  Queued: "text-warning",
  Failed: "text-danger",
};

const STATUS_DISPLAY = {
  Sent: "Delivered",
  Queued: "Queued",
  Failed: "Failed",
};

const DEFAULT_FILTERS = { dateRange: "all", channel: "all", status: "all", caseId: "all" };
const PAGE_SIZE_OPTIONS = [10, 25, 50];

function withinDateRange(dateStr, range) {
  if (range === "all") return true;
  const date = new Date(dateStr);
  const now = new Date();
  const days = range === "today" ? 1 : range === "7days" ? 7 : 30;
  const cutoff = new Date(now.getTime() - days * 86400000);
  return date >= cutoff;
}

export default function NotificationsPage() {
  const profile = useCurrentProfile();
  const isCitizen = ["complainant", "respondent"].includes(profile?.role);

  const [notifications, setNotifications] = useState([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/notifications")
      .then(setNotifications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const channels = useMemo(() => [...new Set(notifications.map((n) => n.channel).filter(Boolean))], [notifications]);
  const cases = useMemo(() => {
    const map = new Map();
    for (const n of notifications) {
      if (n.complaint?.reference_number) map.set(n.complaint_id, n.complaint.reference_number);
    }
    return [...map.entries()];
  }, [notifications]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return notifications.filter((n) => {
      if (!withinDateRange(n.created_at, filters.dateRange)) return false;
      if (filters.channel !== "all" && n.channel !== filters.channel) return false;
      if (filters.status !== "all" && n.status !== filters.status) return false;
      if (filters.caseId !== "all" && n.complaint_id !== filters.caseId) return false;
      if (!q) return true;
      return (
        (n.message || "").toLowerCase().includes(q) ||
        (n.channel || "").toLowerCase().includes(q) ||
        (n.status || "").toLowerCase().includes(q)
      );
    });
  }, [notifications, query, filters]);

  useEffect(() => {
    setPage(1);
  }, [query, filters, pageSize]);

  const total = notifications.length;
  const delivered = notifications.filter((n) => n.status === "Sent").length;
  const pending = notifications.filter((n) => n.status === "Queued").length;
  const failed = notifications.filter((n) => n.status === "Failed").length;
  const deliveredPct = total > 0 ? Math.round((delivered / total) * 100) : 0;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, filtered.length);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setQuery("");
  }

  function exportCsv() {
    const rows = [
      ["Date", "Message", "Channel", "Status", "Case"],
      ...filtered.map((n) => [
        new Date(n.created_at).toLocaleString("en-PH"),
        n.message,
        n.channel,
        STATUS_DISPLAY[n.status] || n.status,
        n.complaint?.reference_number || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notifications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
        <Icon name="refresh-cw" className="w-6 h-6 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Loading notifications…</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-rose-600 bg-rose-50 border border-rose-200 rounded-md p-4 text-sm font-medium">{error}</p>;
  }

  // CITIZEN PERSONAL NOTIFICATIONS INBOX VIEW
  if (isCitizen) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12 text-slate-800">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">Updates and SMS alerts regarding your registered cases.</p>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center flex flex-col items-center gap-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Icon name="bell" className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">No Notifications</h2>
            <p className="text-xs text-slate-500 max-w-md">You have no notification alerts recorded yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex items-start justify-between gap-4 transition-colors hover:border-slate-300"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                    <Icon name="bell" className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{n.message}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>
                        {new Date(n.created_at).toLocaleString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      {n.complaint?.reference_number && (
                        <>
                          <span>·</span>
                          <Link
                            href={`/dashboard/cases/${n.complaint_id}`}
                            className="font-mono text-blue-600 font-bold hover:underline"
                          >
                            {n.complaint.reference_number}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ADMIN / STAFF SMS TELEMETRY DASHBOARD VIEW
  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-foreground-muted mt-1">Delivery history for SMS and email alerts.</p>
        </div>
        {notifications.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Icon
              name="search"
              className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search notifications…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border border-border rounded-sm pl-9 pr-3 py-2 min-h-11 bg-white w-full focus-visible:outline-3 focus-visible:outline-primary"
            />
          </div>
        )}
      </div>

      {notifications.length === 0 && <p className="text-foreground-muted">No notifications yet.</p>}

      {notifications.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard label="All Notifications" value={total} icon="bell" color="primary" subtitle="Total notifications" />
            <StatCard
              label="Delivered"
              value={delivered}
              icon="check-circle"
              color="accent"
              subtitle={`${deliveredPct}% delivered`}
            />
            <StatCard label="Pending" value={pending} icon="clock" color="warning" subtitle="Waiting for delivery" />
            <StatCard label="Failed" value={failed} icon="x-circle" color="danger" subtitle="Delivery failed" />
          </div>

          <div className="bg-white/90 rounded-sm border border-border p-4 mb-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Date range</span>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Channel</span>
              <select
                value={filters.channel}
                onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
                className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
              >
                <option value="all">All Channels</option>
                {channels.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Status</span>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
              >
                <option value="all">All Statuses</option>
                {Object.keys(STATUS_DISPLAY).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_DISPLAY[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Case</span>
              <select
                value={filters.caseId}
                onChange={(e) => setFilters({ ...filters, caseId: e.target.value })}
                className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
              >
                <option value="all">All Cases</option>
                {cases.map(([id, ref]) => (
                  <option key={id} value={id}>
                    {ref}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={resetFilters}
              className="border border-border rounded-sm hover:bg-muted transition-colors min-h-11 px-4 py-2 font-medium"
            >
              Reset Filters
            </button>
            <button
              onClick={exportCsv}
              className="border border-border rounded-sm hover:bg-muted transition-colors min-h-11 px-4 py-2 font-medium flex items-center gap-2"
            >
              <Icon name="upload" className="w-4 h-4" />
              Export
            </button>
          </div>

          {filtered.length === 0 ? (
            <p className="text-foreground-muted">No notifications match your filters.</p>
          ) : (
            <div className="bg-white/90 rounded-sm border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary-light text-left border-b-2 border-brass/40">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Date</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Message</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Channel</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Status</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Case</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((n) => (
                    <tr key={n.id} className="border-t border-border hover:bg-muted/60 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-foreground-muted">
                        {new Date(n.created_at).toLocaleString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">{n.message}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <Icon name="mail" className="w-4 h-4 text-foreground-muted" />
                          {n.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`stamp ${STATUS_COLOR[n.status] || "text-foreground-muted"}`}>
                          {STATUS_DISPLAY[n.status] || n.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {n.complaint?.reference_number ? (
                          <Link href={`/dashboard/cases/${n.complaint_id}`} className="ref-number text-primary hover:underline">
                            {n.complaint.reference_number}
                          </Link>
                        ) : (
                          <span className="text-foreground-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border">
                <p className="text-sm text-foreground-muted">
                  Showing {pageStart} to {pageEnd} of {filtered.length} notification{filtered.length === 1 ? "" : "s"}
                </p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-foreground-muted">
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="border border-border rounded-sm px-2 py-1.5 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                    >
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n} / page
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border border-border rounded-sm px-3 min-h-9 text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <span className="text-sm text-foreground-muted px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border border-border rounded-sm px-3 min-h-9 text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
