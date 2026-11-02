import { Router } from "express";
import {
  createSupportTicketHandler,
  getSupportTicketsHandler,
  getAllSupportTicketsHandler,
  updateSupportTicketStatusHandler,
} from "../controllers/supportTicketController.js";

const router = Router();

router.post("/api/support/tickets", createSupportTicketHandler);
router.get("/api/support/tickets/all", getAllSupportTicketsHandler);
router.get("/api/support/tickets/:email", getSupportTicketsHandler);
router.patch("/api/support/tickets/:ticketId/status", updateSupportTicketStatusHandler);

export default router;
