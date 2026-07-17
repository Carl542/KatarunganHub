import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockCaseSingle = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "mediation_schedules") {
        return { select: mockSelect, insert: mockInsert };
      }
      if (table === "complaints") {
        return { select: () => ({ eq: () => ({ single: mockCaseSingle }) }) };
      }
      return {};
    },
  }),
}));

vi.mock("../middleware/auth.js", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requireAuth: (req, res, next) => next() };
});

const { default: schedulesRouter } = await import("./schedules.js");

function buildTestApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use("/complaints/:complaintId/schedules", schedulesRouter);
  return app;
}

describe("schedules sub-resource", () => {
  beforeEach(() => {
    mockSelect.mockReset();
    mockInsert.mockReset();
    mockCaseSingle.mockReset();
    mockCaseSingle.mockResolvedValue({
      data: { id: "case-1", complainant_id: "u1", respondent_id: "u2" },
      error: null,
    });
  });

  it("rejects non-staff roles from creating a schedule", async () => {
    const res = await request(buildTestApp({ id: "u1", role: "complainant" }))
      .post("/complaints/case-1/schedules")
      .send({ type: "Summons", scheduledAt: "2026-08-01T09:00:00Z", venue: "Barangay Hall" });
    expect(res.status).toBe(403);
  });

  it("creates a schedule for staff", async () => {
    mockInsert.mockReturnValue({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: { id: "sched-1", type: "Summons", scheduled_at: "2026-08-01T09:00:00Z" },
            error: null,
          }),
      }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .post("/complaints/case-1/schedules")
      .send({ type: "Summons", scheduledAt: "2026-08-01T09:00:00Z", venue: "Barangay Hall" });

    expect(res.status).toBe(201);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ complaint_id: "case-1", type: "Summons" })
    );
  });

  it("lists schedules for a case", async () => {
    mockSelect.mockReturnValue({
      eq: () => ({
        order: () => Promise.resolve({ data: [{ id: "sched-1" }], error: null }),
      }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get(
      "/complaints/case-1/schedules"
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
