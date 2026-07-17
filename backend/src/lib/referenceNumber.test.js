import { describe, it, expect } from "vitest";
import { generateReferenceNumber } from "./referenceNumber.js";

describe("generateReferenceNumber", () => {
  it("pads the sequence to 6 digits", () => {
    expect(generateReferenceNumber(42, 2026)).toBe("REF-2026-000042");
  });

  it("handles a 6-digit sequence without truncating", () => {
    expect(generateReferenceNumber(123456, 2026)).toBe("REF-2026-123456");
  });
});
