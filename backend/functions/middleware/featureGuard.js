import { hasFeature } from "../services/planLimitService.js";
import { isSuperAdmin } from "./access.js";

/** Route guard (run after requireAuth): the caller's business plan must include `feature`. */
export const requireFeature = (feature, what) => async (req, res, next) => {
  try {
    if (isSuperAdmin(req.user)) return next();

    const accountId = req.user.parentUid || req.user.userId;
    if (await hasFeature(accountId, feature)) return next();

    return res.status(403).json({
      error: `${what} is not included in your plan. Please upgrade.`,
      code: "NOT_IN_PLAN",
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
};
