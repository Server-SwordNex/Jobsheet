import { Router } from "express";
import { getSessionsHandler, revokeSessionHandler } from "../controllers/userSessionController.js";

const router = Router();

router.get("/api/auth/sessions", getSessionsHandler);
router.delete("/api/auth/sessions/:id", revokeSessionHandler);

export default router;
