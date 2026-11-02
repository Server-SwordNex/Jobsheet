import { Router } from "express";
import {
  sendOtpHandler,
  verifyOtpHandler,
  registerHandler,
} from "../controllers/userRegistrationController.js";

const router = Router();

router.post("/api/auth/send-otp", sendOtpHandler);
router.post("/api/auth/verify-otp", verifyOtpHandler);
router.post("/api/auth/register", registerHandler);

export default router;
