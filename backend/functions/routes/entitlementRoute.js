import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { isSuperAdmin } from "../middleware/access.js";
import { getBusinessEntitlements, getPricingEnabled } from "../services/entitlements.js";
import { ALL_FEATURES } from "../utils/entitlementRules.js";

const router = Router();

/* Public: lets the sign-up and pricing pages say "free" when pricing is switched off. */
router.get("/api/pricing-status", async (req, res) => {
  try {
    res.json({ pricingEnabled: await getPricingEnabled() });
  } catch (error) {
    res.status(500).json({ error: "Could not read the pricing status" });
  }
});

/* What the signed-in business may do (the app hides screens and buttons from this). */
router.get("/api/me/entitlements", requireAuth, async (req, res) => {
  try {
    if (isSuperAdmin(req.user)) {
      return res.json({
        data: {
          pricingEnabled: await getPricingEnabled(),
          active: true,
          expired: false,
          planName: "Super admin",
          limits: { jobsheets: null, technicians: null, teamMembers: null },
          features: { ...ALL_FEATURES },
        },
      });
    }

    const accountId = req.user.parentUid || req.user.userId;
    return res.json({ data: await getBusinessEntitlements(accountId) });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
});

export default router;
