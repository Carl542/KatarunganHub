import express from "express";
import cors from "cors";
import complaintsRouter from "./routes/complaints.js";
import schedulesRouter from "./routes/schedules.js";
import pangkatRouter from "./routes/pangkat.js";
import attendanceRouter from "./routes/attendance.js";
import documentsRouter from "./routes/documents.js";
import notificationsRouter from "./routes/notifications.js";
import auditLogsRouter from "./routes/auditLogs.js";
import reportsRouter from "./routes/reports.js";
import usersRouter from "./routes/users.js";
import luponProfilesRouter from "./routes/luponProfiles.js";
import settingsRouter from "./routes/settings.js";

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
  app.use("/notifications", notificationsRouter);
  app.use("/audit-logs", auditLogsRouter);
  app.use("/reports", reportsRouter);
  app.use("/users", usersRouter);
  app.use("/lupon-profiles", luponProfilesRouter);
  app.use("/settings", settingsRouter);

  return app;
}
