import { Router } from "express";
import { getAggregatedUsersDetailsHandler } from "../controllers/superAdminUserController.js";
import { requireAdminAuth } from "../middleware/adminAuthMiddleware.js";

const router = Router();

router.get("/api/superadmin/users/all-details", requireAdminAuth, getAggregatedUsersDetailsHandler);

export default router;
