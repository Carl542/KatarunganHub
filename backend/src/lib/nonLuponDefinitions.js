export const STAGES = ["Received", "Assigned", "Action in Progress", "Referred", "Closed"];

const OUTCOMES_BY_STAGE = {
  Received: ["Assigned to office/department"],
  Assigned: ["Action taken", "Referred to another office"],
  "Action in Progress": ["Resolved", "Referred to another office"],
  Referred: ["Acknowledged, action taken", "Resolved"],
  Closed: [],
};

const NEXT_STAGE_BY_OUTCOME = {
  "Assigned to office/department": "Assigned",
  "Action taken": "Action in Progress",
  "Referred to another office": "Referred",
  "Acknowledged, action taken": "Action in Progress",
  Resolved: "Closed",
};

const ACTORS = ["secretary", "admin"];

export function getAllowedOutcomes(stage) {
  return OUTCOMES_BY_STAGE[stage] || [];
}

export function getNextStage(stage, outcome) {
  return NEXT_STAGE_BY_OUTCOME[outcome] ?? stage;
}

export function canActOnStage(stage, role) {
  return stage !== "Closed" && ACTORS.includes(role);
}
