import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSelect = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "mediation_schedules") return { select: mockSelect };
      return {};
    },
  }),
}));

vi.mock("../middleware/auth.js", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requireAuth: (req, res, next) => next() };
});

const { default: allSchedulesRouter } = await import("./allSchedules.js");

function buildTestApp(user) {
  const app = express();
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use("/schedules", allSchedulesRouter);
  return app;
}

describe("GET /schedules", () => {
  beforeEach(() => {
    mockSelect.mockReset();
  });

  it("rejects citizen roles", async () => {
    const res = await request(buildTestApp({ id: "u1", role: "complainant" })).get("/schedules");
    expect(res.status).toBe(403);
  });

  it("lists schedules across all cases with the complaint reference joined", async () => {
    mockSelect.mockReturnValue({
      order: () =>
        Promise.resolve({
          data: [
            {
              id: "sched-1",
              scheduled_at: "2026-08-01T09:00:00Z",
              complaint: { reference_number: "REF-2026-000001", title: "Noise dispute" },
            },
          ],
          error: null,
        }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get("/schedules");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].complaint.reference_number).toBe("REF-2026-000001");
    expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining("complaint"));
  });
});
