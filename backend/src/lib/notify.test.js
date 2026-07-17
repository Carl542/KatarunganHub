import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockInsert = vi.fn();
const mockNotificationsUpdate = vi.fn();
const mockProfilesSelect = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "notifications") return { insert: mockInsert, update: mockNotificationsUpdate };
      if (table === "profiles") return { select: mockProfilesSelect };
      return {};
    },
  }),
}));

const { notify } = await import("./notify.js");

describe("notify", () => {
  beforeEach(() => {
    mockInsert.mockReset();
    mockNotificationsUpdate.mockReset();
    mockProfilesSelect.mockReset();
    mockInsert.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: "n1" }, error: null }),
      }),
    });
    mockNotificationsUpdate.mockReturnValue({ eq: () => Promise.resolve({ data: null, error: null }) });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true })));
    process.env.SEMAPHORE_API_KEY = "test-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SEMAPHORE_API_KEY;
  });

  it("inserts a queued notification with the given fields", async () => {
    mockProfilesSelect.mockReturnValue({
      eq: () => ({ single: () => Promise.resolve({ data: { phone_number: null }, error: null }) }),
    });

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

  it("respects an explicit channel and skips SMS sending for non-SMS channels", async () => {
    await notify({ recipientId: "u1", complaintId: "case-1", message: "x", channel: "In-app" });

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ channel: "In-app" }));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not throw when the recipient is missing", async () => {
    await expect(notify({ recipientId: null, complaintId: "case-1", message: "x" })).resolves.not.toThrow();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("sends an SMS via Semaphore when the recipient has a phone number", async () => {
    mockProfilesSelect.mockReturnValue({
      eq: () => ({ single: () => Promise.resolve({ data: { phone_number: "09171234567" }, error: null }) }),
    });

    await notify({ recipientId: "u1", complaintId: "case-1", message: "Case updated" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.semaphore.co/api/v4/messages",
      expect.objectContaining({ method: "POST" })
    );
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("apikey")).toBe("test-key");
    expect(body.get("number")).toBe("09171234567");
    expect(body.get("message")).toBe("Case updated");
    expect(mockNotificationsUpdate).toHaveBeenCalledWith({ status: "Sent" });
  });

  it("marks the notification Failed when the recipient has no phone number", async () => {
    mockProfilesSelect.mockReturnValue({
      eq: () => ({ single: () => Promise.resolve({ data: { phone_number: null }, error: null }) }),
    });

    await notify({ recipientId: "u1", complaintId: "case-1", message: "x" });

    expect(fetch).not.toHaveBeenCalled();
    expect(mockNotificationsUpdate).toHaveBeenCalledWith({ status: "Failed" });
  });

  it("marks the notification Failed when the Semaphore request fails", async () => {
    mockProfilesSelect.mockReturnValue({
      eq: () => ({ single: () => Promise.resolve({ data: { phone_number: "09171234567" }, error: null }) }),
    });
    fetch.mockResolvedValue({ ok: false });

    await notify({ recipientId: "u1", complaintId: "case-1", message: "x" });

    expect(mockNotificationsUpdate).toHaveBeenCalledWith({ status: "Failed" });
  });

  it("skips SMS sending entirely when SEMAPHORE_API_KEY is not configured", async () => {
    delete process.env.SEMAPHORE_API_KEY;

    await notify({ recipientId: "u1", complaintId: "case-1", message: "x" });

    expect(mockProfilesSelect).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});
