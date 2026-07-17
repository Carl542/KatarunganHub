import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockGetUser = vi.fn();
const mockSingle = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: mockSingle,
        }),
      }),
    }),
  }),
}));

const { requireAuth } = await import("./auth.js");

function buildTestApp() {
  const app = express();
  app.get("/protected", requireAuth, (req, res) => {
    res.json({ userId: req.user.id, role: req.user.role });
  });
  return app;
}

describe("requireAuth", () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockSingle.mockReset();
  });

  it("rejects requests with no token", async () => {
    const res = await request(buildTestApp()).get("/protected");
    expect(res.status).toBe(401);
  });

  it("rejects requests with an invalid token", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "invalid" } });
    const res = await request(buildTestApp())
      .get("/protected")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("accepts a valid token and attaches req.user with role from profiles", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-123", email: "a@b.com" } }, error: null });
    mockSingle.mockResolvedValue({ data: { role: "secretary", full_name: "Ana Reyes" }, error: null });

    const res = await request(buildTestApp())
      .get("/protected")
      .set("Authorization", "Bearer a-valid-token");

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe("user-123");
    expect(res.body.role).toBe("secretary");
  });
});
