"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { ROLES } from "@/lib/roles";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiFetch("/users")
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateUser(id, changes) {
    try {
      await apiFetch(`/users/${id}`, { method: "PATCH", body: JSON.stringify(changes) });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function savePhoneNumber(id, value) {
    if (value.trim()) updateUser(id, { phone_number: value.trim() });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Accounts</h1>

      {loading && <p className="text-foreground-muted">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {users.length > 0 && (
        <div className="bg-white/90 rounded-sm border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Phone Number</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">{u.full_name}</td>
                  <td className="px-4 py-2">
                    <select
                      value={u.role}
                      onChange={(e) => updateUser(u.id, { role: e.target.value })}
                      className="border rounded-sm px-2 py-1"
                    >
                      {Object.entries(ROLES).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="tel"
                      defaultValue={u.phone_number || ""}
                      placeholder="09171234567"
                      onBlur={(e) => savePhoneNumber(u.id, e.target.value)}
                      className="border rounded-sm px-2 py-1 w-36"
                    />
                  </td>
                  <td className="px-4 py-2">{u.status}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        updateUser(u.id, { status: u.status === "Active" ? "Inactive" : "Active" })
                      }
                      className="text-primary font-medium"
                    >
                      {u.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
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
