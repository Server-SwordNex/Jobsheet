import { Router } from "express";
import { getDashboardHandler } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/api/dashboard/:uid", requireAuth, getDashboardHandler);

export default router;
