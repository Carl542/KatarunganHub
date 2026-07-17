import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "lupon_profiles") return { select: mockSelect, insert: mockInsert, update: mockUpdate };
      return {};
    },
  }),
}));

vi.mock("../middleware/auth.js", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requireAuth: (req, res, next) => next() };
});

const { default: luponProfilesRouter } = await import("./luponProfiles.js");

function buildTestApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use("/lupon-profiles", luponProfilesRouter);
  return app;
}

describe("lupon profiles routes", () => {
  beforeEach(() => {
    mockSelect.mockReset();
    mockInsert.mockReset();
    mockUpdate.mockReset();
  });

  it("allows any staff role to list profiles", async () => {
    mockSelect.mockReturnValue({ order: () => Promise.resolve({ data: [{ id: "lp1" }], error: null }) });
    const res = await request(buildTestApp({ id: "l1", role: "lupon" })).get("/lupon-profiles");
    expect(res.status).toBe(200);
  });

  it("rejects non admin/punong from creating a profile", async () => {
    const res = await request(buildTestApp({ id: "s1", role: "secretary" }))
      .post("/lupon-profiles")
      .send({ profileId: "p1", position: "Member" });
    expect(res.status).toBe(403);
  });

  it("allows admin to create a profile", async () => {
    mockInsert.mockReturnValue({
      select: () => ({ single: () => Promise.resolve({ data: { id: "lp1" }, error: null }) }),
    });
    const res = await request(buildTestApp({ id: "a1", role: "admin" }))
      .post("/lupon-profiles")
      .send({ profileId: "p1", position: "Member" });
    expect(res.status).toBe(201);
  });
});
