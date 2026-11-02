import { Router } from "express";
import {
  changePasswordHandler,
  forgotPasswordSendOtpHandler,
  forgotPasswordVerifyOtpHandler,
  forgotPasswordResetPasswordHandler,
} from "../controllers/securityController.js";

const router = Router();

router.post("/api/security/change-password", changePasswordHandler);
router.post("/api/security/forgot-password/send-otp", forgotPasswordSendOtpHandler);
router.post("/api/security/forgot-password/verify-otp", forgotPasswordVerifyOtpHandler);
router.post("/api/security/forgot-password/reset-password", forgotPasswordResetPasswordHandler);

export default router;
