import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSelect = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "notifications") return { select: mockSelect };
      return {};
    },
  }),
}));

vi.mock("../middleware/auth.js", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requireAuth: (req, res, next) => next() };
});

const { default: notificationsRouter } = await import("./notifications.js");

function buildTestApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use("/notifications", notificationsRouter);
  return app;
}

describe("GET /notifications", () => {
  beforeEach(() => {
    mockSelect.mockReset();
  });

  it("scopes to recipient_id for complainant/respondent", async () => {
    const mockEq = vi.fn().mockReturnValue({
      order: () => Promise.resolve({ data: [{ id: "n1" }], error: null }),
    });
    mockSelect.mockReturnValue({ eq: mockEq });

    const res = await request(buildTestApp({ id: "u1", role: "complainant" })).get("/notifications");

    expect(res.status).toBe(200);
    expect(mockEq).toHaveBeenCalledWith("recipient_id", "u1");
  });

  it("returns all notifications for staff roles", async () => {
    mockSelect.mockReturnValue({
      order: () => Promise.resolve({ data: [{ id: "n1" }, { id: "n2" }], error: null }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get("/notifications");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});
