"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/audit-logs")
      .then(setLogs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Audit Logs</h1>
      <p className="text-sm text-gray-500 mb-4">Read-only record of staff actions.</p>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && logs.length === 0 && <p className="text-gray-500">No audit entries yet.</p>}

      {logs.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Actor</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Module</th>
                <th className="px-4 py-2">Case</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-xs">{l.actor_id}</td>
                  <td className="px-4 py-2">{l.action}</td>
                  <td className="px-4 py-2">{l.module}</td>
                  <td className="px-4 py-2 text-xs">{l.complaint_id || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
