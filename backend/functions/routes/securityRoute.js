import { Router } from "express";
import {
  changePasswordHandler,
  forgotPasswordSendOtpHandler,
  forgotPasswordVerifyOtpHandler,
  forgotPasswordResetPasswordHandler,
} from "../controllers/securityController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { rateLimit, ipAndEmailKey } from "../middleware/rateLimit.js";

const router = Router();

const sendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  key: ipAndEmailKey,
  message: "Too many OTP requests. Please try again later.",
});
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  key: ipAndEmailKey,
  message: "Too many attempts. Please try again later.",
});
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  key: ipAndEmailKey,
  message: "Too many attempts. Please try again later.",
});
const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  key: (req) => `${req.ip}|${req.user?.userId || ""}`,
  message: "Too many attempts. Please try again later.",
});

router.post("/api/security/change-password", requireAuth, changePasswordLimiter, changePasswordHandler);
router.post("/api/security/forgot-password/send-otp", sendOtpLimiter, forgotPasswordSendOtpHandler);
router.post("/api/security/forgot-password/verify-otp", verifyOtpLimiter, forgotPasswordVerifyOtpHandler);
router.post("/api/security/forgot-password/reset-password", resetLimiter, forgotPasswordResetPasswordHandler);

export default router;
