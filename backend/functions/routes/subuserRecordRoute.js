import { Router } from "express";
import { getAdminSubuserRecordsHandler } from "../controllers/subuserRecordController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireFeature } from "../middleware/featureGuard.js";

const router = Router();

router.get(
  "/api/subusers/records/:parentUid",
  requireAuth,
  requireFeature("reports", "Reports"),
  getAdminSubuserRecordsHandler
);

export default router;
