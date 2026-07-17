import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSelect = vi.fn();
const mockInsert = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "attendance_records") {
        return { select: mockSelect, insert: mockInsert };
      }
      return {};
    },
  }),
}));

vi.mock("../middleware/auth.js", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requireAuth: (req, res, next) => next() };
});

const { default: attendanceRouter } = await import("./attendance.js");

function buildTestApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use("/complaints/:complaintId/attendance", attendanceRouter);
  return app;
}

describe("attendance sub-resource", () => {
  beforeEach(() => {
    mockSelect.mockReset();
    mockInsert.mockReset();
  });

  it("rejects non-staff roles", async () => {
    const res = await request(buildTestApp({ id: "u1", role: "complainant" }))
      .post("/complaints/case-1/attendance")
      .send({ scheduleId: "sched-1", complainantAttendance: "Present", respondentAttendance: "Absent" });
    expect(res.status).toBe(403);
  });

  it("records attendance for staff", async () => {
    mockInsert.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: "att-1" }, error: null }),
      }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .post("/complaints/case-1/attendance")
      .send({ scheduleId: "sched-1", complainantAttendance: "Present", respondentAttendance: "Absent" });

    expect(res.status).toBe(201);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ complaint_id: "case-1", recorded_by: "sec-1" })
    );
  });

  it("lists attendance records for a case", async () => {
    mockSelect.mockReturnValue({
      eq: () => ({
        order: () => Promise.resolve({ data: [{ id: "att-1" }], error: null }),
      }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get(
      "/complaints/case-1/attendance"
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
