import { normalizeCapabilities, toTeamLimit } from "./planCapabilities.js";

/* What one business may do right now. Pure function: the caller loads the pieces.

   user   the business profile (its own plan name, dates, saved limits)
   plan   that plan as the super admin has it now (or null if it no longer exists)

   The plan decides. The numbers saved on the profile at sign-up are only a fallback for a
   plan that has since been removed. */

const toMillis = (value) => {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  const seconds = value._seconds ?? value.seconds;
  if (seconds != null) return seconds * 1000;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
};

export const planHasEnded = (user, now = Date.now()) => {
  if (String(user?.subscriptionStatus || "").toUpperCase() === "EXPIRED") return true;
  const end = toMillis(user?.planEndDate);
  return end !== null && end < now;
};

const positiveOrNull = (value) => {
  const n = Number(value || 0);
  return n > 0 ? n : null;
};

/**
 * @param pricingEnabled the master switch on the super admin's Plans page. OFF = Jobsheet is completely
 *        free: always active, nothing limited, every feature on. ON = the plan decides.
 * @param enforceExpiry when false an ended plan is reported (`expired`) but does not block
 *        anything (there is no renewal flow yet; see ENFORCE_SUBSCRIPTION_EXPIRY).
 */
export const resolveEntitlements = ({ pricingEnabled = true, user = {}, plan = null, now = Date.now(), enforceExpiry = false }) => {
  if (!pricingEnabled) {
    return {
      pricingEnabled: false,
      active: true,
      expired: false,
      planName: user.plan || "Free",
      limits: { jobsheets: null, technicians: null, teamMembers: null },
      features: { ...ALL_FEATURES },
    };
  }

  const source = plan || user;
  const caps = normalizeCapabilities(plan?.capabilities);
  const expired = planHasEnded(user, now);

  return {
    pricingEnabled: true,
    active: enforceExpiry ? !expired : true,
    expired,
    planName: user.plan || plan?.name || "Free",
    limits: {
      jobsheets: positiveOrNull(source.jobSheetLimit),
      technicians: positiveOrNull(source.staffLimit),
      teamMembers: toTeamLimit(source.subuserLimit),
    },
    features: {
      customerUpdates: caps.customerUpdates.enabled,
      reports: caps.reports.enabled,
      customerSearch: caps.customerSearch.enabled,
      prioritySupport: caps.prioritySupport.enabled,
    },
  };
};

export const ALL_FEATURES = {
  customerUpdates: true,
  reports: true,
  customerSearch: true,
  prioritySupport: true,
};
