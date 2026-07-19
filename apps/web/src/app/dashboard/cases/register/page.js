"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import ResidentPicker from "@/components/ResidentPicker";

export default function RegisterCasePage() {
  const [form, setForm] = useState({
    title: "",
    complainantId: "",
    respondentId: "",
    type: "Lupon",
    categoryId: "",
    priorityId: "",
    narrative: "",
    relief: "",
  });
  const [referenceData, setReferenceData] = useState({ categories: [], priorities: [] });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/reference-data")
      .then(setReferenceData)
      .catch(() => {});
  }, []);

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
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Official Case Registration</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Only complaints officially received at the barangay may be encoded in this system.
        </p>
      </div>

      {result ? (
        <div className="bg-white/90 rounded-sm border border-border p-6">
          <p className="text-sm text-foreground-muted">Case saved. Reference number:</p>
          <p className="ref-number text-2xl font-semibold text-primary">{result.reference_number}</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Complainant</span>
              <ResidentPicker required role="complainant" value={form.complainantId} onChange={(v) => update("complainantId", v)} />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Respondent</span>
              <ResidentPicker role="respondent" value={form.respondentId} onChange={(v) => update("respondentId", v)} />
            </label>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Category</span>
              <select
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
                className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
              >
                <option value="">Uncategorized</option>
                {referenceData.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Priority</span>
              <select
                value={form.priorityId}
                onChange={(e) => update("priorityId", e.target.value)}
                className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
              >
                <option value="">Unset</option>
                {referenceData.priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="self-end bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 px-8 py-2 font-medium disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save case & generate reference"}
          </button>
        </form>
      )}
    </div>
  );
}
