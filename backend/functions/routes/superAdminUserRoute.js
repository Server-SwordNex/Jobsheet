import { Router } from "express";
import { getAggregatedUsersDetailsHandler } from "../controllers/superAdminUserController.js";

const router = Router();

router.get("/api/superadmin/users/all-details", getAggregatedUsersDetailsHandler);

export default router;
