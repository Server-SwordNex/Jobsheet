import { Router } from "express";
import { getSessionsHandler, revokeSessionHandler } from "../controllers/userSessionController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/api/auth/sessions", requireAuth, getSessionsHandler);
router.delete("/api/auth/sessions/:id", requireAuth, revokeSessionHandler);

export default router;
