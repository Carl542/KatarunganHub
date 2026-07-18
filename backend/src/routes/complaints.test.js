import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSelectCount = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockLogInsert = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "complaints") {
        return {
          select: mockSelectCount,
          insert: mockInsert,
          update: mockUpdate,
        };
      }
      if (table === "case_status_logs") {
        return { insert: mockLogInsert };
      }
      return {};
    },
  }),
}));

// requireAuth normally verifies a real Supabase Bearer token. In these route
// tests, auth is out of scope (covered by auth.test.js) — trust req.user as
// injected by buildTestApp below, and keep the real requireRole (pure, no I/O).
vi.mock("../middleware/auth.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    requireAuth: (req, res, next) => next(),
  };
});

const { default: complaintsRouter } = await import("./complaints.js");

function buildTestApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use("/complaints", complaintsRouter);
  return app;
}

describe("POST /complaints", () => {
  beforeEach(() => {
    mockSelectCount.mockReset();
    mockInsert.mockReset();
  });

  it("rejects non-secretary roles", async () => {
    const res = await request(buildTestApp({ id: "u1", role: "complainant" }))
      .post("/complaints")
      .send({ title: "Neighbor dispute", complainantId: "u1", type: "Lupon" });
    expect(res.status).toBe(403);
  });

  it("creates a case and returns a reference number for secretary", async () => {
    mockSelectCount.mockResolvedValue({ count: 41, error: null });
    mockInsert.mockReturnValue({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: { id: "case-1", reference_number: "REF-2026-000042", title: "Neighbor dispute" },
            error: null,
          }),
      }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .post("/complaints")
      .send({ title: "Neighbor dispute", complainantId: "u1", type: "Lupon" });

    expect(res.status).toBe(201);
    expect(res.body.reference_number).toBe("REF-2026-000042");
  });

  it("sends null instead of empty string for an omitted respondentId", async () => {
    mockSelectCount.mockResolvedValue({ count: 41, error: null });
    mockInsert.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: "case-1" }, error: null }),
      }),
    });

    await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .post("/complaints")
      .send({ title: "Neighbor dispute", complainantId: "u1", respondentId: "", type: "Lupon" });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ respondent_id: null })
    );
  });

  it("stores category_id and priority_id when provided", async () => {
    mockSelectCount.mockResolvedValue({ count: 41, error: null });
    mockInsert.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: "case-1" }, error: null }),
      }),
    });

    await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .post("/complaints")
      .send({ title: "Neighbor dispute", complainantId: "u1", type: "Lupon", categoryId: 2, priorityId: 3 });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ category_id: 2, priority_id: 3 })
    );
  });
});

describe("GET /complaints/:id", () => {
  beforeEach(() => {
    mockSelectCount.mockReset();
  });

  it("returns 404 when the case does not exist", async () => {
    mockSelectCount.mockReturnValue({
      eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: "not found" } }) }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get(
      "/complaints/does-not-exist"
    );
    expect(res.status).toBe(404);
  });

  it("allows staff roles to view any case", async () => {
    mockSelectCount.mockReturnValue({
      eq: () => ({
        single: () =>
          Promise.resolve({
            data: { id: "case-1", complainant_id: "other-1", respondent_id: "other-2" },
            error: null,
          }),
      }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get(
      "/complaints/case-1"
    );
    expect(res.status).toBe(200);
  });

  it("forbids a non-party complainant from viewing another party's case", async () => {
    mockSelectCount.mockReturnValue({
      eq: () => ({
        single: () =>
          Promise.resolve({
            data: { id: "case-1", complainant_id: "other-1", respondent_id: "other-2" },
            error: null,
          }),
      }),
    });

    const res = await request(buildTestApp({ id: "u1", role: "complainant" })).get(
      "/complaints/case-1"
    );
    expect(res.status).toBe(403);
  });

  it("embeds the creator's name and status log history for the Workflow tab", async () => {
    let capturedSelect;
    mockSelectCount.mockImplementation((selectArg) => {
      capturedSelect = selectArg;
      return {
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: {
                id: "case-1",
                complainant_id: "other-1",
                respondent_id: "other-2",
                creator: { full_name: "Ana Reyes" },
                status_logs: [{ next_stage: "Jurisdiction review", created_at: "2026-07-18", actor: { full_name: "Ana Reyes" } }],
              },
              error: null,
            }),
        }),
      };
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get(
      "/complaints/case-1"
    );

    expect(res.status).toBe(200);
    expect(res.body.creator.full_name).toBe("Ana Reyes");
    expect(res.body.status_logs[0].actor.full_name).toBe("Ana Reyes");
    expect(capturedSelect).toEqual(expect.stringContaining("creator:profiles!created_by"));
    expect(capturedSelect).toEqual(expect.stringContaining("status_logs:case_status_logs"));
  });
});

