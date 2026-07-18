"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import { useCurrentProfile } from "@/lib/useCurrentProfile";
import Icon from "@/components/Icon";

const STATUS_COLOR = {
  Closed: "text-accent",
  Active: "text-warning",
  "Under Mediation": "text-warning",
  New: "text-primary",
};

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white/90 rounded-sm border border-border p-5">
      <div className="flex items-center gap-2 text-foreground-muted mb-2">
        <Icon name={icon} className="w-4 h-4" />
        <span className="text-xs tracking-wide uppercase">{label}</span>
      </div>
      <p className="font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}

export default function CitizenOverview() {
  const profile = useCurrentProfile();
  const [cases, setCases] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch("/complaints"), apiFetch("/notifications")])
      .then(([complaints, notifs]) => {
        setCases(complaints);
        setNotifications(notifs.slice(0, 5));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-foreground-muted">Loading overview…</p>;
  if (error) return <p className="text-danger">{error}</p>;

  const active = cases.filter((c) => c.status !== "Closed").length;
  const closed = cases.filter((c) => c.status === "Closed").length;
  const recent = [...cases].sort((a, b) => new Date(b.filed_at) - new Date(a.filed_at)).slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Cases" value={cases.length} icon="clipboard-list" />
        <StatCard label="Active" value={active} icon="info" />
        <StatCard label="Closed" value={closed} icon="check-circle" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/90 rounded-sm border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold">My cases</h2>
            <Link href="/dashboard/my-cases" className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          </div>

          {cases.length === 0 && <p className="text-foreground-muted px-5 py-4">You have no cases on record.</p>}

          {cases.length > 0 && (
            <ul>
              {recent.map((c) => (
                <li key={c.id} className="border-t border-border first:border-t-0">
                  <Link
                    href={`/dashboard/cases/${c.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-muted transition-colors"
                  >
                    <span className="min-w-0">
                      <span className="ref-number block">{c.reference_number}</span>
                      <span className="text-foreground-muted truncate block">
                        {profile && c.complainant_id === profile.id ? "Complainant" : "Respondent"} · {c.title}
                      </span>
                    </span>
                    <span className={`stamp shrink-0 ${STATUS_COLOR[c.status] || "text-foreground-muted"}`}>{c.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white/90 rounded-sm border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold">Recent notifications</h2>
            <Link href="/dashboard/notifications" className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          </div>

          {notifications.length === 0 && <p className="text-foreground-muted px-5 py-4">No notifications yet.</p>}

          {notifications.length > 0 && (
            <ul>
              {notifications.map((n) => (
                <li key={n.id} className="px-5 py-3 border-t border-border first:border-t-0 text-sm">
                  <p>{n.message}</p>
                  <p className="text-foreground-muted text-xs mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
