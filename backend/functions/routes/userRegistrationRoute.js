import { Router } from "express";
import {
  sendOtpHandler,
  verifyOtpHandler,
  registerHandler,
  activateHandler,
} from "../controllers/userRegistrationController.js";
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
// attempts per hour per address; REGISTER_RATE_LIMIT_MAX exists so automated tests can raise it
const hourlyMax = Number(process.env.REGISTER_RATE_LIMIT_MAX) || 10;
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: hourlyMax,
  message: "Too many registration attempts. Please try again later.",
});
const activateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: hourlyMax,
  message: "Too many attempts. Please try again later.",
});

router.post("/api/auth/send-otp", sendOtpLimiter, sendOtpHandler);
router.post("/api/auth/verify-otp", verifyOtpLimiter, verifyOtpHandler);
router.post("/api/auth/register", registerLimiter, registerHandler);
router.post("/api/auth/activate", activateLimiter, activateHandler);

export default router;
