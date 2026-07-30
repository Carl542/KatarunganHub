"use client";

import { Fragment, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useCurrentProfile } from "@/lib/useCurrentProfile";
import Icon from "@/components/Icon";
import {
  LUPON_STAGES,
  OUTCOMES_BY_STAGE as LUPON_OUTCOMES_BY_STAGE,
  NEXT_STAGE_BY_OUTCOME as LUPON_NEXT_STAGE_BY_OUTCOME,
  CHECKLIST_BY_STAGE as LUPON_CHECKLIST_BY_STAGE,
  LUPON_DISPLAY_STEPS,
  STAGE_ACTORS,
} from "@/lib/workflowDisplay";
import {
  NON_LUPON_STAGES,
  OUTCOMES_BY_STAGE as NON_LUPON_OUTCOMES_BY_STAGE,
  NEXT_STAGE_BY_OUTCOME as NON_LUPON_NEXT_STAGE_BY_OUTCOME,
  CHECKLIST_BY_STAGE as NON_LUPON_CHECKLIST_BY_STAGE,
  NON_LUPON_DISPLAY_STEPS,
  ACTORS as NON_LUPON_ACTORS,
} from "@/lib/nonLuponDisplay";

function titleCase(s) {
  return (s || "").replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1));
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Stages where the barangay may hold multiple hearings before deciding whether
// to escalate — confirmed via Lupon member interviews (up to 3 hearings is
// common local practice, though not an explicit statutory cap).
const MAX_ADVISORY_SESSIONS = 3;
const MULTI_SESSION_STAGES = ["Punong Barangay mediation", "Pangkat conciliation"];

