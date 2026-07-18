"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useCurrentProfile } from "@/lib/useCurrentProfile";
import UserPicker from "@/components/UserPicker";
import Icon from "@/components/Icon";

const LUPON_ELIGIBLE_ROLES = ["admin", "punong", "secretary", "lupon"];
const EMPTY_FORM = {
  profileId: "",
  position: "Lupon Member",
  term: "",
  contact: "",
  availability: "",
  skill: "",
  conflictNotes: "",
};

function initialsFor(fullName) {
  return (fullName || "")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function LuponMembersPage() {
  const profile = useCurrentProfile();
  const canManage = profile && ["admin", "punong"].includes(profile.role);

  const [profiles, setProfiles] = useState([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  function load() {
    setLoading(true);
    apiFetch("/lupon-profiles")
      .then(setProfiles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      profileId: p.profile_id,
      position: p.position || "Lupon Member",
      term: p.term || "",
      contact: p.contact || "",
      availability: p.availability || "",
      skill: p.skill || "",
      conflictNotes: p.conflict_notes || "",
    });
    setError("");
  }

  function clearForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editingId) {
        await apiFetch(`/lupon-profiles/${editingId}`, { method: "PATCH", body: JSON.stringify(form) });
      } else {
        await apiFetch("/lupon-profiles", { method: "POST", body: JSON.stringify(form) });
      }
      clearForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id) {
    if (!confirm("Remove this Lupon profile? This cannot be undone.")) return;
    setRemovingId(id);
    try {
      await apiFetch(`/lupon-profiles/${id}`, { method: "DELETE" });
      if (editingId === id) clearForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingId(null);
    }
  }

  const filtered = profiles.filter((p) => {
    const q = query.toLowerCase();
    return (p.profile?.full_name || "").toLowerCase().includes(q) || (p.position || "").toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Lupon Profiles</h1>
          <p className="text-sm text-foreground-muted mt-1">Manage Lupon and Pangkat member records.</p>
        </div>
        {profiles.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Icon
              name="search"
              className="w-4 h-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search by name or position…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border border-border rounded-sm pl-9 pr-3 py-2 min-h-11 bg-white w-full focus-visible:outline-3 focus-visible:outline-primary"
            />
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 ${canManage ? "lg:grid-cols-[5fr_7fr]" : ""} gap-4 items-start`}>
        {canManage && (
          <div className="bg-white/90 rounded-sm border border-border p-5">
            <h2 className="font-display text-lg font-semibold">{editingId ? "Edit Lupon Profile" : "Register Lupon Profile"}</h2>
            <p className="text-sm text-foreground-muted mt-1 mb-4">
              Assign an existing barangay official and record their service details.
            </p>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Barangay official</span>
                <UserPicker
                  required
                  roles={LUPON_ELIGIBLE_ROLES}
                  value={form.profileId}
                  onChange={(v) => setForm({ ...form, profileId: v })}
                  placeholder="Select official"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Position</span>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                >
                  <option>Pangkat Chairperson</option>
                  <option>Pangkat Secretary</option>
                  <option>Lupon Member</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Term</span>
                <input
                  value={form.term}
                  onChange={(e) => setForm({ ...form, term: e.target.value })}
                  placeholder="2025-2027"
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Contact</span>
                <input
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Availability</span>
                <input
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  placeholder="Weekday mornings"
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Specialization</span>
                <input
                  value={form.skill}
                  onChange={(e) => setForm({ ...form, skill: e.target.value })}
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                />
              </label>
              <label className="sm:col-span-2 flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Conflict notes</span>
                <textarea
                  value={form.conflictNotes}
                  onChange={(e) => setForm({ ...form, conflictNotes: e.target.value })}
                  placeholder="Add any declared conflicts of interest…"
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                />
              </label>
              {error && <p className="text-danger text-sm sm:col-span-2">{error}</p>}
              <div className="sm:col-span-2 flex gap-3">
                <button
                  type="button"
                  onClick={clearForm}
                  className="flex-1 border border-border rounded-sm hover:bg-muted transition-colors min-h-11 py-2 font-medium"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 py-2 font-medium disabled:opacity-60"
                >
                  {submitting ? "Saving…" : editingId ? "Update Lupon Profile" : "Add Lupon Profile"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white/90 rounded-sm border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              Registered Officials
              <span className="stamp text-primary">
                {profiles.length} official{profiles.length === 1 ? "" : "s"}
              </span>
            </h2>
          </div>

          {loading && <p className="text-foreground-muted px-5 py-4">Loading…</p>}
          {!loading && profiles.length > 0 && filtered.length === 0 && (
            <p className="text-foreground-muted px-5 py-4">No officials match &ldquo;{query}&rdquo;.</p>
          )}
          {!loading && profiles.length === 0 && <p className="text-foreground-muted px-5 py-4">No officials registered yet.</p>}

          {filtered.length > 0 && (
            <div className="p-4 flex flex-col gap-3">
              {filtered.map((p) => {
                const isActive = p.profile?.status === "Active" || !p.profile?.status;
                return (
                  <div key={p.id} className="border border-border rounded-sm p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full bg-primary-light text-primary font-display font-semibold flex items-center justify-center text-sm shrink-0"
                        aria-hidden="true"
                      >
                        {initialsFor(p.profile?.full_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{p.profile?.full_name || "Unassigned"}</p>
                          <span className={`stamp ${isActive ? "text-accent" : "text-foreground-muted"}`}>
                            {p.profile?.status || "Active"}
                          </span>
                        </div>
                        <span className="stamp text-primary mt-1 inline-block">{p.position}</span>
                      </div>
                    </div>
                    <dl className="text-sm space-y-1">
                      <div className="flex justify-between gap-2 py-1 border-t border-border">
                        <dt className="text-foreground-muted">Term</dt>
                        <dd className="text-right">{p.term || "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-2 py-1 border-t border-border">
                        <dt className="text-foreground-muted">Contact</dt>
                        <dd className="ref-number text-right">{p.contact || "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-2 py-1 border-t border-border">
                        <dt className="text-foreground-muted">Availability</dt>
                        <dd className="text-right">{p.availability || "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-2 py-1 border-t border-border">
                        <dt className="text-foreground-muted">Skill</dt>
                        <dd className="text-right">{p.skill || "—"}</dd>
                      </div>
                    </dl>
                    <p className="text-xs text-foreground-muted mt-2 pt-2 border-t border-border">
                      Conflict: {p.conflict_notes || "None declared"}
                    </p>

                    {canManage && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                        <button
                          onClick={() => startEdit(p)}
                          className="flex-1 flex items-center justify-center gap-1.5 border border-primary text-primary rounded-sm px-3 min-h-9 text-xs font-medium hover:bg-primary hover:text-white transition-colors"
                        >
                          <Icon name="edit" className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemove(p.id)}
                          disabled={removingId === p.id}
                          className="flex-1 flex items-center justify-center gap-1.5 border border-danger text-danger rounded-sm px-3 min-h-9 text-xs font-medium hover:bg-danger hover:text-white transition-colors disabled:opacity-60"
                        >
                          <Icon name="trash" className="w-3.5 h-3.5" />
                          {removingId === p.id ? "Removing…" : "Remove"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
