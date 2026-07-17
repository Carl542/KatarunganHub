import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSingle = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ single: mockSingle }),
      }),
    }),
  }),
}));

const { requireCaseAccess } = await import("./caseAccess.js");

function buildTestApp(user) {
  const app = express();
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.get("/complaints/:complaintId/thing", requireCaseAccess, (req, res) => {
    res.json({ ok: true, complaintId: req.complaint.id });
  });
  return app;
}

describe("requireCaseAccess", () => {
  beforeEach(() => {
    mockSingle.mockReset();
  });

  it("returns 404 when the case does not exist", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "not found" } });
    const res = await request(buildTestApp({ id: "u1", role: "complainant" })).get(
      "/complaints/case-1/thing"
    );
    expect(res.status).toBe(404);
  });

  it("allows staff regardless of party membership", async () => {
    mockSingle.mockResolvedValue({
      data: { id: "case-1", complainant_id: "other-1", respondent_id: "other-2" },
      error: null,
    });
    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get(
      "/complaints/case-1/thing"
    );
    expect(res.status).toBe(200);
  });

  it("forbids a non-party complainant", async () => {
    mockSingle.mockResolvedValue({
      data: { id: "case-1", complainant_id: "other-1", respondent_id: "other-2" },
      error: null,
    });
    const res = await request(buildTestApp({ id: "u1", role: "complainant" })).get(
      "/complaints/case-1/thing"
    );
    expect(res.status).toBe(403);
  });

  it("allows a matching complainant", async () => {
    mockSingle.mockResolvedValue({
      data: { id: "case-1", complainant_id: "u1", respondent_id: "other-2" },
      error: null,
    });
    const res = await request(buildTestApp({ id: "u1", role: "complainant" })).get(
      "/complaints/case-1/thing"
    );
    expect(res.status).toBe(200);
  });
});
