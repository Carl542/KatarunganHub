import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSelectCount = vi.fn();
const mockInsert = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "complaints") {
        return {
          select: mockSelectCount,
          insert: mockInsert,
        };
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
});
