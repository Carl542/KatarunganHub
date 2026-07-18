import { describe, it, expect } from "vitest";
import { generateTempPassword } from "./tempPassword.js";

describe("generateTempPassword", () => {
  it("generates a 10-character password by default", () => {
    expect(generateTempPassword()).toHaveLength(10);
  });

  it("only uses unambiguous alphanumeric characters", () => {
    const password = generateTempPassword(200);
    expect(password).toMatch(/^[A-HJ-NP-Za-km-z2-9]+$/);
  });

  it("generates different passwords on repeated calls", () => {
    expect(generateTempPassword()).not.toBe(generateTempPassword());
  });
});
