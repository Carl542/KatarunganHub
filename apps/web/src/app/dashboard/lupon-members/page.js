"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import UserPicker from "@/components/UserPicker";

const LUPON_ELIGIBLE_ROLES = ["admin", "punong", "secretary", "lupon"];

export default function LuponMembersPage() {
  const [profiles, setProfiles] = useState([]);
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Lupon Profiles</h1>

      <form onSubmit={handleSubmit} className="bg-white/90 rounded-sm border border-border p-4 mb-6 grid grid-cols-2 gap-3">
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
        <label className="col-span-2 flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Conflict notes</span>
          <textarea
            value={form.conflictNotes}
            onChange={(e) => setForm({ ...form, conflictNotes: e.target.value })}
            className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
          />
        </label>
        {error && <p className="text-danger text-sm col-span-2">{error}</p>}
        <button type="submit" className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 py-2 font-medium col-span-2">
          Add Lupon profile
        </button>
      </form>

      {loading && <p className="text-foreground-muted">Loading…</p>}

      {profiles.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {profiles.map((p) => (
            <div key={p.id} className="bg-white/90 rounded-sm border border-border p-4">
              <p className="font-bold">{p.position}</p>
              <p className="text-sm text-foreground-muted">Term: {p.term}</p>
              <p className="text-sm text-foreground-muted">Contact: {p.contact}</p>
              <p className="text-sm text-foreground-muted">Availability: {p.availability}</p>
              <p className="text-sm text-foreground-muted">Skill: {p.skill}</p>
              <p className="text-sm text-foreground-muted">Conflict: {p.conflict_notes || "None declared"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
