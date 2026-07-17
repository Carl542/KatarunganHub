"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/complaints")
      .then(setCases)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Cases</h1>
        <Link
          href="/dashboard/cases/register"
          className="bg-primary text-white rounded-md px-4 py-2 text-sm font-medium"
        >
          Register Case
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && cases.length === 0 && (
        <p className="text-gray-500">No cases found.</p>
      )}

      {cases.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left">
              <tr>
                <th className="px-4 py-2">Reference</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2">
                    <Link href={`/dashboard/cases/${c.id}`} className="text-primary font-medium">
                      {c.reference_number}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{c.title}</td>
                  <td className="px-4 py-2">{c.type}</td>
                  <td className="px-4 py-2">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
