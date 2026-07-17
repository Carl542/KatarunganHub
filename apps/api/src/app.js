import express from "express";
import cors from "cors";
import complaintsRouter from "./routes/complaints.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.WEB_ORIGIN || "http://localhost:3000" }));
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/complaints", complaintsRouter);

  return app;
}
