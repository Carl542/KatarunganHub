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

// Alias so callers that pick between workflowDefinitions and nonLuponDefinitions
// (see routes/complaints.js workflowModuleFor) can rely on a common `.STAGES` name.
export const STAGES = LUPON_STAGES;

export const OUTCOMES_BY_STAGE = {
  "Official complaint encoded": ["For jurisdiction review", "Potentially covered", "Proceed to mediation", "Settlement reached"],
  "Jurisdiction review": ["Potentially covered", "Proceed to mediation", "Settlement reached", "Potentially not covered", "Requires further verification", "Referred to appropriate office"],
  "Summons issued": ["Proceed to mediation", "Settlement reached", "Rescheduled", "Complainant failed to appear", "Respondent failed to appear"],
  "Punong Barangay mediation": ["Settlement reached", "No settlement", "Voluntary arbitration", "Rescheduled", "Complainant failed to appear", "Respondent failed to appear", "Referred"],
  "Pangkat formation": ["Pangkat formed", "Conflict review required", "Rescheduled"],
  "Pangkat conciliation": ["Settlement reached", "Conciliation failed", "Voluntary arbitration", "Rescheduled", "Complainant failed to appear", "Respondent failed to appear"],
  "Settlement monitoring": ["Settlement complied", "Settlement repudiated", "Execution requested", "Monitoring continued"],
  "Proper disposition": ["Certification prepared for review", "Referred", "Dismissal or disposition recorded", "Ready for closure"],
  Closed: [],
};

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

export const STAGE_ACTORS = {
  "Official complaint encoded": ["admin", "punong", "secretary"],
  "Jurisdiction review": ["admin", "punong", "secretary"],
  "Summons issued": ["admin", "punong", "secretary"],
  "Punong Barangay mediation": ["admin", "punong", "secretary"],
  "Pangkat formation": ["admin", "punong", "secretary"],
  "Pangkat conciliation": ["admin", "lupon", "punong", "secretary"],
  "Settlement monitoring": ["admin", "secretary", "punong"],
  "Proper disposition": ["admin", "punong", "secretary"],
  Closed: [],
};

export function getAllowedOutcomes(stage) {
  return OUTCOMES_BY_STAGE[stage] || [];
}

export function getNextStage(stage, outcome) {
  return NEXT_STAGE_BY_OUTCOME[outcome] ?? stage;
}

export function canActOnStage(stage, role) {
  return (STAGE_ACTORS[stage] || []).includes(role);
}
