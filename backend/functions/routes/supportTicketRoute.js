import { Router } from "express";
import {
  createSupportTicketHandler,
  getSupportTicketsHandler,
  getAllSupportTicketsHandler,
  updateSupportTicketStatusHandler,
} from "../controllers/supportTicketController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdminAuth } from "../middleware/adminAuthMiddleware.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

const createLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many tickets submitted. Please try again later.",
});

router.post("/api/support/tickets", requireAuth, createLimiter, createSupportTicketHandler);
router.get("/api/support/tickets/all", requireAdminAuth, getAllSupportTicketsHandler);
router.get("/api/support/tickets/:email", requireAuth, getSupportTicketsHandler);
router.patch("/api/support/tickets/:ticketId/status", requireAdminAuth, updateSupportTicketStatusHandler);

export default router;
