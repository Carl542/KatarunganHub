"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import UserPicker from "@/components/UserPicker";

const LUPON_ELIGIBLE_ROLES = ["admin", "punong", "secretary", "lupon"];

function initialsFor(fullName) {
  return (fullName || "")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function LuponMembersPage() {
  const [profiles, setProfiles] = useState([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    profileId: "",
    position: "Lupon Member",
    term: "",
    contact: "",
    availability: "",
    skill: "",
    conflictNotes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/lupon-profiles", { method: "POST", body: JSON.stringify(form) });
      setForm({ ...form, profileId: "", term: "", contact: "", availability: "", skill: "", conflictNotes: "" });
      load();
    } catch (err) {
      setError(err.message);
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
          <p className="text-sm text-foreground-muted mt-1">{profiles.length} registered official{profiles.length === 1 ? "" : "s"}</p>
        </div>
        {profiles.length > 0 && (
          <input
            type="search"
            placeholder="Search by name or position…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white w-full sm:w-64 focus-visible:outline-3 focus-visible:outline-primary"
          />
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white/90 rounded-sm border border-border p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
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
            className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
          />
        </label>
        {error && <p className="text-danger text-sm sm:col-span-2">{error}</p>}
        <button
          type="submit"
          className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 py-2 font-medium sm:col-span-2"
        >
          Add Lupon profile
        </button>
      </form>

      {loading && <p className="text-foreground-muted">Loading…</p>}

      {!loading && profiles.length > 0 && filtered.length === 0 && (
        <p className="text-foreground-muted">No officials match &ldquo;{query}&rdquo;.</p>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white/90 rounded-sm border border-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full bg-primary-light text-primary font-display font-semibold flex items-center justify-center text-sm shrink-0"
                  aria-hidden="true"
                >
                  {initialsFor(p.profile?.full_name)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.profile?.full_name || "Unassigned"}</p>
                  <span className="stamp text-primary">{p.position}</span>
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
              {p.conflict_notes && (
                <p className="text-xs text-foreground-muted mt-2 pt-2 border-t border-border">
                  Conflict: {p.conflict_notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
