"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { ROLES } from "@/lib/roles";
import Icon from "@/components/Icon";

function initialsFor(fullName) {
  return (fullName || "")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ALL_ROLE_OPTIONS = ["admin", "punong", "secretary", "lupon", "complainant", "respondent"];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ fullName: "", email: "", phoneNumber: "", role: "complainant" });
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [addedCredentials, setAddedCredentials] = useState(null);
  const [resetCredentials, setResetCredentials] = useState(null);
  const [resettingId, setResettingId] = useState(null);

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

  function saveFullName(id, value) {
    if (value.trim()) updateUser(id, { full_name: value.trim() });
  }

  async function handleResetPassword(user) {
    if (!confirm(`Reset password for ${user.full_name}? A new temporary password will be generated.`)) return;
    setResettingId(user.id);
    setError("");
    try {
      const res = await apiFetch(`/users/${user.id}/reset-password`, { method: "POST" });
      setResetCredentials({ userName: user.full_name, tempPassword: res.tempPassword });
    } catch (err) {
      setError(err.message);
    } finally {
      setResettingId(null);
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    if (!addForm.fullName.trim()) return;
    setAddError("");
    setAdding(true);
    try {
      const created = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({
          fullName: addForm.fullName.trim(),
          email: addForm.email.trim() || undefined,
          phoneNumber: addForm.phoneNumber.trim() || undefined,
          role: addForm.role,
        }),
      });
      setAddedCredentials({ email: created.email, tempPassword: created.tempPassword });
      setAddForm({ fullName: "", email: "", phoneNumber: "", role: "complainant" });
      load();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  }

  function closeAddForm() {
    setShowAddForm(false);
    setAddedCredentials(null);
    setAddError("");
    setAddForm({ fullName: "", email: "", phoneNumber: "", role: "complainant" });
  }

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone_number || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">User Accounts</h1>
          <p className="text-sm text-foreground-muted mt-1">
            {users.length} registered account{users.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
          >
            <option value="all">All Roles</option>
            {ALL_ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {ROLES[r]}
              </option>
            ))}
          </select>
          <div className="relative w-full sm:w-64">
            <Icon
              name="search"
              className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search by name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border border-border rounded-sm pl-9 pr-3 py-2 min-h-11 bg-white w-full focus-visible:outline-3 focus-visible:outline-primary"
            />
          </div>
          <button
            onClick={() => (showAddForm ? closeAddForm() : setShowAddForm(true))}
            className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 px-4 py-2 text-sm font-medium whitespace-nowrap"
          >
            {showAddForm ? "Cancel" : "+ Add User"}
          </button>
        </div>
      </div>

      {resetCredentials && (
        <div className="bg-white border border-emerald-300 rounded-lg p-5 mb-6 max-w-lg bg-emerald-50/80 shadow-xs">
          <div className="text-sm">
            <p className="font-bold text-emerald-900 mb-1 flex items-center gap-2">
              <Icon name="check-circle" className="w-5 h-5 text-emerald-600" />
              Password Reset Successful for {resetCredentials.userName}!
            </p>
            <p className="text-xs text-emerald-800 mb-2">
              Give this new temporary password to the user for login:
            </p>
            <p className="font-mono font-bold text-xl text-emerald-900 bg-white border border-emerald-200 rounded px-3 py-2 mb-3 inline-block select-all">
              {resetCredentials.tempPassword}
            </p>
            <div>
              <button
                onClick={() => setResetCredentials(null)}
                className="border border-emerald-300 bg-white rounded-md px-3.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
              >
                Close Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white/90 rounded-sm border border-border p-4 mb-4 max-w-md">
          {addedCredentials ? (
            <div className="text-sm">
              <p className="font-medium text-emerald-700 mb-2">Account created successfully — give these credentials to the user:</p>
              <p className="font-mono text-xs text-slate-800 font-semibold mb-1">Email / Login ID: {addedCredentials.email}</p>
              <p className="font-mono font-bold text-base text-blue-600 mb-3">Temp password: {addedCredentials.tempPassword}</p>
              <button
                onClick={closeAddForm}
                className="border border-border rounded-sm px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddUser} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Full name</span>
                <input
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  placeholder="e.g. James Gimelga"
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Role</span>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary font-medium text-slate-900"
                >
                  {ALL_ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {ROLES[r]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Email (Login ID)</span>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="e.g. james@gmail.com"
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Phone number (optional)</span>
                <input
                  type="tel"
                  value={addForm.phoneNumber}
                  onChange={(e) => setAddForm({ ...addForm, phoneNumber: e.target.value })}
                  placeholder="09171234567"
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                />
              </label>
              {addError && <p className="text-xs text-danger font-medium">{addError}</p>}
              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={closeAddForm}
                  className="border border-border rounded-sm px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding || !addForm.fullName.trim()}
                  className="bg-primary text-white rounded-sm px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-40"
                >
                  {adding ? "Creating…" : "Create account"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {loading && <p className="text-foreground-muted">Loading user accounts…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div className="bg-white/90 rounded-sm border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary-light text-left border-b-2 border-brass/40">
              <tr>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Name</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Login Email</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Role</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Phone Number</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Status</th>
                <th className="px-4 py-3 text-xs font-medium tracking-wide uppercase text-foreground-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/60 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {initialsFor(u.full_name)}
                      </div>
                      <input
                        defaultValue={u.full_name}
                        onBlur={(e) => saveFullName(u.id, e.target.value)}
                        className="bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-border rounded-sm px-1.5 py-1 text-sm font-medium text-foreground w-44"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 select-all">
                    {u.email || <span className="text-slate-400 italic">No email set</span>}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => updateUser(u.id, { role: e.target.value })}
                      className="border border-border rounded-sm px-2 py-1 bg-white text-xs font-medium focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      {ALL_ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {ROLES[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground-muted">
                    <input
                      defaultValue={u.phone_number || ""}
                      placeholder="Add phone…"
                      onBlur={(e) => savePhoneNumber(u.id, e.target.value)}
                      className="bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-border rounded-sm px-1.5 py-1 text-xs font-mono text-foreground-muted w-32"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`stamp text-xs ${
                        u.status === "Inactive"
                          ? "text-foreground-muted border-foreground-muted/30"
                          : "text-accent border-accent/40"
                      }`}
                    >
                      {u.status || "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateUser(u.id, { status: u.status === "Inactive" ? "Active" : "Inactive" })
                        }
                        className="border border-border rounded-sm px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
                      >
                        {u.status === "Inactive" ? "Activate" : "Deactivate"}
                      </button>
                      <button
                        onClick={() => handleResetPassword(u)}
                        disabled={resettingId === u.id}
                        className="border border-blue-600 text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white rounded-sm px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-40"
                      >
                        {resettingId === u.id ? "Resetting…" : "Reset Password"}
                      </button>
                    </div>
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
