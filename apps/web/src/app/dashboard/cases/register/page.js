"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";

export default function RegisterCasePage() {
  const [form, setForm] = useState({
    title: "",
    complainantId: "",
    respondentId: "",
    type: "Lupon",
    narrative: "",
    relief: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const created = await apiFetch("/complaints", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setResult(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Official Case Registration</h1>
      <p className="text-sm text-foreground-muted mb-6">
        Only complaints officially received at the barangay may be encoded in this system.
      </p>

      {result ? (
        <div className="bg-white/90 rounded-sm border border-border p-6">
          <p className="text-sm text-foreground-muted">Case saved. Reference number:</p>
          <p className="text-2xl font-bold text-primary">{result.reference_number}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white/90 rounded-sm border border-border p-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Case title</span>
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Complainant ID</span>
            <input
              required
              value={form.complainantId}
              onChange={(e) => update("complainantId", e.target.value)}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Respondent ID</span>
            <input
              value={form.respondentId}
              onChange={(e) => update("respondentId", e.target.value)}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Case type</span>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            >
              <option>Lupon</option>
              <option>Non-Lupon</option>
              <option>Pending classification</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Narrative</span>
            <textarea
              required
              minLength={20}
              value={form.narrative}
              onChange={(e) => update("narrative", e.target.value)}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Relief requested</span>
            <textarea
              value={form.relief}
              onChange={(e) => update("relief", e.target.value)}
              className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
            />
          </label>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 py-2 font-medium disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save case & generate reference"}
          </button>
        </form>
      )}
    </div>
  );
}
