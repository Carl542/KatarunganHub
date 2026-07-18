"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import UserPicker from "./UserPicker";

export default function ResidentPicker({ role, value, onChange, required }) {
  const [mode, setMode] = useState("existing");
  const [form, setForm] = useState({ fullName: "", email: "", phoneNumber: "" });
  const [creating, setCreating] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [error, setError] = useState("");

  function switchMode(next) {
    setMode(next);
    setCredentials(null);
    setError("");
    onChange("");
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    setError("");
    setCreating(true);
    try {
      const created = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim() || undefined,
          phoneNumber: form.phoneNumber.trim() || undefined,
          role,
        }),
      });
      onChange(created.id);
      setCredentials({ email: created.email, tempPassword: created.tempPassword });
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 text-xs">
        <button
          type="button"
          onClick={() => switchMode("existing")}
          className={`px-2.5 py-1 rounded-sm border min-h-8 ${
            mode === "existing" ? "bg-primary text-white border-primary" : "border-border text-foreground-muted hover:bg-muted"
          }`}
        >
          Existing resident
        </button>
        <button
          type="button"
          onClick={() => switchMode("new")}
          className={`px-2.5 py-1 rounded-sm border min-h-8 ${
            mode === "new" ? "bg-primary text-white border-primary" : "border-border text-foreground-muted hover:bg-muted"
          }`}
        >
          New resident
        </button>
      </div>

      {mode === "existing" && (
        <UserPicker required={required} roles={[role]} value={value} onChange={onChange} placeholder={`Select ${role}`} />
      )}

      {mode === "new" && !credentials && (
        <div className="border border-border rounded-sm p-3 flex flex-col gap-2 bg-muted/40">
          <input
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="border border-border rounded-sm px-2 py-1.5 min-h-9 bg-white text-sm focus-visible:outline-3 focus-visible:outline-primary"
          />
          <input
            placeholder="Email (optional)"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-border rounded-sm px-2 py-1.5 min-h-9 bg-white text-sm focus-visible:outline-3 focus-visible:outline-primary"
          />
          <input
            placeholder="Phone number (optional)"
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            className="border border-border rounded-sm px-2 py-1.5 min-h-9 bg-white text-sm focus-visible:outline-3 focus-visible:outline-primary"
          />
          {error && <p className="text-danger text-xs">{error}</p>}
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !form.fullName.trim()}
            className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-9 py-1.5 text-sm font-medium disabled:opacity-60"
          >
            {creating ? "Registering…" : "Register account"}
          </button>
        </div>
      )}

      {credentials && (
        <div className="border border-accent rounded-sm p-3 bg-accent/5 text-sm">
          <p className="font-medium text-accent mb-1">Account created — give these to the resident:</p>
          <p className="ref-number">Email: {credentials.email}</p>
          <p className="ref-number">Temp password: {credentials.tempPassword}</p>
        </div>
      )}
    </div>
  );
}
