import { describe, it, expect } from "vitest";
import { STAGES, getAllowedOutcomes, getNextStage, canActOnStage } from "./nonLuponDefinitions.js";

describe("nonLuponDefinitions", () => {
  it("starts at Received and ends at Closed", () => {
    expect(STAGES[0]).toBe("Received");
    expect(STAGES.at(-1)).toBe("Closed");
  });

  it("resolves Assigned to office/department to the Assigned stage", () => {
    expect(getNextStage("Received", "Assigned to office/department")).toBe("Assigned");
  });

  it("resolves Resolved from either Action in Progress or Referred to Closed", () => {
    expect(getNextStage("Action in Progress", "Resolved")).toBe("Closed");
    expect(getNextStage("Referred", "Resolved")).toBe("Closed");
  });

  it("allows secretary and admin to act at every stage", () => {
    expect(canActOnStage("Assigned", "secretary")).toBe(true);
    expect(canActOnStage("Assigned", "admin")).toBe(true);
    expect(canActOnStage("Assigned", "complainant")).toBe(false);
  });

  it("allows nobody to act once Closed", () => {
    expect(canActOnStage("Closed", "secretary")).toBe(false);
  });
});
