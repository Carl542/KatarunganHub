import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSelect = vi.fn();
const mockUpsert = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table) => {
      if (table === "system_settings") return { select: mockSelect, upsert: mockUpsert };
      return {};
    },
  }),
}));

vi.mock("../middleware/auth.js", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, requireAuth: (req, res, next) => next() };
});

const { default: settingsRouter } = await import("./settings.js");

function buildTestApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use("/settings", settingsRouter);
  return app;
}

describe("settings routes", () => {
  beforeEach(() => {
    mockSelect.mockReset();
    mockUpsert.mockReset();
  });

  it("returns settings as a flat object for any staff role", async () => {
    mockSelect.mockResolvedValue({
      data: [
        { key: "barangay_name", value: "Barangay Mabuhay" },
        { key: "barangay_address", value: "Digos City" },
      ],
      error: null,
    });

    const res = await request(buildTestApp({ id: "s1", role: "secretary" })).get("/settings");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ barangay_name: "Barangay Mabuhay", barangay_address: "Digos City" });
  });

  it("returns only the public identity fields with no auth required, from GET /settings/public", async () => {
    mockSelect.mockResolvedValue({
      data: [
        { key: "barangay_name", value: "Barangay Mabuhay" },
        { key: "barangay_address", value: "Digos City" },
        { key: "barangay_contact", value: "0917-000-0000" },
        { key: "case_number_format", value: "SHOULD-NOT-APPEAR" },
      ],
      error: null,
    });

    const res = await request(buildTestApp(null)).get("/settings/public");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      barangay_name: "Barangay Mabuhay",
      barangay_address: "Digos City",
      barangay_contact: "0917-000-0000",
    });
  });

  it("rejects PATCH for non-admin", async () => {
    const res = await request(buildTestApp({ id: "s1", role: "secretary" }))
      .patch("/settings")
      .send({ barangay_name: "New Name" });
    expect(res.status).toBe(403);
  });

  it("upserts settings for admin", async () => {
    mockUpsert.mockResolvedValue({ data: null, error: null });

    const res = await request(buildTestApp({ id: "a1", role: "admin" }))
      .patch("/settings")
      .send({ barangay_name: "New Name" });

    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith([{ key: "barangay_name", value: "New Name" }]);
  });
});
