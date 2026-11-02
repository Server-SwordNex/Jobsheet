import { Timestamp } from "firebase-admin/firestore";
import { supportTicketsCollection } from "../config/dbCollection.js";
import { mailService } from "../mail/mailService.js";
import { config } from "../config/envConfig.js";


export async function createSupportTicket(data) {
  const ticketId = `TICKET-${Date.now()}`;

  const name = data.name || data.username || "";
  const companyName = data.companyName || data.businessName || "";
  const email = data.email || "";
  const mobileNo = data.mobileNo || data.mobile || "";
  const query = data.query || "";

  await supportTicketsCollection.doc(ticketId).set({
    ticketId,
    name,
    companyName,
    email,
    mobileNo,
    query,
    status: "OPEN",
    createdAt: Timestamp.now(),
  });

  try {
    await mailService({
      type: "SUPPORT_TICKET",
      to: config.superadminEmail || process.env.SUPERADMIN_EMAIL || "admin@jobsheet.com",
      data: { ticketId, name, companyName, email, mobileNo, query },
    });
  } catch (mailError) {
    console.error("Failed to send support ticket email:", mailError);
  }

  return { ticketId };
}

export async function getSupportTickets(email) {
  const snapshot = await supportTicketsCollection.where("email", "==", email).get();

  const tickets = [];
  snapshot.forEach((doc) => {
    tickets.push({ id: doc.id, ...doc.data() });
  });

  tickets.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || (typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0);
    const bTime = b.createdAt?.toMillis?.() || (typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0);
    return bTime - aTime;
  });

  return tickets;
}

export async function getAllSupportTickets() {
  const snapshot = await supportTicketsCollection.get();

  const tickets = [];
  snapshot.forEach((doc) => {
    tickets.push({ id: doc.id, ...doc.data() });
  });

  tickets.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || (typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0);
    const bTime = b.createdAt?.toMillis?.() || (typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0);
    return bTime - aTime;
  });

  return tickets;
}

export async function updateSupportTicketStatus({ ticketId, status }) {
  if (!ticketId || !status) {
    const error = new Error("ticketId and status are required");
    error.status = 400;
    throw error;
  }

  const docRef = supportTicketsCollection.doc(ticketId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    const error = new Error("Ticket not found");
    error.status = 404;
    throw error;
  }

  await docRef.update({ status, updatedAt: Timestamp.now() });

  return { ticketId, status };
}
