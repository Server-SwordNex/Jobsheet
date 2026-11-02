// cron/subscriptionReminderCron.js

import cron from "node-cron";

import { runSubscriptionReminderService } from "./cronService/subscriptionReminderService.js";

const subscriptionReminderCron = () => {

  /*
  ==================================================
  RUN EVERY DAY AT 9:00 AM
  ==================================================
  */

  cron.schedule("0 9 * * *", async () => {

    console.log(
      "Subscription Reminder Cron Started"
    );

    await runSubscriptionReminderService();

  });

};

export default subscriptionReminderCron;