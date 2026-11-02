import 'dotenv/config';
import { runSubscriptionReminderService } from "../cronJobs/cronService/subscriptionReminderService.js";

console.log("Starting subscription reminder test run...");
runSubscriptionReminderService()
  .then(() => {
    console.log("Subscription reminder test run finished successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Subscription reminder test run failed:", err);
    process.exit(1);
  });
