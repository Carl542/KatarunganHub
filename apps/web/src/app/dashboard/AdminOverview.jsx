"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import Icon from "@/components/Icon";
import { Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ROLES } from "@/lib/roles";
import DonutChart, { CHART_COLORS } from "@/components/DonutChart";

const SHORT_ROLE_LABELS = {
  admin: "Admin",
  punong: "Punong Brgy",
  secretary: "Secretary",
  lupon: "Lupon Member",
  complainant: "Complainant",
  respondent: "Respondent",
};

function StatCard({ label, value, href, icon }) {
  return (
    <div className="bg-white/90 rounded-sm border border-border p-5">
      <div className="flex items-center gap-2 text-foreground-muted mb-2">
        <Icon name={icon} className="w-4 h-4" />
        <span className="text-xs tracking-wide uppercase">{label}</span>
      </div>
      <p className="font-display text-3xl font-semibold">{value}</p>
      <Link href={href} className="text-sm text-primary font-medium hover:underline">
        View
      </Link>
    </div>
  );
}

function DonutCard({ title, data }) {
  return (
    <div className="bg-white/90 rounded-sm border border-border p-5">
      <h2 className="font-display text-lg font-semibold mb-3">{title}</h2>
      <DonutChart data={data} />
    </div>
  );
}

function RoleBarCard({ title, data }) {
  const rows = Object.entries(data).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white/90 rounded-sm border border-border p-5">
      <h2 className="font-display text-lg font-semibold mb-3">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-foreground-muted text-sm">No data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(160, rows.length * 34)}>
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 20, bottom: 4, left: 4 }} barCategoryGap="28%">
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#786956" }} />
            <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 11, fill: "#786956" }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={18}>
              {rows.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/users"),
      apiFetch("/lupon-profiles"),
      apiFetch("/audit-logs"),
      apiFetch("/reports/summary"),
      apiFetch("/schedules"),
    ])
      .then(([users, luponProfiles, auditLogs, caseSummary, schedules]) => {
        const byRole = {};
        for (const u of users) byRole[u.role] = (byRole[u.role] || 0) + 1;

        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.status === "Active" || !u.status).length,
          lupon: luponProfiles.length,
          totalCases: caseSummary.total,
          activeCases: caseSummary.active,
          byRole,
          byStatus: caseSummary.byStatus,
        });
        setActivity(auditLogs.slice(0, 5));
        setUpcoming(schedules.filter((s) => new Date(s.scheduled_at) >= new Date()).slice(0, 5));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-foreground-muted">Loading overview…</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={stats.totalUsers} href="/dashboard/users" icon="users" />
        <StatCard label="Active Accounts" value={stats.activeUsers} href="/dashboard/users" icon="user-check" />
        <StatCard label="Total Cases" value={stats.totalCases} href="/dashboard/reports" icon="clipboard-list" />
        <StatCard label="Active Cases" value={stats.activeCases} href="/dashboard/reports" icon="clipboard-list" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <DonutCard title="Cases by status" data={stats.byStatus} />
        <RoleBarCard title="Users by role" data={Object.fromEntries(Object.entries(stats.byRole).map(([r, n]) => [SHORT_ROLE_LABELS[r] || ROLES[r] || r, n]))} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/90 rounded-sm border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold">Upcoming schedule</h2>
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
                      {s.type}
                      {s.complaint?.reference_number && (
                        <span className="ref-number text-foreground-muted ml-2 text-xs">
                          {s.complaint.reference_number}
                        </span>
                      )}
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
            <h2 className="font-display text-lg font-semibold">Recent activity</h2>
            <Link href="/dashboard/audit-logs" className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          </div>

          {activity.length === 0 && <p className="text-foreground-muted px-5 py-4">No recent activity.</p>}

          {activity.length > 0 && (
            <ul>
              {activity.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between px-5 py-3 border-t border-border first:border-t-0 text-sm">
                  <span>{entry.action}</span>
                  <span className="text-foreground-muted whitespace-nowrap ml-4">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
