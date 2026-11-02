import {
  createSupportTicket,
  getSupportTickets,
  getAllSupportTickets,
  updateSupportTicketStatus,
} from "../services/supportTicketService.js";

export async function createSupportTicketHandler(req, res) {
  try {
    const result = await createSupportTicket(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function getSupportTicketsHandler(req, res) {
  try {
    const { email } = req.params;
    const tickets = await getSupportTickets(email);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function getAllSupportTicketsHandler(req, res) {
  try {
    const tickets = await getAllSupportTickets();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function updateSupportTicketStatusHandler(req, res) {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    const result = await updateSupportTicketStatus({ ticketId, status });
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}
