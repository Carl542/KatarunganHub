import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSelect = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "complaints") return { select: mockSelect };
      return {};
    },
  }),
}));

vi.mock("../middleware/auth.js", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requireAuth: (req, res, next) => next() };
});

const { default: reportsRouter } = await import("./reports.js");

function buildTestApp(user) {
  const app = express();
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use("/reports", reportsRouter);
  return app;
}

function chainable(finalData) {
  // A query-builder stand-in where every filter method returns itself, and
  // the object is awaitable (thenable) to resolve with { data, error }.
  const chain = {
    gte: () => chain,
    lte: () => chain,
    eq: () => chain,
    then: (resolve) => resolve({ data: finalData, error: null }),
  };
  return chain;
}

describe("GET /reports/summary", () => {
  beforeEach(() => {
    mockSelect.mockReset();
  });

  it("rejects citizen roles", async () => {
    const res = await request(buildTestApp({ id: "u1", role: "complainant" })).get("/reports/summary");
    expect(res.status).toBe(403);
  });

  it("aggregates totals, status, and type breakdown", async () => {
    mockSelect.mockReturnValue(
      chainable([
        { status: "New", type: "Lupon" },
        { status: "Closed", type: "Lupon" },
        { status: "Closed", type: "Non-Lupon" },
      ])
    );

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get("/reports/summary");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.closed).toBe(2);
    expect(res.body.byStatus).toEqual({ New: 1, Closed: 2 });
    expect(res.body.byType).toEqual({ Lupon: 2, "Non-Lupon": 1 });
  });

  it("aggregates category and priority breakdown, defaulting unset ones", async () => {
    mockSelect.mockReturnValue(
      chainable([
        { status: "New", type: "Lupon", category: { name: "Family Dispute" }, priority: { name: "High" } },
        { status: "New", type: "Lupon", category: { name: "Family Dispute" }, priority: null },
        { status: "Closed", type: "Lupon", category: null, priority: null },
      ])
    );

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get("/reports/summary");

    expect(res.body.byCategory).toEqual({ "Family Dispute": 2, Uncategorized: 1 });
    expect(res.body.byPriority).toEqual({ High: 1, Unset: 2 });
  });

  it("applies dateFrom/dateTo/filedBy filters to the query", async () => {
    const chain = chainable([]);
    const gteSpy = vi.spyOn(chain, "gte");
    const lteSpy = vi.spyOn(chain, "lte");
    const eqSpy = vi.spyOn(chain, "eq");
    mockSelect.mockReturnValue(chain);

    await request(buildTestApp({ id: "sec-1", role: "secretary" })).get(
      "/reports/summary?dateFrom=2026-01-01&dateTo=2026-12-31&filedBy=sec-1"
    );

    expect(gteSpy).toHaveBeenCalledWith("filed_at", "2026-01-01");
    expect(lteSpy).toHaveBeenCalledWith("filed_at", "2026-12-31");
    expect(eqSpy).toHaveBeenCalledWith("created_by", "sec-1");
  });
});
