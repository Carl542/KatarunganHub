"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

const STATUS_COLOR = {
  Sent: "text-accent",
  Queued: "text-warning",
  Failed: "text-danger",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/notifications")
      .then(setNotifications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = notifications.filter((n) => {
    const q = query.toLowerCase();
    return (
      (n.message || "").toLowerCase().includes(q) ||
      (n.channel || "").toLowerCase().includes(q) ||
      (n.status || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-foreground-muted mt-1">Delivery history for SMS and email alerts.</p>
        </div>
        {notifications.length > 0 && (
          <input
            type="search"
            placeholder="Search by message, channel, or status…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white w-full sm:w-72 focus-visible:outline-3 focus-visible:outline-primary"
          />
        )}
      </div>

      {loading && <p className="text-foreground-muted">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && notifications.length === 0 && (
        <p className="text-foreground-muted">No notifications yet.</p>
      )}
      {!loading && notifications.length > 0 && filtered.length === 0 && (
        <p className="text-foreground-muted">No notifications match &ldquo;{query}&rdquo;.</p>
      )}

      {filtered.length > 0 && (
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
              {filtered.map((n) => (
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
                  <td className="px-4 py-3">{n.channel}</td>
                  <td className="px-4 py-3">
                    <span className={`stamp ${STATUS_COLOR[n.status] || "text-foreground-muted"}`}>{n.status}</span>
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
        </div>
      )}
    </div>
  );
}
