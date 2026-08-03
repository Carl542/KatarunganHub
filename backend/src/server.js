import "dotenv/config";
import { createApp } from "./app.js";
import { runAutomated24HourReminders } from "./lib/autoReminderCron.js";

const port = process.env.PORT || 4000;
createApp().listen(port, () => {
  console.log(`backend listening on port ${port}`);

  // Run automated 24-hour SMS reminder check on startup, then every 1 hour
  runAutomated24HourReminders();
  setInterval(runAutomated24HourReminders, 60 * 60 * 1000);
});

