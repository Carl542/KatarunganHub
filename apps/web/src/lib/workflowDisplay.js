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
