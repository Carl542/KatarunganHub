import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockCaseSingle = vi.fn();
const mockDocSingle = vi.fn();
const mockStorageUpload = vi.fn();
const mockStorageDownload = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    storage: {
      from: () => ({ upload: mockStorageUpload, download: mockStorageDownload }),
    },
    from: (table) => {
      if (table === "documents") {
        return {
          select: (cols) => {
            if (cols && cols.includes("storage_path")) {
              return { eq: () => ({ single: mockDocSingle }) };
            }
            return mockSelect(cols);
          },
          insert: mockInsert,
          update: mockUpdate,
        };
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

const { default: documentsRouter } = await import("./documents.js");

function buildTestApp(user) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use("/complaints/:complaintId/documents", documentsRouter);
  return app;
}

describe("documents sub-resource", () => {
  beforeEach(() => {
    mockSelect.mockReset();
    mockInsert.mockReset();
    mockUpdate.mockReset();
    mockCaseSingle.mockReset();
    mockDocSingle.mockReset();
    mockStorageUpload.mockReset();
    mockStorageDownload.mockReset();
    mockCaseSingle.mockResolvedValue({
      data: { id: "case-1", complainant_id: "u1", respondent_id: "u2" },
      error: null,
    });
  });

  it("rejects an unknown document type", async () => {
    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .post("/complaints/case-1/documents")
      .send({ type: "Not a real document" });
    expect(res.status).toBe(400);
  });

  it("creates a document record with a valid type", async () => {
    mockInsert.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: "doc-1", type: "Summons", status: "Draft" }, error: null }),
      }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .post("/complaints/case-1/documents")
      .send({ type: "Summons" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("Draft");
  });

  it("lists documents for a case", async () => {
    mockSelect.mockReturnValue({
      eq: () => ({
        order: () => Promise.resolve({ data: [{ id: "doc-1" }], error: null }),
      }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get(
      "/complaints/case-1/documents"
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("rejects approval from a non-punong role", async () => {
    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).patch(
      "/complaints/case-1/documents/doc-1"
    );
    expect(res.status).toBe(403);
  });

  it("uploads a file to storage and stores its path when attached", async () => {
    mockStorageUpload.mockResolvedValue({ data: { path: "case-1/123-evidence.png" }, error: null });
    mockInsert.mockReturnValue({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: { id: "doc-1", type: "Summons", status: "Draft", storage_path: "case-1/123-evidence.png" },
            error: null,
          }),
      }),
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .post("/complaints/case-1/documents")
      .field("type", "Summons")
      .attach("file", Buffer.from("fake image bytes"), "evidence.png");

    expect(res.status).toBe(201);
    expect(mockStorageUpload).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ original_filename: "evidence.png" })
    );
  });

  it("creates a document without a file when none is attached", async () => {
    mockInsert.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: "doc-1", type: "Summons", status: "Draft" }, error: null }),
      }),
    });

    await request(buildTestApp({ id: "sec-1", role: "secretary" }))
      .post("/complaints/case-1/documents")
      .field("type", "Summons");

    expect(mockStorageUpload).not.toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ storage_path: null }));
  });

  it("downloads a document's file for a party with case access", async () => {
    mockDocSingle.mockResolvedValue({
      data: { storage_path: "case-1/123-evidence.png", original_filename: "evidence.png", complaint_id: "case-1" },
      error: null,
    });
    mockStorageDownload.mockResolvedValue({
      data: { arrayBuffer: async () => Buffer.from("fake image bytes") },
      error: null,
    });

    const res = await request(buildTestApp({ id: "u1", role: "complainant" })).get(
      "/complaints/case-1/documents/doc-1/download"
    );

    expect(res.status).toBe(200);
    expect(res.headers["content-disposition"]).toContain("evidence.png");
  });

  it("404s downloading a document with no file attached", async () => {
    mockDocSingle.mockResolvedValue({
      data: { storage_path: null, original_filename: null, complaint_id: "case-1" },
      error: null,
    });

    const res = await request(buildTestApp({ id: "sec-1", role: "secretary" })).get(
      "/complaints/case-1/documents/doc-1/download"
    );

    expect(res.status).toBe(404);
  });

  it("allows punong to approve a document", async () => {
    mockUpdate.mockReturnValue({
      eq: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({ data: { id: "doc-1", status: "Approved" }, error: null }),
        }),
      }),
    });

    const res = await request(buildTestApp({ id: "p1", role: "punong" })).patch(
      "/complaints/case-1/documents/doc-1"
    );

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Approved");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "Approved", approved_by: "p1" })
    );
  });
});
