import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSelect = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "audit_logs") return { select: mockSelect };
      return {};
    },
  }),
}));

vi.mock("../middleware/auth.js", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requireAuth: (req, res, next) => next() };
});

const { default: auditLogsRouter } = await import("./auditLogs.js");

function buildTestApp(user) {
  const app = express();
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use("/audit-logs", auditLogsRouter);
  return app;
}

describe("GET /audit-logs", () => {
  beforeEach(() => {
    mockSelect.mockReset();
  });

  it("rejects citizen roles", async () => {
    const res = await request(buildTestApp({ id: "u1", role: "complainant" })).get("/audit-logs");
    expect(res.status).toBe(403);
  });

  it("lists audit logs for staff, newest first", async () => {
    mockSelect.mockReturnValue({
      order: () => Promise.resolve({ data: [{ id: "a1" }, { id: "a2" }], error: null }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get("/audit-logs");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("joins the actor's profile so the actor's name is available", async () => {
    mockSelect.mockReturnValue({
      order: () =>
        Promise.resolve({
          data: [{ id: "a1", actor_id: "u1", actor: { full_name: "Ana Reyes" } }],
          error: null,
        }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get("/audit-logs");

    expect(res.status).toBe(200);
    expect(res.body[0].actor.full_name).toBe("Ana Reyes");
    expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining("profiles"));
  });

  it("joins the linked complaint's reference number", async () => {
    mockSelect.mockReturnValue({
      order: () =>
        Promise.resolve({
          data: [{ id: "a1", complaint_id: "case-1", complaint: { reference_number: "REF-2026-000001" } }],
          error: null,
        }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get("/audit-logs");

    expect(res.status).toBe(200);
    expect(res.body[0].complaint.reference_number).toBe("REF-2026-000001");
    expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining("complaint"));
  });
});
