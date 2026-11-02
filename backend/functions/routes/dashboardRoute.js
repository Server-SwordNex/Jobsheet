import { Router } from "express";
import { getDashboardHandler } from "../controllers/dashboardController.js";

const router = Router();

router.get("/api/dashboard/:uid", getDashboardHandler);

export default router;
