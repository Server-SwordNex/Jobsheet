// services/subscriptionReminderService.js

import dayjs from "dayjs";

import { usersCollections } from "../../config/dbCollection.js";
import { mailService } from "../../mail/mailService.js";
import whatsappService from "../../whatsapp/whatsappService.js";
import { config } from "../../config/envConfig.js";

export const runSubscriptionReminderService =
  async () => {

    try {

      console.log(
        "Running Subscription Reminder Service..."
      );

      // ================= USERS COLLECTION =================

      const userCollection = usersCollections;

      // ================= GET ACTIVE USERS =================

      const snapshot =
        await userCollection
          .where(
            "subscriptionStatus",
            "==",
            "ACTIVE"
          )
          .get();

      if (snapshot.empty) {

        console.log(
          "No active subscriptions found"
        );

        return;
      }

      const today = dayjs();

      for (const doc of snapshot.docs) {

        try {

          const user = doc.data();

          const userRef =
            userCollection.doc(doc.id);

          // ================= VALIDATION =================

          if (!user.planEndDate) {
            continue;
          }

          if (!user.email) {
            continue;
          }

          // ================= DATE =================

          const endDate = dayjs(
            user.planEndDate.toDate()
          );

          const daysLeft = endDate.diff(
            today,
            "day"
          );

          console.log(
            `${user.email} -> ${daysLeft} days left`
          );

          // ================= HISTORY =================

          const history =
            user.subscriptionReminderHistory || {};

          /*
          ==================================================
          7 DAYS REMINDER
          ==================================================
          */

          if (
            daysLeft === 7 &&
            !history.sevenDay
          ) {

            await mailService({

              type:
                "SUBSCRIPTION_EXPIRY",

              to:
                user.email,

              data: {

                name:
                  user.businessName ||

                  "User",

                plan:
                  user.plan,

                expiryDate:
                  endDate.format(
                    "DD MMM YYYY"
                  ),

                daysLeft,

              },

            });

            await userRef.update({

              "subscriptionReminderHistory.sevenDay":
                true,

              updatedAt:
                new Date(),

            });

            console.log(
              `7-day reminder sent to ${user.email}`
            );
          }

          /*
          ==================================================
          3 DAYS REMINDER
          ==================================================
          */

          else if (
            daysLeft === 3 &&
            !history.threeDay
          ) {

            await mailService({

              type:
                "SUBSCRIPTION_EXPIRY",

              to:
                user.email,

              data: {

                name:
                  user.businessName ||

                  "User",

                plan:
                  user.plan,

                expiryDate:
                  endDate.format(
                    "DD MMM YYYY"
                  ),

                daysLeft,

              },

            });

            if (user.mobileNo) {
              try {
                await whatsappService({
                  to: user.mobileNo,
                  type: "BILL_REMAINDER",
                  data: {
                    customer_name: user.businessName || "User",
                    plan_name: user.plan || "Standard",
                    expiry_date: endDate.format("DD MMM YYYY"),
                    days_left: 3,
                    software_name: config.myappRoot || "SwordNex Jobsheet"
                  }
                });
                console.log(`3-day WhatsApp billing reminder sent to ${user.email} (${user.mobileNo})`);
              } catch (whatsappErr) {
                console.error(`Failed to send 3-day WhatsApp billing reminder to ${user.email}:`, whatsappErr.message);
              }
            }

            await userRef.update({

              "subscriptionReminderHistory.threeDay":
                true,

              updatedAt:
                new Date(),

            });

            console.log(
              `3-day reminder sent to ${user.email}`
            );
          }

          /*
          ==================================================
          1 DAY REMINDER
          ==================================================
          */

          else if (
            daysLeft === 1 &&
            !history.oneDay
          ) {

            await mailService({

              type:
                "SUBSCRIPTION_EXPIRY",

              to:
                user.email,

              data: {

                name:
                  user.businessName ||

                  "User",

                plan:
                  user.plan,

                expiryDate:
                  endDate.format(
                    "DD MMM YYYY"
                  ),

                daysLeft,

              },

            });

            await userRef.update({

              "subscriptionReminderHistory.oneDay":
                true,

              updatedAt:
                new Date(),

            });

            console.log(
              `1-day reminder sent to ${user.email}`
            );
          }

          /*
          ==================================================
          EXPIRED
          ==================================================
          */

          else if (
            daysLeft < 0 &&
            !history.expired
          ) {

            await mailService({

              type:
                "SUBSCRIPTION_EXPIRED",

              to:
                user.email,

              data: {

                name:
                  user.businessName ||

                  "User",

                plan:
                  user.plan,

                expiryDate:
                  endDate.format(
                    "DD MMM YYYY"
                  ),

              },

            });

            if (user.mobileNo) {
              try {
                await whatsappService({
                  to: user.mobileNo,
                  type: "BILL_EXPIRED",
                  data: {
                    customer_name: user.businessName || "User",
                    plan_name: user.plan || "Standard",
                    expiry_date: endDate.format("DD MMM YYYY"),
                    software_name: config.myappRoot || "SwordNex Jobsheet"
                  }
                });
                console.log(`WhatsApp billing expiry message sent to ${user.email} (${user.mobileNo})`);
              } catch (whatsappErr) {
                console.error(`Failed to send WhatsApp billing expiry message to ${user.email}:`, whatsappErr.message);
              }
            }

            await userRef.update({

              plan:
                "free",

              subscriptionStatus:
                "EXPIRED",

              billingType:
                "monthly",

              subUserLimit: 1,

              currentSubUsers: 0,

              "subscriptionReminderHistory.expired":
                true,

              updatedAt:
                new Date(),

            });

            console.log(
              `Expired mail sent to ${user.email}`
            );
          }

        } catch (userError) {

          console.log(
            "User Processing Error:",
            userError
          );
        }
      }

      console.log(
        "Subscription Reminder Service Completed"
      );

    } catch (error) {

      console.log(
        "Subscription Reminder Service Error:",
        error
      );
    }
  };