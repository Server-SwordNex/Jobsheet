import { Router } from "express";
import {
  getPlans,
  getPlan,
  addPlan,
  editPlan,
  removePlan,
  updateSubUserPrice,
  getSubUserPriceHandler,
} from "../controllers/pricingPlanController.js";
import { requireAdminAuth } from "../middleware/adminAuthMiddleware.js";

const router = Router();

router.get("/api/pricing-plans", getPlans);
router.get("/api/pricing-plans/:id", getPlan);
router.post("/api/pricing-plans", requireAdminAuth, addPlan);
router.put("/api/pricing-plans/:id", requireAdminAuth, editPlan);
router.delete("/api/pricing-plans/:id", requireAdminAuth, removePlan);

router.get("/api/plans", getPlans);
router.get("/api/plans/:id", getPlan);
router.post("/api/plans", requireAdminAuth, addPlan);
router.put("/api/plans/:id", requireAdminAuth, editPlan);
router.delete("/api/plans/:id", requireAdminAuth, removePlan);

router.get("/api/sub-user-price", getSubUserPriceHandler);
router.put("/api/sub-user-price", requireAdminAuth, updateSubUserPrice);

export default router;
