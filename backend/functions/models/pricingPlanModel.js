import { normalizeCapabilities, featureLines, toTeamLimit } from "../utils/planCapabilities.js";

// the pricing page / plan editor used "yearly" before; one canonical value is stored
const BILLING_ALIASES = { yearly: "annual" };

class PricingPlanModel {
  constructor(data = {}) {
    this.id = data.id || "";

    this.name = String(data.name || "").trim();

    const billing = data.billingType || "monthly";
    this.billingType = BILLING_ALIASES[billing] || billing;

    this.price = Number(data.price || 0);

    this.tagLine = data.tagLine || "";

    // 0 = unlimited
    this.jobSheetLimit = Math.max(0, Math.floor(Number(data.jobSheetLimit || 0)));

    // 0 = unlimited
    this.staffLimit = Math.max(0, Math.floor(Number(data.staffLimit || 0)));

    // null = unlimited team members, 0 = none
    this.subuserLimit = toTeamLimit(data.subuserLimit);

    this.popular = Boolean(data.popular);

    // the extra lines typed by hand (the limits and toggles add their own lines to the pricing card)
    const extra = data.extraFeatures ?? data.features;
    this.features = Array.isArray(extra) ? extra : [];

    this.capabilities = normalizeCapabilities(data.capabilities);

    this.createdAt = data.createdAt || new Date();

    this.updatedAt = data.updatedAt || null;
  }

  toFirestore() {
    return {
      id: this.id,
      name: this.name,
      billingType: this.billingType,
      price: this.price,
      tagLine: this.tagLine,
      jobSheetLimit: this.jobSheetLimit,
      staffLimit: this.staffLimit,
      subuserLimit: this.subuserLimit,
      popular: this.popular,
      features: this.features,
      capabilities: this.capabilities,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /** What the API returns: `features` is the full list for pricing cards, `extraFeatures` the hand-typed lines. */
  toApi() {
    return {
      ...this.toFirestore(),
      extraFeatures: this.features,
      features: [...featureLines(this), ...this.features],
    };
  }
}

export default PricingPlanModel;
