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

const router = Router();

router.get("/api/pricing-plans", getPlans);
router.get("/api/pricing-plans/:id", getPlan);
router.post("/api/pricing-plans", addPlan);
router.put("/api/pricing-plans/:id", editPlan);
router.delete("/api/pricing-plans/:id", removePlan);

router.get("/api/plans", getPlans);
router.get("/api/plans/:id", getPlan);
router.post("/api/plans", addPlan);
router.put("/api/plans/:id", editPlan);
router.delete("/api/plans/:id", removePlan);

router.get("/api/sub-user-price", getSubUserPriceHandler);
router.put("/api/sub-user-price", updateSubUserPrice);

export default router;
