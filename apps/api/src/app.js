import express from "express";
import complaintsRouter from "./routes/complaints.js";

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/complaints", complaintsRouter);

  return app;
}
