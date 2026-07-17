import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";
import express from "express";
import request from "supertest";
import { requireAuth } from "./auth.js";

const TEST_SECRET = "test-secret";

function buildTestApp() {
  const app = express();
  app.get("/protected", requireAuth, (req, res) => {
    res.json({ userId: req.user.sub });
  });
  return app;
}

describe("requireAuth", () => {
  beforeAll(() => {
    process.env.SUPABASE_JWT_SECRET = TEST_SECRET;
  });

  it("rejects requests with no token", async () => {
    const res = await request(buildTestApp()).get("/protected");
    expect(res.status).toBe(401);
  });

  it("rejects requests with an invalid token", async () => {
    const res = await request(buildTestApp())
      .get("/protected")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  it("accepts a valid token and attaches req.user", async () => {
    const token = jwt.sign({ sub: "user-123", role: "secretary" }, TEST_SECRET);
    const res = await request(buildTestApp())
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe("user-123");
  });
});
