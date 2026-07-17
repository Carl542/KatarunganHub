"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/notifications")
      .then(setNotifications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      {loading && <p className="text-foreground-muted">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && notifications.length === 0 && (
        <p className="text-foreground-muted">No notifications yet.</p>
      )}

      {notifications.length > 0 && (
        <div className="bg-white/90 rounded-sm border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Channel</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id} className="border-t">
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(n.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{n.message}</td>
                  <td className="px-4 py-2">{n.channel}</td>
                  <td className="px-4 py-2">{n.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
