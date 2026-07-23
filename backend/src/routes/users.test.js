import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockInsert = vi.fn();
const mockCreateUser = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: { admin: { createUser: mockCreateUser } },
    from: (table) => {
      if (table === "profiles") return { select: mockSelect, update: mockUpdate, insert: mockInsert };
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
    mockInsert.mockReset();
    mockCreateUser.mockReset();
  });

  it("rejects GET /users for non-admin", async () => {
    const res = await request(buildTestApp({ id: "u1", role: "secretary" })).get("/users");
    expect(res.status).toBe(403);
  });

  it("rejects GET /users/lookup for citizen roles", async () => {
    const res = await request(buildTestApp({ id: "u1", role: "complainant" })).get("/users/lookup");
    expect(res.status).toBe(403);
  });

  it("lists minimal profile fields for staff roles on GET /users/lookup", async () => {
    mockSelect.mockReturnValue({
      order: () => Promise.resolve({ data: [{ id: "p1", full_name: "Maria Santos", role: "complainant" }], error: null }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get("/users/lookup");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "p1", full_name: "Maria Santos", role: "complainant" }]);
    expect(mockSelect).toHaveBeenCalledWith("id, full_name, role");
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

  it("updates full_name for admin", async () => {
    mockUpdate.mockReturnValue({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: "p1", full_name: "Carl Vincent Amil" }, error: null }),
        }),
      }),
    });

    const res = await request(buildTestApp({ id: "a1", role: "admin" }))
      .patch("/users/p1")
      .send({ full_name: "Carl Vincent Amil" });

    expect(res.status).toBe(200);
    expect(res.body.full_name).toBe("Carl Vincent Amil");
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ full_name: "Carl Vincent Amil" }));
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

  it("rejects POST /users for roles other than admin/secretary", async () => {
    const res = await request(buildTestApp({ id: "l1", role: "lupon" }))
      .post("/users")
      .send({ fullName: "Maria Santos", role: "complainant" });
    expect(res.status).toBe(403);
  });

  it("rejects secretary registering a non-resident role", async () => {
    const res = await request(buildTestApp({ id: "s1", role: "secretary" }))
      .post("/users")
      .send({ fullName: "Someone", role: "lupon" });
    expect(res.status).toBe(403);
  });

  it("lets secretary register a new complainant with an auto-generated email and temp password", async () => {
    mockCreateUser.mockResolvedValue({ data: { user: { id: "new-1" } }, error: null });
    mockInsert.mockReturnValue({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: { id: "new-1", full_name: "Maria Santos", role: "complainant" },
            error: null,
          }),
      }),
    });

    const res = await request(buildTestApp({ id: "s1", role: "secretary" }))
      .post("/users")
      .send({ fullName: "Maria Santos", phoneNumber: "09171234567", role: "complainant" });

    expect(res.status).toBe(201);
    expect(res.body.tempPassword).toHaveLength(10);
    expect(res.body.email).toMatch(/@resident\.katarunganhub\.local$/);
    expect(mockCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({ password: res.body.tempPassword, email_confirm: true })
    );
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: "new-1", full_name: "Maria Santos", role: "complainant", phone_number: "09171234567" })
    );
  });

  it("stores address, ID type, and ID number when provided", async () => {
    mockCreateUser.mockResolvedValue({ data: { user: { id: "new-3" } }, error: null });
    mockInsert.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: "new-3", full_name: "Maria Santos", role: "complainant" }, error: null }),
      }),
    });

    await request(buildTestApp({ id: "s1", role: "secretary" }))
      .post("/users")
      .send({
        fullName: "Maria Santos",
        role: "complainant",
        address: "Purok 3, Zone 1",
        idType: "Voter's ID",
        idNumber: "1234-5678-9012",
      });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        address: "Purok 3, Zone 1",
        id_type: "Voter's ID",
        id_number: "1234-5678-9012",
      })
    );
  });

  it("lets admin register any role, using a provided email as-is", async () => {
    mockCreateUser.mockResolvedValue({ data: { user: { id: "new-2" } }, error: null });
    mockInsert.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: "new-2", full_name: "Elena Cruz", role: "lupon" }, error: null }),
      }),
    });

    const res = await request(buildTestApp({ id: "a1", role: "admin" }))
      .post("/users")
      .send({ fullName: "Elena Cruz", email: "elena@example.com", role: "lupon" });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("elena@example.com");
    expect(mockCreateUser).toHaveBeenCalledWith(expect.objectContaining({ email: "elena@example.com" }));
  });

  it("returns 400 when account creation fails", async () => {
    mockCreateUser.mockResolvedValue({ data: null, error: { message: "Email already registered" } });

    const res = await request(buildTestApp({ id: "s1", role: "secretary" }))
      .post("/users")
      .send({ fullName: "Maria Santos", email: "dup@example.com", role: "complainant" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email already registered");
  });
});