describe("PATCH /complaints/:id/workflow", () => {
  beforeEach(() => {
    mockSelectCount.mockReset();
    mockUpdate.mockReset();
    mockLogInsert.mockReset();
    mockLogInsert.mockResolvedValue({ data: null, error: null });
  });

  function mockCurrentStage(stage, type = "Lupon") {
    mockSelectCount.mockReturnValue({
      eq: () => ({ single: () => Promise.resolve({ data: { workflow_stage: stage, type }, error: null }) }),
    });
  }

  it("returns 404 when the case does not exist", async () => {
    mockSelectCount.mockReturnValue({
      eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: "not found" } }) }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .patch("/complaints/does-not-exist/workflow")
      .send({ outcome: "Proceed to mediation" });

    expect(res.status).toBe(404);
  });

  it("rejects a role that cannot act on the current stage", async () => {
    mockCurrentStage("Punong Barangay mediation");

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .patch("/complaints/case-1/workflow")
      .send({ outcome: "Settlement reached" });

    expect(res.status).toBe(403);
  });

  it("rejects an outcome that isn't valid for the current stage", async () => {
    mockCurrentStage("Summons issued");

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .patch("/complaints/case-1/workflow")
      .send({ outcome: "Not a real outcome" });

    expect(res.status).toBe(400);
  });

  it("advances the stage, updates status, and logs the transition on success", async () => {
    mockCurrentStage("Summons issued");
    mockUpdate.mockReturnValue({
      eq: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({
              data: { id: "case-1", workflow_stage: "Punong Barangay mediation", status: "Under Mediation" },
              error: null,
            }),
        }),
      }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .patch("/complaints/case-1/workflow")
      .send({ outcome: "Proceed to mediation", notes: "Both parties notified" });

    expect(res.status).toBe(200);
    expect(res.body.workflow_stage).toBe("Punong Barangay mediation");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ workflow_stage: "Punong Barangay mediation", status: "Under Mediation" })
    );
    expect(mockLogInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        complaint_id: "case-1",
        previous_stage: "Summons issued",
        outcome: "Proceed to mediation",
        next_stage: "Punong Barangay mediation",
      })
    );
  });

  it("uses Non-Lupon rules for a Non-Lupon case: secretary can act, punong cannot", async () => {
    mockCurrentStage("Received", "Non-Lupon");

    const punongRes = await request(buildTestApp({ id: "p1", role: "punong" }))
      .patch("/complaints/case-1/workflow")
      .send({ outcome: "Assigned to office/department" });
    expect(punongRes.status).toBe(403);

    mockUpdate.mockReturnValue({
      eq: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({
              data: { id: "case-1", workflow_stage: "Assigned", status: "Active" },
              error: null,
            }),
        }),
      }),
    });

    const secretaryRes = await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .patch("/complaints/case-1/workflow")
      .send({ outcome: "Assigned to office/department" });

    expect(secretaryRes.status).toBe(200);
    expect(secretaryRes.body.workflow_stage).toBe("Assigned");
  });
});
