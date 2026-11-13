import { Router } from "express";
import { uploadMiddleware, createJobsheetHandler, getJobsheetsByUserHandler, updateJobsheetStatusHandler, searchJobsheetHandler } from "../controllers/jobsheetController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

// public lookup: throttle to make enumerating job ids / mobile numbers impractical
const searchLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: "Too many searches. Please try again later.",
});

router.get("/api/jobsheets/search", searchLimiter, searchJobsheetHandler);
router.post("/api/jobsheets", requireAuth, uploadMiddleware, createJobsheetHandler);
router.get("/api/jobsheets/user/:generatedById", requireAuth, getJobsheetsByUserHandler);
router.patch("/api/jobsheets/:id/status", requireAuth, updateJobsheetStatusHandler);

export default router;
