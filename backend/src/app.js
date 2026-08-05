import express from "express";
import cors from "cors";
import complaintsRouter from "./routes/complaints.js";
import schedulesRouter from "./routes/schedules.js";
import allSchedulesRouter from "./routes/allSchedules.js";
import pangkatRouter from "./routes/pangkat.js";
import attendanceRouter from "./routes/attendance.js";
import documentsRouter from "./routes/documents.js";
import notificationsRouter from "./routes/notifications.js";
import auditLogsRouter from "./routes/auditLogs.js";
import reportsRouter from "./routes/reports.js";
import usersRouter from "./routes/users.js";
import luponProfilesRouter from "./routes/luponProfiles.js";
import settingsRouter from "./routes/settings.js";
import referenceDataRouter from "./routes/referenceData.js";

export function createApp() {
  const app = express();
  const allowedOrigin = process.env.WEB_ORIGIN;
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          origin.endsWith(".vercel.app") ||
          origin.includes("localhost") ||
          origin.includes("127.0.0.1") ||
          (allowedOrigin && origin === allowedOrigin)
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/complaints", complaintsRouter);
  app.use("/complaints/:complaintId/schedules", schedulesRouter);
  app.use("/complaints/:complaintId/pangkat", pangkatRouter);
  app.use("/complaints/:complaintId/attendance", attendanceRouter);
  app.use("/complaints/:complaintId/documents", documentsRouter);
  app.use("/schedules", allSchedulesRouter);
  app.use("/notifications", notificationsRouter);
  app.use("/audit-logs", auditLogsRouter);
  app.use("/reports", reportsRouter);
  app.use("/users", usersRouter);
  app.use("/lupon-profiles", luponProfilesRouter);
  app.use("/settings", settingsRouter);
  app.use("/reference-data", referenceDataRouter);

  return app;
}
