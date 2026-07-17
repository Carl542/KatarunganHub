"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import Icon from "@/components/Icon";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DonutChart from "@/components/DonutChart";

const MEDIATION_PERIOD_DAYS = 15; // Katarungang Pambarangay statutory mediation period (RA 7160 Sec. 410)

function StatCard({ label, value, href, icon }) {
  return (
    <div className="bg-white/90 rounded-sm border border-border p-5">
      <div className="flex items-center gap-2 text-foreground-muted mb-2">
        <Icon name={icon} className="w-4 h-4" />
        <span className="text-xs tracking-wide uppercase">{label}</span>
      </div>
      <p className="font-display text-3xl font-semibold">{value}</p>
      <Link href={href} className="text-sm text-primary font-medium hover:underline">
        View details
      </Link>
    </div>
  );
}

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
  const [cases, setCases] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch("/complaints"), apiFetch("/schedules"), apiFetch("/audit-logs")])
      .then(([complaints, schedules, auditLogs]) => {
        setCases(complaints);
        setUpcoming(schedules.filter((s) => new Date(s.scheduled_at) >= new Date()).slice(0, 5));
        setActivity(auditLogs.slice(0, 5));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-foreground-muted">Loading overview…</p>;
  if (error) return <p className="text-danger">{error}</p>;

  const pending = cases.filter((c) => c.status === "New").length;
  const underMediation = cases.filter((c) => c.status === "Under Mediation" || c.status === "Active").length;
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
    .filter((c) => c.status !== "Closed")
    .map((c) => {
      const daysElapsed = Math.floor((Date.now() - new Date(c.filed_at)) / 86400000);
      return { ...c, daysLeft: MEDIATION_PERIOD_DAYS - daysElapsed };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Cases" value={cases.length} href="/dashboard/cases" icon="clipboard-list" />
        <StatCard label="Pending Cases" value={pending} href="/dashboard/cases" icon="file-text" />
        <StatCard label="Under Mediation" value={underMediation} href="/dashboard/cases" icon="info" />
        <StatCard label="Resolved Cases" value={resolved} href="/dashboard/cases" icon="check-circle" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-white/90 rounded-sm border border-border p-5">
          <h2 className="font-display text-lg font-semibold mb-2">Cases per month</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={perMonth}>
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#786956" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#786956" }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3f6b4b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/90 rounded-sm border border-border p-5">
          <h2 className="font-display text-lg font-semibold mb-3">Cases by status</h2>
          <DonutChart data={byStatus} centerValue={cases.length} centerLabel="Total" />
        </div>

        <div className="bg-white/90 rounded-sm border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold">Recent activities</h2>
            <Link href="/dashboard/audit-logs" className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          </div>
          {activity.length === 0 && <p className="text-foreground-muted px-5 py-4">No recent activity.</p>}
          {activity.length > 0 && (
            <ul>
              {activity.map((entry) => (
                <li key={entry.id} className="px-5 py-3 border-t border-border first:border-t-0 text-sm">
                  {entry.action}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/90 rounded-sm border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold">Upcoming mediation schedule</h2>
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
                    className="flex items-center justify-between px-5 py-3 text-sm hover:bg-muted transition-colors"
                  >
                    <span>
                      {s.complaint?.reference_number && (
                        <span className="ref-number text-foreground-muted mr-2 text-xs">
                          {s.complaint.reference_number}
                        </span>
                      )}
                      {s.type}
                    </span>
                    <span className="text-foreground-muted whitespace-nowrap ml-4">
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
