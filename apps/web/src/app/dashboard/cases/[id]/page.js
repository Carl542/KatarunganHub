"use client";

import { useEffect, useState, use } from "react";
import { apiFetch } from "@/lib/apiClient";
import { LUPON_STAGES, OUTCOMES_BY_STAGE as LUPON_OUTCOMES_BY_STAGE } from "@/lib/workflowDisplay";
import { NON_LUPON_STAGES, OUTCOMES_BY_STAGE as NON_LUPON_OUTCOMES_BY_STAGE } from "@/lib/nonLuponDisplay";
import SchedulesTab from "./tabs/SchedulesTab";
import PangkatTab from "./tabs/PangkatTab";
import AttendanceTab from "./tabs/AttendanceTab";
import DocumentsTab from "./tabs/DocumentsTab";

const TABS = ["Overview", "Workflow", "Schedules", "Pangkat", "Attendance", "Documents"];

export default function CaseDetailsPage({ params }) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Overview");
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

  if (loading) return <p className="text-foreground-muted">Loading…</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!caseData) return null;

  const isNonLupon = caseData.type === "Non-Lupon";
  const stages = isNonLupon ? NON_LUPON_STAGES : LUPON_STAGES;
  const outcomesByStage = isNonLupon ? NON_LUPON_OUTCOMES_BY_STAGE : LUPON_OUTCOMES_BY_STAGE;
  const currentStage = caseData.workflow_stage || stages[0];
  const availableOutcomes = outcomesByStage[currentStage] || [];
  const hasWorkflow = caseData.type === "Lupon" || caseData.type === "Non-Lupon";

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{caseData.title}</h1>
          <p className="text-sm text-foreground-muted mt-1 flex items-center gap-2 flex-wrap">
            <span className="ref-number">{caseData.reference_number}</span>
            <span aria-hidden="true">·</span>
            <span>{caseData.type}</span>
            <span className="stamp text-primary">{caseData.status}</span>
          </p>
        </div>
      </div>

      <div className="flex gap-1 mb-4 border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t ? "border-primary text-primary" : "border-transparent text-foreground-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="bg-white/90 rounded-sm border border-border p-6">
          <h2 className="font-bold mb-2">Narrative</h2>
          <p className="text-foreground mb-4">{caseData.narrative}</p>
          <h2 className="font-bold mb-2">Relief requested</h2>
          <p className="text-foreground">{caseData.relief}</p>
        </div>
      )}

      {tab === "Workflow" && hasWorkflow && (
        <div className="bg-white/90 rounded-sm border border-border p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {stages.map((stage) => (
              <span
                key={stage}
                className={`text-xs px-2 py-1 rounded-sm ${
                  stage === currentStage ? "bg-primary text-white" : "bg-primary-light text-foreground-muted"
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
                  className="border rounded-sm px-3 py-2"
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
                  className="border rounded-sm px-3 py-2"
                />
              </label>

              {actionError && <p className="text-danger text-sm">{actionError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-white rounded-sm py-2 font-medium disabled:opacity-60"
              >
                {submitting ? "Recording…" : "Record transition"}
              </button>
            </form>
          )}
        </div>
      )}

      {tab === "Schedules" && <SchedulesTab caseId={id} />}
      {tab === "Pangkat" && <PangkatTab caseId={id} />}
      {tab === "Attendance" && <AttendanceTab caseId={id} />}
      {tab === "Documents" && <DocumentsTab caseId={id} />}
    </div>
  );
}
