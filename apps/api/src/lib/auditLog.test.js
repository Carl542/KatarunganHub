import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInsert = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "audit_logs") return { insert: mockInsert };
      return {};
    },
  }),
}));

const { logAudit } = await import("./auditLog.js");

describe("logAudit", () => {
  beforeEach(() => {
    mockInsert.mockReset();
    mockInsert.mockResolvedValue({ data: null, error: null });
  });

  it("inserts an audit log entry with the given fields", async () => {
    await logAudit({ actorId: "u1", action: "Registered case", module: "Cases", complaintId: "case-1" });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: "u1",
        action: "Registered case",
        module: "Cases",
        complaint_id: "case-1",
      })
    );
  });

  it("does not throw when the insert fails", async () => {
    mockInsert.mockRejectedValue(new Error("db down"));
    await expect(
      logAudit({ actorId: "u1", action: "x", module: "Cases", complaintId: "case-1" })
    ).resolves.not.toThrow();
  });
});
