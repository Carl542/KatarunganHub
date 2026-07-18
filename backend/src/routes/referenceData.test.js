import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockCategoriesSelect = vi.fn();
const mockPrioritiesSelect = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "complaint_categories") return { select: mockCategoriesSelect };
      if (table === "priority_levels") return { select: mockPrioritiesSelect };
      return {};
    },
  }),
}));

vi.mock("../middleware/auth.js", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requireAuth: (req, res, next) => next() };
});

const { default: referenceDataRouter } = await import("./referenceData.js");

function buildTestApp(user) {
  const app = express();
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use("/reference-data", referenceDataRouter);
  return app;
}

describe("GET /reference-data", () => {
  beforeEach(() => {
    mockCategoriesSelect.mockReset();
    mockPrioritiesSelect.mockReset();
  });

  it("rejects citizen roles", async () => {
    const res = await request(buildTestApp({ id: "u1", role: "complainant" })).get("/reference-data");
    expect(res.status).toBe(403);
  });

  it("returns categories and priorities for staff", async () => {
    mockCategoriesSelect.mockReturnValue({
      order: () => Promise.resolve({ data: [{ id: 1, name: "Family Dispute" }], error: null }),
    });
    mockPrioritiesSelect.mockReturnValue({
      order: () => Promise.resolve({ data: [{ id: 1, name: "Low", rank: 1 }], error: null }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get("/reference-data");

    expect(res.status).toBe(200);
    expect(res.body.categories).toEqual([{ id: 1, name: "Family Dispute" }]);
    expect(res.body.priorities).toEqual([{ id: 1, name: "Low", rank: 1 }]);
  });
});
