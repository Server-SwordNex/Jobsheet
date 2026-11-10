import { Router } from "express";
import { getDashboardHandler } from "../controllers/dashboardController.js";
import { requireAdminAuth } from "../middleware/adminAuthMiddleware.js";

const router = Router();

router.get("/api/dashboard/:uid", (req, res, next) => {
  if (req.params.uid === "superadmin") {
    return requireAdminAuth(req, res, next);
  }
  next();
}, getDashboardHandler);

export default router;
