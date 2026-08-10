"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import { useCurrentProfile } from "@/lib/useCurrentProfile";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DonutChart from "@/components/DonutChart";
import CaseBreakdownChart from "@/components/CaseBreakdownChart";
import StatCard from "@/components/StatCard";
import Icon from "@/components/Icon";
import { tooltipStyle, lineCursorStroke } from "@/lib/chartTheme";

const MEDIATION_PERIOD_DAYS = 15; // Katarungang Pambarangay statutory mediation period (RA 7160 Sec. 410)

const STATUS_COLOR = {
  Closed: "text-accent",
  Active: "text-warning",
  "Under Mediation": "text-warning",
  New: "text-primary",
};

function lastNMonths(n) {
  const now = new Date();
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-PH", { month: "short" }) });
  }
  return out;
}

export default function CaseOverview() {
  const profile = useCurrentProfile();
  const [cases, setCases] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOverview = () => {
    setLoading(true);
    setError("");
    Promise.all([apiFetch("/complaints"), apiFetch("/schedules")])
      .then(([complaints, schedules]) => {
        setCases(complaints);
        setUpcoming(schedules.filter((s) => new Date(s.scheduled_at) >= new Date()).slice(0, 5));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) return <p className="text-foreground-muted">Loading overview…</p>;
  if (error)
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-md p-6 max-w-xl my-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-rose-800 font-semibold text-base">
          <Icon name="alert-circle" className="w-5 h-5 shrink-0 text-rose-600" />
          <span>Server Connection Issue</span>
        </div>
        <p className="text-sm text-rose-700">
          {error.includes("Failed to fetch")
            ? "Could not reach the backend server API. If the server was sleeping (Render free tier), it may take 20-30 seconds to wake up."
            : error}
        </p>
        <button
          onClick={fetchOverview}
          className="self-start px-4 py-2 bg-rose-700 text-white font-medium text-sm rounded-md hover:bg-rose-800 transition-colors shadow-sm flex items-center gap-2"
        >
          <Icon name="refresh-cw" className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );

  const pending = cases.filter((c) => c.status === "New").length;
  // "Under Mediation" (Lupon) and "Active" (Non-Lupon) are the two statuses a
  // case can carry once it's past intake and not yet closed. They're
  // different processes under the hood, so this card is labeled "In
  // Progress" rather than "Under Mediation" — Non-Lupon cases are never
  // actually mediated.
  const inProgress = cases.filter((c) => c.status === "Under Mediation" || c.status === "Active").length;
  const resolved = cases.filter((c) => c.status === "Closed").length;

  const byStatus = {};
  for (const c of cases) byStatus[c.status] = (byStatus[c.status] || 0) + 1;

  const months = lastNMonths(6);
  const perMonth = months.map(({ key, label }) => ({
    label,
    count: cases.filter((c) => {
      const d = new Date(c.filed_at);
      return `${d.getFullYear()}-${d.getMonth()}` === key;
    }).length,
  }));

  const priority = cases
    // The 15-day statutory mediation period only applies to cases actually
    // covered by the Katarungang Pambarangay process. Non-Lupon cases are
    // referred straight to the proper office/court and were never on this
    // clock, so they must not compete for "priority" here.
    .filter((c) => c.status !== "Closed" && c.type === "Lupon")
    .map((c) => {
      const daysElapsed = Math.floor((Date.now() - new Date(c.filed_at)) / 86400000);
      return { ...c, daysLeft: MEDIATION_PERIOD_DAYS - daysElapsed };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  const recentCases = [...cases].sort((a, b) => new Date(b.filed_at) - new Date(a.filed_at)).slice(0, 5);
  const isSecretary = profile?.role === "secretary";

  return (
    <div>
      <div className="bg-white/90 rounded-sm border border-border p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-base font-semibold">Quick Actions</h2>
          <p className="text-xs text-foreground-muted">Shortcuts for case registration, scheduling, and management.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {isSecretary && (
            <Link
              href="/dashboard/cases/register"
              className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-10 px-4 py-2 text-sm font-medium flex items-center gap-2"
            >
              <Icon name="file-text" className="w-4 h-4" />
              + Register New Case
            </Link>
          )}
          <Link
            href="/dashboard/schedules"
            className="border border-border bg-white text-foreground rounded-sm hover:bg-muted transition-colors min-h-10 px-4 py-2 text-sm font-medium flex items-center gap-2"
          >
            <Icon name="calendar" className="w-4 h-4 text-primary" />
            Schedule Hearing
          </Link>
          <Link
            href="/dashboard/lupon-members"
            className="border border-border bg-white text-foreground rounded-sm hover:bg-muted transition-colors min-h-10 px-4 py-2 text-sm font-medium flex items-center gap-2"
          >
            <Icon name="users" className="w-4 h-4 text-primary" />
            Lupon Directory
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Cases" value={cases.length} href="/dashboard/cases" icon="clipboard-list" color="primary" />
        <StatCard label="Pending Cases" value={pending} href="/dashboard/cases" icon="file-text" color="warning" />
        <StatCard label="In Progress" value={inProgress} href="/dashboard/cases" icon="info" color="brass" />
        <StatCard label="Resolved Cases" value={resolved} href="/dashboard/cases" icon="check-circle" color="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 items-stretch">
        <div className="bg-white/90 rounded-sm border border-border p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Cases per month</h2>
            <p className="text-xs text-foreground-muted mt-0.5 mb-3">Monthly case filing volume</p>
          </div>
          <div className="w-full flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={perMonth}>
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#786956" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#786956" }} />
                <Tooltip {...tooltipStyle} cursor={{ stroke: lineCursorStroke }} />
                <Line type="monotone" dataKey="count" stroke="#3f6b4b" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <CaseBreakdownChart
          title="Cases by status"
          subtitle="Breakdown by workflow stage"
          data={byStatus}
          deltaValue={cases.length > 0 ? Math.round((resolved / cases.length) * 100) : 0}
          deltaLabel="% Resolved"
        />

        <div className="bg-white/90 rounded-sm border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold">Recent cases</h2>
            <Link href="/dashboard/cases" className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          </div>
          {recentCases.length === 0 && <p className="text-foreground-muted px-5 py-4">No cases yet.</p>}
          {recentCases.length > 0 && (
            <ul>
              {recentCases.map((c) => (
                <li key={c.id} className="border-t border-border first:border-t-0">
                  <Link
                    href={`/dashboard/cases/${c.id}`}
                    className="flex items-start justify-between gap-3 px-5 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <span className="min-w-0 leading-tight">
                      <span className="ref-number text-primary block">{c.reference_number}</span>
                      <span className="text-foreground-muted truncate block text-xs mt-0.5">{c.title}</span>
                    </span>
                    <span className={`stamp shrink-0 ${STATUS_COLOR[c.status] || "text-foreground-muted"}`}>{c.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/90 rounded-sm border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <span className="w-7 h-7 rounded-sm bg-[#e3eaf7] text-[#0038a8] flex items-center justify-center shrink-0">
                <Icon name="calendar" className="w-4 h-4" />
              </span>
              Upcoming Mediation Schedule
            </h2>
            <Link href="/dashboard/schedules" className="text-sm text-primary font-medium hover:underline">
              View calendar
            </Link>
          </div>
          {upcoming.length === 0 && <p className="text-foreground-muted px-5 py-4">Nothing scheduled.</p>}
          {upcoming.length > 0 && (
            <ul>
              {upcoming.map((s) => (
                <li key={s.id} className="border-t border-border first:border-t-0">
                  <Link
                    href={`/dashboard/cases/${s.complaint_id}`}
                    className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-muted transition-colors"
                  >
                    <span className="w-8 h-8 rounded-sm bg-[#e3eaf7] text-[#0038a8] flex items-center justify-center shrink-0">
                      <Icon name="calendar" className="w-4 h-4" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block">{s.type}</span>
                      {s.complaint?.reference_number && (
                        <span className="ref-number text-foreground-muted text-xs block">
                          {s.complaint.reference_number}
                        </span>
                      )}
                    </span>
                    <span className="text-foreground-muted whitespace-nowrap">
                      {new Date(s.scheduled_at).toLocaleString("en-PH", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white/90 rounded-sm border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold">Priority cases</h2>
            <span className="text-xs text-foreground-muted" title="Statutory mediation period under RA 7160 Sec. 410">
              15-day KP deadline
            </span>
          </div>
          {priority.length === 0 && <p className="text-foreground-muted px-5 py-4">No active cases.</p>}
          {priority.length > 0 && (
            <ul>
              {priority.map((c) => (
                <li key={c.id} className="border-t border-border first:border-t-0">
                  <Link
                    href={`/dashboard/cases/${c.id}`}
                    className="flex items-center justify-between px-5 py-3 text-sm hover:bg-muted transition-colors"
                  >
                    <span className="ref-number">{c.reference_number}</span>
                    <span
                      className={
                        c.daysLeft <= 2
                          ? "stamp text-danger"
                          : c.daysLeft <= 5
                          ? "stamp text-warning"
                          : "text-foreground-muted"
                      }
                    >
                      {c.daysLeft < 0 ? "Overdue" : `${c.daysLeft} day${c.daysLeft === 1 ? "" : "s"} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
