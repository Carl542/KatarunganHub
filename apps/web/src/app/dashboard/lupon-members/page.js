"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

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
          <span className="text-sm font-medium">Profile ID (user UUID)</span>
          <input
            required
            value={form.profileId}
            onChange={(e) => setForm({ ...form, profileId: e.target.value })}
            className="border rounded-sm px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Position</span>
          <select
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            className="border rounded-sm px-3 py-2"
          >
            <option>Pangkat Chairperson</option>
            <option>Pangkat Secretary</option>
            <option>Lupon Member</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Term</span>
          <input
            value={form.term}
            onChange={(e) => setForm({ ...form, term: e.target.value })}
            placeholder="2025-2027"
            className="border rounded-sm px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Contact</span>
          <input
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="border rounded-sm px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Availability</span>
          <input
            value={form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.value })}
            placeholder="Weekday mornings"
            className="border rounded-sm px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Specialization</span>
          <input
            value={form.skill}
            onChange={(e) => setForm({ ...form, skill: e.target.value })}
            className="border rounded-sm px-3 py-2"
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          <span className="text-sm font-medium">Conflict notes</span>
          <textarea
            value={form.conflictNotes}
            onChange={(e) => setForm({ ...form, conflictNotes: e.target.value })}
            className="border rounded-sm px-3 py-2"
          />
        </label>
        {error && <p className="text-danger text-sm col-span-2">{error}</p>}
        <button type="submit" className="bg-primary text-white rounded-sm py-2 font-medium col-span-2">
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
