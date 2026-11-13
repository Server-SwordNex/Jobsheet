import { db, getCollection } from "../config/firebaseTenantConfig.js";
import { clearEntitlementCache } from "./entitlements.js";

/* Platform-wide settings the super admin controls (platformSettings/main).

   pricingEnabled
     ON   plans, limits, features, trials and expiry apply
     OFF  Jobsheet is completely free for everyone: always active, nothing limited, every feature on
   Jobsheet starts with pricing OFF: until the super admin switches it on, everything is free. */

const TRIAL_DAYS = 14;
const BATCH = 400;

const settingsDoc = () => getCollection("platformSettings").doc("main");

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const getSettings = async () => {
  const snap = await settingsDoc().get();
  return { pricingEnabled: snap.exists && snap.data().pricingEnabled === true };
};

/**
 * Businesses that signed up while pricing was OFF have no real plan. When pricing is switched ON they
 * start a fresh free trial from that day, on the Free plan's limits (if a Free plan exists).
 */
const startTrialsForFreeSignups = async () => {
  const freeSnap = await getCollection("pricingPlans").where("billingType", "==", "free").limit(1).get();
  const free = freeSnap.empty ? null : freeSnap.docs[0].data();

  const start = new Date();
  const end = new Date(start.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  let started = 0;
  for (;;) {
    const snap = await getCollection("users").where("pricingOffSignup", "==", true).limit(BATCH).get();
    if (snap.empty) break;

    const batch = db.batch();
    snap.docs.forEach((doc) => {
      batch.update(doc.ref, {
        plan: free?.name || "Free",
        planPrice: 0,
        billingType: "free",
        jobSheetLimit: free?.jobSheetLimit ?? 0,
        staffLimit: free?.staffLimit ?? 0,
        subuserLimit: free ? (free.subuserLimit === undefined ? 0 : free.subuserLimit) : 0,
        planStartDate: start,
        planEndDate: end,
        subscriptionStatus: "ACTIVE",
        subscriptionReminderHistory: { sevenDay: false, threeDay: false, oneDay: false, renewalInvoice: false, expired: false },
        pricingOffSignup: false,
        updatedAt: new Date(),
      });
    });
    await batch.commit();
    started += snap.docs.length;
  }
  return started;
};

export const updateSettings = async (body = {}) => {
  if (body.pricingEnabled === undefined) throw httpError(400, "Nothing to update");
  if (typeof body.pricingEnabled !== "boolean") throw httpError(400, "pricingEnabled must be true or false");

  const before = await getSettings();
  await settingsDoc().set({ pricingEnabled: body.pricingEnabled, updatedAt: new Date() }, { merge: true });
  clearEntitlementCache();

  let trialsStarted = 0;
  if (body.pricingEnabled && !before.pricingEnabled) {
    trialsStarted = await startTrialsForFreeSignups();
  }

  return { pricingEnabled: body.pricingEnabled, trialsStarted };
};
