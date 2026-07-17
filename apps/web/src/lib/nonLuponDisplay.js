// Client-side display copy only — mirrors apps/api/src/lib/nonLuponDefinitions.js
// for rendering. Real validation always happens server-side.
export const NON_LUPON_STAGES = ["Received", "Assigned", "Action in Progress", "Referred", "Closed"];

export const OUTCOMES_BY_STAGE = {
  Received: ["Assigned to office/department"],
  Assigned: ["Action taken", "Referred to another office"],
  "Action in Progress": ["Resolved", "Referred to another office"],
  Referred: ["Acknowledged, action taken", "Resolved"],
  Closed: [],
};
