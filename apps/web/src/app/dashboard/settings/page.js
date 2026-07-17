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

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
        {FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1">
            <span className="text-sm font-medium">{f.label}</span>
            <input
              value={values[f.key] || ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className="border rounded-md px-3 py-2"
            />
          </label>
        ))}

        {error && <p className="text-danger text-sm">{error}</p>}
        {saved && <p className="text-accent text-sm">Settings saved.</p>}

        <button type="submit" className="bg-primary text-white rounded-md py-2 font-medium">
          Save settings
        </button>
      </form>
    </div>
  );
}
