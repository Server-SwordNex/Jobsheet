import { Timestamp } from "firebase-admin/firestore";
import { supportTicketsCollection } from "../config/dbCollection.js";
import { mailService } from "../mail/mailService.js";
import { config } from "../config/envConfig.js";


const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const clip = (value, max) => String(value ?? "").slice(0, max);

export async function createSupportTicket(data) {
  const ticketId = `TICKET-${Date.now()}`;

  const name = clip(data.name || data.username || "", 120);
  const companyName = clip(data.companyName || data.businessName || "", 160);
  const email = clip(data.email || "", 200);
  const mobileNo = clip(data.mobileNo || data.mobile || "", 30);
  const query = clip(data.query || "", 5000);

  if (!query.trim()) {
    const error = new Error("Query is required");
    error.status = 400;
    throw error;
  }

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
      // user-supplied text goes into an HTML email: escape it
      data: {
        ticketId,
        name: escapeHtml(name),
        companyName: escapeHtml(companyName),
        email: escapeHtml(email),
        mobileNo: escapeHtml(mobileNo),
        query: escapeHtml(query).replace(/\n/g, "<br>"),
      },
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
