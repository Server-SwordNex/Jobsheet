import { api } from './client';
import { SUPPORT } from './endpoints';

export function createSupportTicket(data) {
  return api.post(SUPPORT.CREATE, data);
}

export function getSupportTickets(email) {
  return api.get(SUPPORT.GET(email));
}

export function getAllSupportTickets() {
  return api.get(SUPPORT.LIST_ALL);
}

export function updateSupportTicketStatus(ticketId, status) {
  return api.patch(SUPPORT.UPDATE_STATUS(ticketId), { status });
}
