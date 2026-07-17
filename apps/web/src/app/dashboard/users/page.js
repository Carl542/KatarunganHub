"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { ROLES } from "@/lib/roles";

function initialsFor(fullName) {
  return (fullName || "")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
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

  const filtered = users.filter((u) => (u.full_name || "").toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">User Accounts</h1>
          <p className="text-sm text-foreground-muted mt-1">{users.length} registered account{users.length === 1 ? "" : "s"}</p>
        </div>
        <input
          type="search"
          placeholder="Search by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white w-full sm:w-64 focus-visible:outline-3 focus-visible:outline-primary"
        />
      </div>

      {loading && <p className="text-foreground-muted">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-foreground-muted">No accounts match &ldquo;{query}&rdquo;.</p>
      )}

      {filtered.length > 0 && (
        <div className="bg-white/90 rounded-sm border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left border-b-2 border-brass/40">
              <tr>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Name</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Role</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Phone Number</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Status</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isActive = u.status === "Active" || !u.status;
                return (
                  <tr key={u.id} className="border-t border-border hover:bg-muted/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full bg-primary-light text-primary font-display font-semibold flex items-center justify-center text-xs shrink-0"
                          aria-hidden="true"
                        >
                          {initialsFor(u.full_name)}
                        </div>
                        <span className="font-medium">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => updateUser(u.id, { role: e.target.value })}
                        className="border border-border rounded-sm px-2 py-1.5 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                      >
                        {Object.entries(ROLES).map(([id, label]) => (
                          <option key={id} value={id}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="tel"
                        defaultValue={u.phone_number || ""}
                        placeholder="09171234567"
                        onBlur={(e) => savePhoneNumber(u.id, e.target.value)}
                        className="ref-number border border-border rounded-sm px-2 py-1.5 w-36 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`stamp ${isActive ? "text-accent" : "text-foreground-muted"}`}>{u.status || "Active"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateUser(u.id, { status: isActive ? "Inactive" : "Active" })}
                        className={`text-xs font-medium rounded-sm px-3 py-1.5 min-h-9 border transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                          isActive
                            ? "border-danger text-danger hover:bg-danger hover:text-white"
                            : "border-accent text-accent hover:bg-accent hover:text-white"
                        }`}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
