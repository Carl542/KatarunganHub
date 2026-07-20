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

const STAFF_ROLE_OPTIONS = ["admin", "punong", "secretary", "lupon"];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ fullName: "", email: "", phoneNumber: "", role: "secretary" });
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [addedCredentials, setAddedCredentials] = useState(null);

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
      setAddForm({ fullName: "", email: "", phoneNumber: "", role: "secretary" });
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
  }

  const filtered = users.filter((u) => (u.full_name || "").toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">User Accounts</h1>
          <p className="text-sm text-foreground-muted mt-1">{users.length} registered account{users.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="search"
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white w-full sm:w-64 focus-visible:outline-3 focus-visible:outline-primary"
          />
          <button
            onClick={() => (showAddForm ? closeAddForm() : setShowAddForm(true))}
            className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 px-4 py-2 text-sm font-medium whitespace-nowrap"
          >
            {showAddForm ? "Cancel" : "+ Add User"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white/90 rounded-sm border border-border p-4 mb-4 max-w-md">
          {addedCredentials ? (
            <div className="text-sm">
              <p className="font-medium text-accent mb-2">Account created — give these to the staff member:</p>
              <p className="ref-number">Email: {addedCredentials.email}</p>
              <p className="ref-number mb-3">Temp password: {addedCredentials.tempPassword}</p>
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
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Role</span>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                >
                  {STAFF_ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {ROLES[r]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Email (optional)</span>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Phone number (optional)</span>
                <input
                  type="tel"
                  value={addForm.phoneNumber}
                  onChange={(e) => setAddForm({ ...addForm, phoneNumber: e.target.value })}
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                />
              </label>
              {addError && <p className="text-danger text-sm">{addError}</p>}
              <button
                type="submit"
                disabled={adding || !addForm.fullName.trim()}
                className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 py-2 font-medium disabled:opacity-60"
              >
                {adding ? "Creating…" : "Create account"}
              </button>
            </form>
          )}
        </div>
      )}

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
                        <input
                          defaultValue={u.full_name || ""}
                          onBlur={(e) => saveFullName(u.id, e.target.value)}
                          className="font-medium border border-transparent hover:border-border focus:border-border rounded-sm px-2 py-1 -mx-2 bg-transparent focus-visible:outline-3 focus-visible:outline-primary min-w-[10rem]"
                        />
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
