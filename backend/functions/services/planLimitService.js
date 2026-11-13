import {
  subUsersCollection,
  techniciansCollections,
  jobsheetsCollections,
} from "../config/dbCollection.js";
import { getBusinessEntitlements } from "./entitlements.js";

/**
 * Server-side enforcement of what each plan allows. The UI also shows these, but only
 * checks made here can't be bypassed. Every check asks the entitlements first, which
 * come from the plan as the super admin has it right now.
 *
 * - a limit of null means "unlimited"
 * - a plan that has ended only blocks work when ENFORCE_SUBSCRIPTION_EXPIRY=true,
 *   because there is currently no working renewal flow: turning it on would lock
 *   accounts out for good
 */

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// month bucket in India time (UTC+5:30), matching how the product bills "per month"
export const currentMonthKey = (date = new Date()) =>
  new Date(date.getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 7);

const countOf = async (query) => (await query.count().get()).data().count;

const assertActive = (e, what) => {
  if (!e.active) {
    throw httpError(403, `Your subscription has expired. Please renew your plan to ${what}.`);
  }
};

export async function assertCanCreateJobsheet(ownerId) {
  const e = await getBusinessEntitlements(ownerId);
  assertActive(e, "create job sheets");

  const limit = e.limits.jobsheets;
  if (limit === null) return;

  // jobsheets made by the owner and by all of their sub-users count together
  const subs = await subUsersCollection.where("parentUserId", "==", String(ownerId)).get();
  const authorIds = [String(ownerId), ...subs.docs.map((d) => d.id)];
  const monthKey = currentMonthKey();

  const counts = await Promise.all(
    authorIds.map((id) =>
      countOf(jobsheetsCollections.where("generatedById", "==", id).where("monthKey", "==", monthKey))
    )
  );
  const used = counts.reduce((a, b) => a + b, 0);

  if (used >= limit) {
    throw httpError(403, `Monthly job sheet limit reached (${used}/${limit}). Upgrade your plan to create more.`);
  }
}

export async function assertCanCreateTechnician(ownerId) {
  const e = await getBusinessEntitlements(ownerId);
  assertActive(e, "add technicians");

  const limit = e.limits.technicians;
  if (limit === null) return;

  const used = await countOf(techniciansCollections.where("technicianOf", "==", String(ownerId)));
  if (used >= limit) {
    throw httpError(403, `Technician limit reached (${used}/${limit}). Upgrade your plan to add more.`);
  }
}

export async function assertCanCreateSubuser(ownerId) {
  const e = await getBusinessEntitlements(ownerId);
  assertActive(e, "add team members");

  const limit = e.limits.teamMembers;
  if (limit === null) return;

  const used = await countOf(subUsersCollection.where("parentUserId", "==", String(ownerId)));
  if (used >= limit) {
    throw httpError(403, `Team member limit reached (${used}/${limit}). Upgrade your plan to add more.`);
  }
}

/** Does this business's plan include `feature`? (false when the account cannot be found) */
export async function hasFeature(accountId, feature) {
  try {
    const e = await getBusinessEntitlements(accountId);
    return Boolean(e.features[feature]);
  } catch {
    return false;
  }
}
