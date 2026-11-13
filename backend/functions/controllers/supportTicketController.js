import {
  createSupportTicket,
  getSupportTickets,
  getAllSupportTickets,
  updateSupportTicketStatus,
} from "../services/supportTicketService.js";
import { isSuperAdmin } from "../middleware/access.js";

const sendError = (res, error) =>
  res.status(error.status || 500).json({ error: error.message || "Internal server error" });

export async function createSupportTicketHandler(req, res) {
  try {
    const body = req.body || {};
    // tickets are always filed under the signed-in user's own email
    const email = isSuperAdmin(req.user) ? body.email : req.user.email;
    const result = await createSupportTicket({ ...body, email });
    res.status(201).json(result);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getSupportTicketsHandler(req, res) {
  try {
    const { email } = req.params;
    const own = String(req.user.email || "").trim().toLowerCase();
    if (!isSuperAdmin(req.user) && String(email || "").trim().toLowerCase() !== own) {
      return res.status(403).json({ error: "Access denied" });
    }
    const tickets = await getSupportTickets(email);
    res.status(200).json(tickets);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getAllSupportTicketsHandler(req, res) {
  try {
    const tickets = await getAllSupportTickets();
    res.status(200).json(tickets);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateSupportTicketStatusHandler(req, res) {
  try {
    const { ticketId } = req.params;
    const { status } = req.body || {};
    const result = await updateSupportTicketStatus({ ticketId, status });
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}
