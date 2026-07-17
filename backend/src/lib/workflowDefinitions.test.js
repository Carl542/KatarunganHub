import { describe, it, expect } from "vitest";
import { getAllowedOutcomes, getNextStage, canActOnStage, LUPON_STAGES } from "./workflowDefinitions.js";

describe("workflowDefinitions", () => {
  it("lists the 9 canonical stages in order", () => {
    expect(LUPON_STAGES[0]).toBe("Official complaint encoded");
    expect(LUPON_STAGES.at(-1)).toBe("Closed");
    expect(LUPON_STAGES).toHaveLength(9);
  });

  it("returns allowed outcomes for a stage", () => {
    expect(getAllowedOutcomes("Punong Barangay mediation")).toContain("Settlement reached");
  });

  it("resolves the next stage for an outcome", () => {
    expect(getNextStage("Punong Barangay mediation", "No settlement")).toBe("Pangkat formation");
  });

  it("returns the same stage when an outcome has no automatic next stage", () => {
    expect(getNextStage("Punong Barangay mediation", "Rescheduled")).toBe("Punong Barangay mediation");
  });

  it("only allows punong to act on Punong Barangay mediation", () => {
    expect(canActOnStage("Punong Barangay mediation", "punong")).toBe(true);
    expect(canActOnStage("Punong Barangay mediation", "secretary")).toBe(false);
    expect(canActOnStage("Punong Barangay mediation", "lupon")).toBe(false);
  });

  it("only allows lupon to act on Pangkat conciliation", () => {
    expect(canActOnStage("Pangkat conciliation", "lupon")).toBe(true);
    expect(canActOnStage("Pangkat conciliation", "punong")).toBe(false);
  });
});
