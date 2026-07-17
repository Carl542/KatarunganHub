"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import Icon from "@/components/Icon";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ROLES } from "@/lib/roles";

const CHART_COLORS = ["#0038a8", "#c9a227", "#3f6b4b", "#c8102e", "#786956", "#9c6b1f"];

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

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch("/users"), apiFetch("/lupon-profiles"), apiFetch("/audit-logs")])
      .then(([users, luponProfiles, auditLogs]) => {
        const byRole = {};
        for (const u of users) byRole[u.role] = (byRole[u.role] || 0) + 1;

        setStats({
          total: users.length,
          active: users.filter((u) => u.status === "Active" || !u.status).length,
          lupon: luponProfiles.length,
          byRole,
        });
        setActivity(auditLogs.slice(0, 5));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-foreground-muted">Loading overview…</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Users" value={stats.total} href="/dashboard/users" icon="users" />
        <StatCard label="Active Accounts" value={stats.active} href="/dashboard/users" icon="user-check" />
        <StatCard label="Lupon Members" value={stats.lupon} href="/dashboard/lupon-members" icon="users" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        <div className="bg-white/90 rounded-sm border border-border p-5">
          <h2 className="font-display text-lg font-semibold mb-2">Users by role</h2>
          {Object.keys(stats.byRole).length === 0 ? (
            <p className="text-foreground-muted text-sm">No users yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={Object.entries(stats.byRole).map(([role, value]) => ({ name: ROLES[role] || role, value }))}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={78}
                  >
                    {Object.keys(stats.byRole).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {Object.entries(stats.byRole).map(([role, count], i) => (
                <div key={role} className="flex justify-between text-sm py-1 border-t border-border first:border-0">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      aria-hidden="true"
                    />
                    {ROLES[role] || role}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </>
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
