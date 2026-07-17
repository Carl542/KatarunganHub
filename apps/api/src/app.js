import express from "express";
import cors from "cors";
import complaintsRouter from "./routes/complaints.js";
import schedulesRouter from "./routes/schedules.js";
import pangkatRouter from "./routes/pangkat.js";
import attendanceRouter from "./routes/attendance.js";
import documentsRouter from "./routes/documents.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.WEB_ORIGIN || "http://localhost:3000" }));
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/complaints", complaintsRouter);
  app.use("/complaints/:complaintId/schedules", schedulesRouter);
  app.use("/complaints/:complaintId/pangkat", pangkatRouter);
  app.use("/complaints/:complaintId/attendance", attendanceRouter);
  app.use("/complaints/:complaintId/documents", documentsRouter);

  return app;
}