export default function WorkflowTab({ caseId, caseData, onUpdated }) {
  const profile = useCurrentProfile();
  const isNonLupon = caseData.type === "Non-Lupon";
  const stages = isNonLupon ? NON_LUPON_STAGES : LUPON_STAGES;
  const outcomesByStage = isNonLupon ? NON_LUPON_OUTCOMES_BY_STAGE : LUPON_OUTCOMES_BY_STAGE;
  const nextStageByOutcome = isNonLupon ? NON_LUPON_NEXT_STAGE_BY_OUTCOME : LUPON_NEXT_STAGE_BY_OUTCOME;
  const checklistByStage = isNonLupon ? NON_LUPON_CHECKLIST_BY_STAGE : LUPON_CHECKLIST_BY_STAGE;
  const displaySteps = isNonLupon ? NON_LUPON_DISPLAY_STEPS : LUPON_DISPLAY_STEPS;

  const currentStage = caseData.workflow_stage || stages[0];
  const isClosed = currentStage === "Closed";
  const availableOutcomes = outcomesByStage[currentStage] || [];
  const checklist = checklistByStage[currentStage] || [];

  // Mirrors backend canActOnStage() exactly: Lupon-type stages each allow a
  // specific role (e.g. only "lupon" on Pangkat conciliation), while
  // Non-Lupon allows secretary/admin on any stage that isn't Closed.
  const canManage = isNonLupon
    ? !isClosed && NON_LUPON_ACTORS.includes(profile?.role)
    : (STAGE_ACTORS[currentStage] || []).includes(profile?.role);

  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [checked, setChecked] = useState({});
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    setChecked({});
  }, [currentStage]);

  useEffect(() => {
    Promise.all([
      apiFetch(`/complaints/${caseId}/schedules`).catch(() => []),
      apiFetch(`/complaints/${caseId}/attendance`).catch(() => []),
    ]).then(([sched, att]) => {
      setSchedules(sched);
      setAttendance(att);
    });
  }, [caseId, caseData.workflow_stage]);

  function resetForm() {
    setOutcome("");
    setNotes("");
    setActionError("");
  }

  function toggleChecklist(item) {
    setChecked((c) => ({ ...c, [item]: !c[item] }));
  }

  async function handleTransition(e) {
    e.preventDefault();
    setActionError("");
    setSubmitting(true);
    try {
      await apiFetch(`/complaints/${caseId}/workflow`, {
        method: "PATCH",
        body: JSON.stringify({ outcome, notes }),
      });
      resetForm();
      onUpdated();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const predictedNextStage = outcome ? nextStageByOutcome[outcome] ?? currentStage : null;

  const latestLog =
    caseData.status_logs && caseData.status_logs.length > 0
      ? [...caseData.status_logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
      : null;
  const stageDate = latestLog?.created_at || caseData.filed_at;
  const stageRecordedBy = latestLog?.actor?.full_name || caseData.creator?.full_name || "—";

  const showSessionProgress = !isNonLupon && MULTI_SESSION_STAGES.includes(currentStage);
  const stageSessions = schedules.filter((s) => s.type === currentStage);
  const sessionCount = stageSessions.length;
  const stageScheduleIds = new Set(stageSessions.map((s) => s.id));
  const sessionsWithNonAppearance = attendance.filter(
    (a) =>
      stageScheduleIds.has(a.schedule_id) &&
      (a.complainant_attendance === "Absent" || a.respondent_attendance === "Absent")
  );
  const maxSessionsReached = sessionCount >= MAX_ADVISORY_SESSIONS;

  const stepRows = chunk(displaySteps, 4);
  const currentIdx = stages.indexOf(currentStage);

  function stepStatus(step) {
    const idxs = step.stages.map((s) => stages.indexOf(s));
    const maxIdx = Math.max(...idxs);
    const minIdx = Math.min(...idxs);
    if (currentIdx > maxIdx) return "done";
    if (currentIdx >= minIdx && currentIdx <= maxIdx) return "current";
    return "upcoming";
  }

  return (
    <div>
      <div className="bg-white/90 rounded-sm border border-border p-6 mb-4">
        <h2 className="font-display text-lg font-semibold mb-1">Case Workflow</h2>
        <p className="text-sm text-foreground-muted mb-6">Move the case through the Katarungang Pambarangay process.</p>

        <div className="flex flex-col gap-8">
          {stepRows.map((row, rIdx) => (
            <div className="flex items-start" key={rIdx}>
              {row.map((step, i) => {
                const status = stepStatus(step);
                const globalIdx = rIdx * 4 + i;
                return (
                  <Fragment key={step.label}>
                    <div className="flex flex-col items-center text-center w-24 shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-semibold text-sm shrink-0 ${
                          status === "done"
                            ? "bg-primary text-white"
                            : status === "current"
                            ? "bg-primary text-white ring-4 ring-[#0038a8]/20"
                            : "bg-muted text-foreground-muted border border-border"
                        }`}
                      >
                        {status === "done" ? <Icon name="check-circle" className="w-5 h-5" /> : globalIdx + 1}
                      </div>
                      <span
                        className={`text-xs mt-2 leading-tight ${
                          status === "current" ? "text-primary font-semibold" : "text-foreground-muted"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < row.length - 1 && (
                      <div className={`flex-1 h-0.5 mt-5 ${status === "done" ? "bg-primary" : "bg-border"}`} />
                    )}
                  </Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {currentStage === "Pangkat conciliation" && (
        <div className="bg-primary/5 rounded-sm border border-primary/30 p-4 mb-4">
          <h2 className="font-display text-base font-semibold text-primary flex items-center gap-2 mb-2">
            <Icon name="info" className="w-5 h-5 shrink-0" />
            RA 7160 Conciliation Guidelines for Pangkat Members
          </h2>
          <ul className="text-xs space-y-1.5 text-foreground-muted">
            <li>⏱️ <strong>15-Day Statutory Conciliation Period:</strong> Pangkat must resolve conciliation within 15 days from 1st meeting (extendable max 15 days if agreed by both parties).</li>
            <li>📜 <strong>Attestation Requirement:</strong> Amicable settlement must be in writing, signed by both parties, and attested by the Pangkat Chairman.</li>
            <li>⚖️ <strong>10-Day Repudiation Period:</strong> Any party may repudiate settlement within 10 days on ground of fraud, violence, or intimidation.</li>
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {canManage && !isClosed && (
          <div className="bg-white/90 rounded-sm border border-border p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Record Workflow Transition</h2>
            <form onSubmit={handleTransition} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Next stage</span>
                <div className="border border-border rounded-sm px-3 py-2 min-h-11 bg-muted text-foreground-muted flex items-center justify-between">
                  <span>{predictedNextStage ? titleCase(predictedNextStage) : "Select an outcome first"}</span>
                  <Icon name="chevron-right" className="w-4 h-4 rotate-90 shrink-0" />
                </div>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">Outcome</span>
                <select
                  required
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                >
                  <option value="">Select outcome</option>
                  {availableOutcomes.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium tracking-wide uppercase text-foreground-muted">
                  {currentStage === "Pangkat conciliation" ? "Conciliation Session Minutes & Notes" : "Transition notes"}
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    currentStage === "Pangkat conciliation"
                      ? "Record agreed settlement terms, party statements, or conciliation minutes…"
                      : "Add notes about this workflow transition…"
                  }
                  className="border border-border rounded-sm px-3 py-2 min-h-11 bg-white focus-visible:outline-3 focus-visible:outline-primary"
                />
              </label>

              {actionError && <p className="text-danger text-sm">{actionError}</p>}

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border border-border rounded-sm hover:bg-muted transition-colors min-h-11 py-2 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors min-h-11 py-2 font-medium disabled:opacity-60"
                >
                  {submitting ? "Recording…" : "Record Transition"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={`flex flex-col gap-4 ${!canManage || isClosed ? "lg:col-span-2" : ""}`}>
          <div className="bg-white/90 rounded-sm border border-border p-5">
            <h2 className="font-display text-lg font-semibold mb-3">Current Stage</h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-full bg-[#e3eaf7] text-[#0038a8] flex items-center justify-center shrink-0">
                <Icon name="file-text" className="w-5 h-5" />
              </span>
              <div>
                <p className="font-medium">{titleCase(currentStage)}</p>
                <span className={`stamp ${isClosed ? "text-accent" : "text-primary"}`}>
                  {isClosed ? "Closed" : "In Progress"}
                </span>
              </div>
            </div>
            <dl className="text-sm">
              <div className="flex justify-between border-t border-border py-2">
                <dt className="text-foreground-muted">Date</dt>
                <dd>
                  {stageDate
                    ? new Date(stageDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between border-t border-border py-2">
                <dt className="text-foreground-muted">Recorded by</dt>
                <dd>{stageRecordedBy}</dd>
              </div>
            </dl>
          </div>

          {showSessionProgress && (
            <div className="bg-white/90 rounded-sm border border-border p-5">
              <h2 className="font-display text-lg font-semibold mb-1">Session Progress</h2>
              <p className="text-xs text-foreground-muted mb-3">
                Based on common Lupon practice (up to {MAX_ADVISORY_SESSIONS} hearings) — advisory only, not a
                statutory requirement.
              </p>
              <div className="flex items-center gap-2 mb-3">
                {Array.from({ length: MAX_ADVISORY_SESSIONS }).map((_, i) => (
                  <span
                    key={i}
                    className={`flex-1 h-2 rounded-full ${i < sessionCount ? "bg-primary" : "bg-border"}`}
                  />
                ))}
                <span className="text-sm font-medium shrink-0 ml-1">
                  {Math.min(sessionCount, MAX_ADVISORY_SESSIONS)}/{MAX_ADVISORY_SESSIONS}
                </span>
              </div>
              {sessionsWithNonAppearance.length > 0 && (
                <p className="stamp text-danger inline-block mb-2">
                  {sessionsWithNonAppearance.length} session{sessionsWithNonAppearance.length === 1 ? "" : "s"} with non-appearance
                </p>
              )}
              {maxSessionsReached && (
                <p className="text-sm text-danger">
                  Maximum hearings reached ({sessionCount}/{MAX_ADVISORY_SESSIONS}) — consider issuing a Certificate
                  to File Action if still unsettled.
                </p>
              )}
            </div>
          )}

          {canManage && !isClosed && (
            <div className="bg-white/90 rounded-sm border border-border p-5">
              <h2 className="font-display text-lg font-semibold mb-3">Required Before Moving Forward</h2>
              {checklist.length === 0 && <p className="text-sm text-foreground-muted">No additional checks for this stage.</p>}
              {checklist.length > 0 && (
                <ul className="flex flex-col gap-2.5">
                  {checklist.map((item) => (
                    <li key={item}>
                      <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checked[item]}
                          onChange={() => toggleChecklist(item)}
                          className="w-4 h-4 accent-primary shrink-0"
                        />
                        <span className={checked[item] ? "line-through text-foreground-muted" : ""}>{item}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
