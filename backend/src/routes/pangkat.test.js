import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockCaseSingle = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "pangkat_formations") {
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

const { default: pangkatRouter } = await import("./pangkat.js");

function buildTestApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use("/complaints/:complaintId/pangkat", pangkatRouter);
  return app;
}

const validBody = {
  formationDate: "2026-08-01",
  chairpersonId: "p1",
  secretaryId: "p2",
  memberId: "p3",
  conflictNotes: "None declared",
};

describe("pangkat sub-resource", () => {
  beforeEach(() => {
    mockSelect.mockReset();
    mockInsert.mockReset();
    mockCaseSingle.mockReset();
    mockCaseSingle.mockResolvedValue({
      data: { id: "case-1", complainant_id: "u1", respondent_id: "u2" },
      error: null,
    });
  });

  it("rejects roles other than punong/secretary", async () => {
    const res = await request(buildTestApp({ id: "u1", role: "lupon" }))
      .post("/complaints/case-1/pangkat")
      .send(validBody);
    expect(res.status).toBe(403);
  });

  it("rejects when chairperson, secretary, and member aren't three distinct people", async () => {
    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .post("/complaints/case-1/pangkat")
      .send({ ...validBody, secretaryId: "p1" });
    expect(res.status).toBe(400);
  });

  it("creates a formation record with three distinct people", async () => {
    mockInsert.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: "pf-1", ...validBody }, error: null }),
      }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .post("/complaints/case-1/pangkat")
      .send(validBody);

    expect(res.status).toBe(201);
  });

  it("lists formations for a case", async () => {
    mockSelect.mockReturnValue({
      eq: () => ({
        order: () => Promise.resolve({ data: [{ id: "pf-1" }], error: null }),
      }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get(
      "/complaints/case-1/pangkat"
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
