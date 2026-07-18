// Client-side display copy only — mirrors backend/src/lib/workflowDefinitions.js
// for rendering. Real validation always happens server-side; a stale copy here
// only affects which options are offered, never what's accepted.
export const LUPON_STAGES = [
  "Official complaint encoded",
  "Jurisdiction review",
  "Summons issued",
  "Punong Barangay mediation",
  "Pangkat formation",
  "Pangkat conciliation",
  "Settlement monitoring",
  "Proper disposition",
  "Closed",
];

export const OUTCOMES_BY_STAGE = {
  "Official complaint encoded": ["For jurisdiction review"],
  "Jurisdiction review": ["Potentially covered", "Potentially not covered", "Requires further verification", "Referred to appropriate office"],
  "Summons issued": ["Proceed to mediation", "Rescheduled", "Complainant failed to appear", "Respondent failed to appear"],
  "Punong Barangay mediation": ["Settlement reached", "No settlement", "Voluntary arbitration", "Rescheduled", "Complainant failed to appear", "Respondent failed to appear", "Referred"],
  "Pangkat formation": ["Pangkat formed", "Conflict review required", "Rescheduled"],
  "Pangkat conciliation": ["Settlement reached", "Conciliation failed", "Voluntary arbitration", "Rescheduled", "Complainant failed to appear", "Respondent failed to appear"],
  "Settlement monitoring": ["Settlement complied", "Settlement repudiated", "Execution requested", "Monitoring continued"],
  "Proper disposition": ["Certification prepared for review", "Referred", "Dismissal or disposition recorded", "Ready for closure"],
  Closed: [],
};

// Mirrors backend/src/lib/workflowDefinitions.js NEXT_STAGE_BY_OUTCOME — used to
// show a read-only "Next stage" preview as soon as an outcome is picked, since
// the actual next stage is always server-derived from the outcome, never chosen directly.
export const NEXT_STAGE_BY_OUTCOME = {
  "For jurisdiction review": "Jurisdiction review",
  "Potentially covered": "Summons issued",
  "Potentially not covered": "Proper disposition",
  "Requires further verification": "Jurisdiction review",
  "Referred to appropriate office": "Proper disposition",
  "Proceed to mediation": "Punong Barangay mediation",
  "No settlement": "Pangkat formation",
  "Pangkat formed": "Pangkat conciliation",
  "Conflict review required": "Pangkat formation",
  "Conciliation failed": "Proper disposition",
  "Settlement reached": "Settlement monitoring",
  "Settlement complied": "Proper disposition",
  "Settlement repudiated": "Proper disposition",
  "Execution requested": "Settlement monitoring",
  "Monitoring continued": "Settlement monitoring",
  "Voluntary arbitration": "Proper disposition",
  Rescheduled: null,
  "Complainant failed to appear": null,
  "Respondent failed to appear": null,
  Referred: "Proper disposition",
  "Certification prepared for review": "Proper disposition",
  "Dismissal or disposition recorded": "Proper disposition",
  "Ready for closure": "Closed",
};

// Reminders shown before recording a transition. Informational only — not persisted,
// not required to submit the form.
export const CHECKLIST_BY_STAGE = {
  "Official complaint encoded": ["Confirm barangay jurisdiction", "Verify parties' addresses", "Review complaint completeness"],
  "Jurisdiction review": ["Confirm both parties reside in the same city/municipality", "Check for statutory exceptions (RA 7160 Sec. 408)", "Document the jurisdiction basis"],
  "Summons issued": ["Confirm summons served to both parties", "Verify hearing date and venue", "Record proof of service"],
  "Punong Barangay mediation": ["Confirm both parties personally appeared", "Explore possible settlement terms", "Document mediation minutes"],
  "Pangkat formation": ["Select Pangkat members with no conflict of interest", "Confirm the Pangkat chairperson is designated", "Notify both parties of the Pangkat composition"],
  "Pangkat conciliation": ["Confirm the Pangkat hearing was conducted", "Document the conciliation proceedings", "Prepare the settlement or certification"],
  "Settlement monitoring": ["Confirm settlement terms are documented", "Track compliance within the monitoring period", "Note any repudiation within 10 days"],
  "Proper disposition": ["Prepare a Certificate to File Action if unresolved", "Finalize case documentation", "Confirm the basis for closure"],
  Closed: [],
};

// Groups the 9 real stages into 8 display steps for the stepper (Proper disposition
// and Closed share a step) — purely a display grouping, not a change to real stage data.
export const LUPON_DISPLAY_STEPS = [
  { label: "Official Complaint Encoded", stages: ["Official complaint encoded"] },
  { label: "Jurisdiction Review", stages: ["Jurisdiction review"] },
  { label: "Summons Issued", stages: ["Summons issued"] },
  { label: "Punong Barangay Mediation", stages: ["Punong Barangay mediation"] },
  { label: "Pangkat Formation", stages: ["Pangkat formation"] },
  { label: "Pangkat Conciliation", stages: ["Pangkat conciliation"] },
  { label: "Settlement Monitoring", stages: ["Settlement monitoring"] },
  { label: "Proper Disposition / Closed", stages: ["Proper disposition", "Closed"] },
];
