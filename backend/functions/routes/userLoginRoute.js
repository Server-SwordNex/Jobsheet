import { Router } from "express";
import { loginHandler, logoutHandler } from "../controllers/userLoginController.js";
import { rateLimit, ipAndEmailKey } from "../middleware/rateLimit.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  key: ipAndEmailKey,
  message: "Too many login attempts. Please try again in a few minutes.",
});

router.post("/api/auth/login", loginLimiter, loginHandler);
router.post("/api/auth/logout", logoutHandler);

export default router;
