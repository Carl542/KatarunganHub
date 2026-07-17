"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

const FIELDS = [
  { key: "barangay_name", label: "Barangay name" },
  { key: "barangay_address", label: "Address" },
  { key: "barangay_contact", label: "Contact details" },
  { key: "case_number_format", label: "Case number format" },
];

export default function SettingsPage() {
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/settings")
      .then(setValues)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      await apiFetch("/settings", { method: "PATCH", body: JSON.stringify(values) });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="text-foreground-muted">Loading…</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white/90 rounded-sm border border-border p-6 flex flex-col gap-4">
        {FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">{f.label}</span>
            <input
              value={values[f.key] || ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            />
          </label>
        ))}

        {error && <p className="text-danger text-sm">{error}</p>}
        {saved && <p className="text-accent text-sm">Settings saved.</p>}

        <button type="submit" className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 py-2 font-medium">
          Save settings
        </button>
      </form>
    </div>
  );
}
