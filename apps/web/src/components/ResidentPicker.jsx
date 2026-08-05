"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import UserPicker from "./UserPicker";

export default function ResidentPicker({ role, value, onChange, required }) {
  const [mode, setMode] = useState("existing");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    idType: "",
    idNumber: "",
  });
  const [creating, setCreating] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [error, setError] = useState("");

  const isRespondent = role === "respondent";

  function switchMode(next) {
    setMode(next);
    setCredentials(null);
    setError("");
    onChange("");
  }

  async function handleCreate(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.fullName.trim()) return;

    // For complainant, address/ID are recommended; for respondent, only name is strictly required initially
    if (!isRespondent && (!form.address.trim() || !form.idType || !form.idNumber.trim())) {
      // Optional fallback validation for complainant if needed, but allow submit if name is set
    }

    setError("");
    setCreating(true);
    try {
      const created = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim() || undefined,
          phoneNumber: form.phoneNumber.trim() || undefined,
          address: form.address.trim() || undefined,
          idType: form.idType || undefined,
          idNumber: form.idNumber.trim() || undefined,
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

  // Submit enabled if full name is provided
  const canRegister = isRespondent
    ? Boolean(form.fullName.trim())
    : Boolean(form.fullName.trim());

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 text-xs">
        <button
          type="button"
          onClick={() => switchMode("existing")}
          className={`px-2.5 py-1 rounded-sm border min-h-8 font-medium transition-colors ${
            mode === "existing" ? "bg-primary text-white border-primary" : "border-border text-foreground-muted hover:bg-muted"
          }`}
        >
          Existing resident
        </button>
        <button
          type="button"
          onClick={() => switchMode("new")}
          className={`px-2.5 py-1 rounded-sm border min-h-8 font-medium transition-colors ${
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
            placeholder={`Full name of ${role} *`}
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="border border-border rounded-sm px-2 py-1.5 min-h-9 bg-white text-sm focus-visible:outline-3 focus-visible:outline-primary font-medium"
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
          <input
            placeholder={isRespondent ? "Complete address (optional / if known)" : "Complete address (optional)"}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="border border-border rounded-sm px-2 py-1.5 min-h-9 bg-white text-sm focus-visible:outline-3 focus-visible:outline-primary"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.idType}
              onChange={(e) => setForm({ ...form, idType: e.target.value })}
              className="border border-border rounded-sm px-2 py-1.5 min-h-9 bg-white text-sm focus-visible:outline-3 focus-visible:outline-primary text-slate-700"
            >
              <option value="">Valid ID (optional)...</option>
              <option>Voter's ID</option>
              <option>Barangay ID</option>
              <option>National ID (PhilSys)</option>
              <option>Driver's License</option>
              <option>Passport</option>
              <option>UMID</option>
              <option>Postal ID</option>
              <option>Senior Citizen ID</option>
              <option>PWD ID</option>
              <option>Other</option>
            </select>
            <input
              placeholder="ID number (optional)"
              value={form.idNumber}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
              className="border border-border rounded-sm px-2 py-1.5 min-h-9 bg-white text-sm focus-visible:outline-3 focus-visible:outline-primary"
            />
          </div>
          <p className="text-xs text-foreground-muted">
            {isRespondent
              ? "For new respondents, only Full Name is required initially. Valid ID & details will be verified during Summons."
              : "Full Name is required. Address & Valid ID can be added now or updated later."}
          </p>
          {error && <p className="text-danger text-xs font-medium">{error}</p>}
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !canRegister}
            className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-9 py-1.5 text-sm font-semibold disabled:opacity-50"
          >
            {creating ? "Registering…" : `Register ${role} account`}
          </button>
        </div>
      )}

      {credentials && (
        <div className="border border-emerald-300 rounded-sm p-3 bg-emerald-50 text-sm">
          <p className="font-bold text-emerald-900 mb-1">Account created successfully for {role}!</p>
          <p className="font-mono text-xs text-slate-800">Login ID: {credentials.email}</p>
          <p className="font-mono font-bold text-blue-700">Temp password: {credentials.tempPassword}</p>
        </div>
      )}
    </div>
  );
}
