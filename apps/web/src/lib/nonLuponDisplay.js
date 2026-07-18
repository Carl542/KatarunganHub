// Client-side display copy only — mirrors backend/src/lib/nonLuponDefinitions.js
// for rendering. Real validation always happens server-side.
export const NON_LUPON_STAGES = ["Received", "Assigned", "Action in Progress", "Referred", "Closed"];

export const OUTCOMES_BY_STAGE = {
  Received: ["Assigned to office/department"],
  Assigned: ["Action taken", "Referred to another office"],
  "Action in Progress": ["Resolved", "Referred to another office"],
  Referred: ["Acknowledged, action taken", "Resolved"],
  Closed: [],
};

// Mirrors backend/src/lib/nonLuponDefinitions.js NEXT_STAGE_BY_OUTCOME.
export const NEXT_STAGE_BY_OUTCOME = {
  "Assigned to office/department": "Assigned",
  "Action taken": "Action in Progress",
  "Referred to another office": "Referred",
  "Acknowledged, action taken": "Action in Progress",
  Resolved: "Closed",
};

export const CHECKLIST_BY_STAGE = {
  Received: ["Confirm complaint details are complete", "Identify the responsible office/department"],
  Assigned: ["Confirm the office/department acknowledged the assignment", "Set an expected action timeline"],
  "Action in Progress": ["Document the action taken", "Follow up with the assigned office"],
  Referred: ["Confirm the referral was acknowledged", "Track the referred office's action"],
  Closed: [],
};

export const NON_LUPON_DISPLAY_STEPS = NON_LUPON_STAGES.map((s) => ({ label: s, stages: [s] }));
