import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import app from "./server.js";
import { runSubscriptionReminderService } from "./cronJobs/cronService/subscriptionReminderService.js";

export const jobsheetApi = onRequest(
  {
    region: "asia-south1",
    timeoutSeconds: 300,
    memory: "512MiB",
    maxInstances: 10,
    invoker: "public",
    // the one super admin login shared by every SwordNex app (existing secrets, same as Invoice)
    secrets: ["SWORDNEX_SUPERADMIN_USERNAME", "SWORDNEX_SUPERADMIN_PASSWORD"],
  },
  app
);

// Daily subscription reminders / expiry. Runs on Cloud Scheduler so it fires exactly
// once per day regardless of how many API instances exist (an in-process node-cron
// job would not run while the API is scaled to zero, and would run once per instance).
export const jobsheetReminders = onSchedule(
  {
    region: "asia-south1",
    schedule: "0 9 * * *",
    timeZone: "Asia/Kolkata",
    timeoutSeconds: 540,
    memory: "512MiB",
  },
  async () => {
    await runSubscriptionReminderService();
  }
);
