"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";
import Icon from "@/components/Icon";
import SchedulesTab from "./tabs/SchedulesTab";
import PangkatTab from "./tabs/PangkatTab";
import AttendanceTab from "./tabs/AttendanceTab";
import DocumentsTab from "./tabs/DocumentsTab";
import WorkflowTab from "./tabs/WorkflowTab";

const TABS = ["Overview", "Workflow", "Schedules", "Pangkat", "Attendance", "Documents"];

export default function CaseDetailsPage({ params }) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Overview");

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

  if (loading) return <p className="text-foreground-muted">Loading…</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!caseData) return null;

  const hasWorkflow = caseData.type === "Lupon" || caseData.type === "Non-Lupon";

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{caseData.title}</h1>
          <p className="text-sm text-foreground-muted mt-1 flex items-center gap-2 flex-wrap">
            <span className="ref-number">{caseData.reference_number}</span>
            <span aria-hidden="true">·</span>
            <span>{caseData.type}</span>
            <span className="stamp text-primary">{caseData.status}</span>
          </p>
        </div>
        <Link
          href="/dashboard/cases"
          className="border border-border rounded-sm px-4 min-h-11 flex items-center gap-2 text-sm font-medium hover:bg-muted transition-colors shrink-0"
        >
          <Icon name="chevron-right" className="w-4 h-4 rotate-180" />
          Back to Cases
        </Link>
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
        <div className="bg-white/90 rounded-sm border border-border p-6 max-w-3xl">
          <h2 className="font-display text-lg font-semibold mb-2">Narrative</h2>
          <p className="text-foreground mb-4">{caseData.narrative}</p>
          <h2 className="font-display text-lg font-semibold mb-2">Relief requested</h2>
          <p className="text-foreground">{caseData.relief}</p>
        </div>
      )}

      {tab === "Workflow" && hasWorkflow && <WorkflowTab caseId={id} caseData={caseData} onUpdated={load} />}

      {tab === "Schedules" && <SchedulesTab caseId={id} />}
      {tab === "Pangkat" && <PangkatTab caseId={id} />}
      {tab === "Attendance" && <AttendanceTab caseId={id} />}
      {tab === "Documents" && <DocumentsTab caseId={id} />}
    </div>
  );
}
