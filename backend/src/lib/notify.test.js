import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInsert = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "notifications") return { insert: mockInsert };
      return {};
    },
  }),
}));

const { notify } = await import("./notify.js");

describe("notify", () => {
  beforeEach(() => {
    mockInsert.mockReset();
    mockInsert.mockResolvedValue({ data: null, error: null });
  });

  it("inserts a queued notification with the given fields", async () => {
    await notify({ recipientId: "u1", complaintId: "case-1", message: "Case updated" });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient_id: "u1",
        complaint_id: "case-1",
        message: "Case updated",
        channel: "SMS",
        status: "Queued",
      })
    );
  });

  it("respects an explicit channel", async () => {
    await notify({ recipientId: "u1", complaintId: "case-1", message: "x", channel: "In-app" });

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ channel: "In-app" }));
  });

  it("does not throw when the recipient is missing", async () => {
    await expect(notify({ recipientId: null, complaintId: "case-1", message: "x" })).resolves.not.toThrow();
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
