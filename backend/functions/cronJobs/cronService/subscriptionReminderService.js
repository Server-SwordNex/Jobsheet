import dayjs from "dayjs";

import { usersCollections, pricingPlansCollections } from "../../config/dbCollection.js";
import { mailService } from "../../mail/mailService.js";
import whatsappService from "../../whatsapp/whatsappService.js";
import { config } from "../../config/envConfig.js";
import { getPricingEnabled } from "../../services/entitlements.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Reminder buckets, most urgent first. A user falls into the tightest bucket that
// applies (<= N days left), so a missed or delayed run never skips a reminder.
const BUCKETS = [
  { key: "oneDay", maxDays: 1 },
  { key: "threeDay", maxDays: 3 },
  { key: "sevenDay", maxDays: 7 },
];

const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

async function getFreePlan() {
  const snap = await pricingPlansCollections.where("billingType", "==", "free").limit(1).get();
  return snap.empty ? null : snap.docs[0].data();
}

async function sendWhatsappSafe(user, type, data) {
  if (!user.mobileNo) return;
  try {
    await whatsappService({ to: user.mobileNo, type, data });
  } catch (err) {
    console.error(`WhatsApp ${type} failed for ${user.email}:`, err.message);
  }
}

async function handleExpired(doc, user, endDate) {
  const expiryDate = endDate.format("DD MMM YYYY");
  const name = user.companyName || user.username || "User";

  await mailService({
    type: "SUBSCRIPTION_EXPIRED",
    to: user.email,
    data: { name, plan: user.plan, expiryDate },
  });

  await sendWhatsappSafe(user, "BILL_EXPIRED", {
    customer_name: name,
    plan_name: user.plan || "Standard",
    expiry_date: expiryDate,
    software_name: config.myappRoot || "SwordNex Jobsheet",
  });

  // Fall back to the free plan's real limits (field names match the user model).
  const freePlan = await getFreePlan();
  const downgrade = {
    plan: freePlan?.name || "free",
    planPrice: 0,
    billingType: "free",
    subscriptionStatus: "EXPIRED",
    "subscriptionReminderHistory.expired": true,
    updatedAt: new Date(),
  };
  if (freePlan) {
    downgrade.jobSheetLimit = freePlan.jobSheetLimit || 0;
    downgrade.staffLimit = freePlan.staffLimit || 0;
    downgrade.subuserLimit = freePlan.subuserLimit || 0;
  }

  await doc.ref.update(downgrade);
  console.log(`Expired + downgraded ${user.email}`);
}

async function handleUpcoming(doc, user, endDate, daysLeft) {
  const history = user.subscriptionReminderHistory || {};
  const bucket = BUCKETS.find((b) => daysLeft <= b.maxDays);
  if (!bucket || history[bucket.key]) return;

  const expiryDate = endDate.format("DD MMM YYYY");
  const name = user.companyName || user.username || "User";

  await mailService({
    type: "SUBSCRIPTION_EXPIRY",
    to: user.email,
    data: { name, plan: user.plan, expiryDate, daysLeft },
  });

  if (bucket.key === "threeDay") {
    await sendWhatsappSafe(user, "BILL_REMAINDER", {
      customer_name: name,
      plan_name: user.plan || "Standard",
      expiry_date: expiryDate,
      days_left: daysLeft,
      software_name: config.myappRoot || "SwordNex Jobsheet",
    });
  }

  // mark this bucket and every wider one as sent so they don't fire later
  const update = { updatedAt: new Date() };
  for (const b of BUCKETS) {
    if (b.maxDays >= bucket.maxDays) update[`subscriptionReminderHistory.${b.key}`] = true;
  }
  await doc.ref.update(update);
  console.log(`${bucket.key} reminder sent to ${user.email}`);
}

export const runSubscriptionReminderService = async () => {
  try {
    console.log("Running Subscription Reminder Service...");

    // pricing is off: Jobsheet is free for everyone, so no reminders and no expiry
    if (!(await getPricingEnabled())) {
      console.log("Pricing is switched off; nothing to do");
      return;
    }

    const snapshot = await usersCollections.where("subscriptionStatus", "==", "ACTIVE").get();
    if (snapshot.empty) {
      console.log("No active subscriptions found");
      return;
    }

    const now = Date.now();

    for (const doc of snapshot.docs) {
      try {
        const user = doc.data();
        const end = toDate(user.planEndDate);
        if (!end || !user.email) continue;

        const endDate = dayjs(end);
        const msLeft = end.getTime() - now;

        if (msLeft <= 0) {
          if (!user.subscriptionReminderHistory?.expired) await handleExpired(doc, user, endDate);
        } else {
          await handleUpcoming(doc, user, endDate, Math.ceil(msLeft / DAY_MS));
        }
      } catch (userError) {
        // one failing user (e.g. mail error) must not stop the run; it is retried next time
        console.error("User processing error:", userError);
      }
    }

    console.log("Subscription Reminder Service Completed");
  } catch (error) {
    console.error("Subscription Reminder Service Error:", error);
    throw error;
  }
};
