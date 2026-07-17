import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSelect = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "profiles") return { select: mockSelect, update: mockUpdate };
      return {};
    },
  }),
}));

vi.mock("../middleware/auth.js", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requireAuth: (req, res, next) => next() };
});

const { default: usersRouter } = await import("./users.js");

function buildTestApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use("/users", usersRouter);
  return app;
}

describe("users admin routes", () => {
  beforeEach(() => {
    mockSelect.mockReset();
    mockUpdate.mockReset();
  });

  it("rejects GET /users for non-admin", async () => {
    const res = await request(buildTestApp({ id: "u1", role: "secretary" })).get("/users");
    expect(res.status).toBe(403);
  });

  it("lists all profiles for admin", async () => {
    mockSelect.mockReturnValue({
      order: () => Promise.resolve({ data: [{ id: "p1" }, { id: "p2" }], error: null }),
    });

    const res = await request(buildTestApp({ id: "a1", role: "admin" })).get("/users");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("rejects PATCH /users/:id for non-admin", async () => {
    const res = await request(buildTestApp({ id: "u1", role: "secretary" }))
      .patch("/users/p1")
      .send({ role: "lupon" });
    expect(res.status).toBe(403);
  });

  it("updates role/status for admin", async () => {
    mockUpdate.mockReturnValue({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: "p1", role: "lupon", status: "Active" }, error: null }),
        }),
      }),
    });

    const res = await request(buildTestApp({ id: "a1", role: "admin" }))
      .patch("/users/p1")
      .send({ role: "lupon", status: "Active" });

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ role: "lupon", status: "Active" }));
  });

  it("updates phone_number for admin", async () => {
    mockUpdate.mockReturnValue({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: "p1", phone_number: "09171234567" }, error: null }),
        }),
      }),
    });

    const res = await request(buildTestApp({ id: "a1", role: "admin" }))
      .patch("/users/p1")
      .send({ phone_number: "09171234567" });

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ phone_number: "09171234567" }));
  });
});
