import { usersCollections, subUsersCollection, pricingPlansCollections } from "../config/dbCollection.js";
import { getCollection } from "../config/firebaseTenantConfig.js";
import { resolveEntitlements } from "../utils/entitlementRules.js";

/* Loads what a business may do right now (see utils/entitlementRules.js for the rules).
   Plans are cached for a few seconds so a busy account does not re-read them on every request;
   changing a plan clears the cache on this instance. */

const TTL_MS = 15 * 1000;
const planCache = new Map(); // "name|billingType" -> { plan, exp }
let settingsCache = null; // { pricingEnabled, exp }

export const clearEntitlementCache = () => {
  planCache.clear();
  settingsCache = null;
};

/** The pricing master switch. Jobsheet starts with pricing OFF (everything free) until it is switched on. */
export const getPricingEnabled = async () => {
  if (settingsCache && settingsCache.exp > Date.now()) return settingsCache.pricingEnabled;

  const snap = await getCollection("platformSettings").doc("main").get();
  const pricingEnabled = snap.exists && snap.data().pricingEnabled === true;

  settingsCache = { pricingEnabled, exp: Date.now() + TTL_MS };
  return pricingEnabled;
};

// Ended plans only block work when explicitly switched on: there is no renewal flow yet.
const expiryEnforced = () => String(process.env.ENFORCE_SUBSCRIPTION_EXPIRY || "").toLowerCase() === "true";

const findPlan = async (name, billingType) => {
  if (!name) return null;

  const key = `${name}|${billingType || ""}`;
  const hit = planCache.get(key);
  if (hit && hit.exp > Date.now()) return hit.plan;

  let query = pricingPlansCollections.where("name", "==", name);
  if (billingType) query = query.where("billingType", "==", billingType);
  const snap = await query.limit(1).get();

  const plan = snap.empty ? null : snap.docs[0].data();
  planCache.set(key, { plan, exp: Date.now() + TTL_MS });
  return plan;
};

/** Entitlements for the business whose profile id is `accountId` (a sub-user's id resolves to its parent). */
export const getBusinessEntitlements = async (accountId) => {
  let snap = accountId ? await usersCollections.doc(String(accountId)).get() : { exists: false };

  if (!snap.exists && accountId) {
    const member = await subUsersCollection.doc(String(accountId)).get();
    if (member.exists && member.data().parentUserId) {
      snap = await usersCollections.doc(String(member.data().parentUserId)).get();
    }
  }

  if (!snap.exists) {
    const err = new Error("Account not found");
    err.status = 404;
    throw err;
  }

  const user = snap.data();
  const pricingEnabled = await getPricingEnabled();
  const plan = pricingEnabled ? await findPlan(user.plan, user.billingType) : null;

  return resolveEntitlements({ pricingEnabled, user, plan, enforceExpiry: expiryEnforced() });
};
