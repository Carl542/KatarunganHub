"use client";

import { useEffect, useState, use } from "react";
import { apiFetch } from "@/lib/apiClient";
import { LUPON_STAGES, OUTCOMES_BY_STAGE } from "@/lib/workflowDisplay";

export default function CaseDetailsPage({ params }) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    apiFetch(`/complaints/${id}`)
      .then((data) => {
        setCaseData(data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleTransition(e) {
    e.preventDefault();
    setActionError("");
    setSubmitting(true);
    try {
      await apiFetch(`/complaints/${id}/workflow`, {
        method: "PATCH",
        body: JSON.stringify({ outcome, notes }),
      });
      setOutcome("");
      setNotes("");
      load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!caseData) return null;

  const currentStage = caseData.workflow_stage || "Official complaint encoded";
  const availableOutcomes = OUTCOMES_BY_STAGE[currentStage] || [];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{caseData.title}</h1>
          <p className="text-sm text-gray-500">
            {caseData.reference_number} · {caseData.type} · {caseData.status}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-bold mb-2">Narrative</h2>
        <p className="text-gray-700 mb-4">{caseData.narrative}</p>
        <h2 className="font-bold mb-2">Relief requested</h2>
        <p className="text-gray-700">{caseData.relief}</p>
      </div>

      {caseData.type === "Lupon" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold mb-3">Workflow</h2>

          <div className="flex flex-wrap gap-2 mb-6">
            {LUPON_STAGES.map((stage) => (
              <span
                key={stage}
                className={`text-xs px-2 py-1 rounded-full ${
                  stage === currentStage ? "bg-primary text-white" : "bg-primary-light text-gray-600"
                }`}
              >
                {stage}
              </span>
            ))}
          </div>

          {currentStage !== "Closed" && (
            <form onSubmit={handleTransition} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Outcome</span>
                <select
                  required
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="">Select outcome</option>
                  {availableOutcomes.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border rounded-md px-3 py-2"
                />
              </label>

              {actionError && <p className="text-danger text-sm">{actionError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-white rounded-md py-2 font-medium disabled:opacity-60"
              >
                {submitting ? "Recording…" : "Record transition"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
