import {
  usersCollections,
  subUsersCollection,
  techniciansCollections,
  jobsheetsCollections,
  supportTicketsCollection,
} from "../config/dbCollection.js";

export async function getAggregatedUsersDetails() {
  try {
    const [usersSnap, techsSnap, subusersSnap, jobsheetsSnap, ticketsSnap] = await Promise.all([
      usersCollections.get(),
      techniciansCollections.get(),
      subUsersCollection.get(),
      jobsheetsCollections.get(),
      supportTicketsCollection.get(),
    ]);

    const users = usersSnap.docs.map(doc => {
      const data = doc.data();
      const { password, ...safeData } = data;
      return { uid: doc.id, ...safeData };
    });

    const technicians = techsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const subusers = subusersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    const jobsheets = jobsheetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const tickets = ticketsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const aggregated = users.map(user => {
      const userUid = user.uid;
      const userEmail = (user.email || "").toLowerCase().trim();

      const userTechs = technicians.filter(tech => tech.technicianOf === userUid);
      const userSubusers = subusers.filter(sub => sub.parentUserId === userUid);
      const userJobsheets = jobsheets.filter(js => js.generatedById === userUid);
      const userTickets = tickets.filter(ticket => (ticket.email || "").toLowerCase().trim() === userEmail);

      return {
        ...user,
        technicians: userTechs,
        subusers: userSubusers,
        jobsheets: userJobsheets,
        tickets: userTickets,
      };
    });

    return aggregated;
  } catch (error) {
    console.error("Error aggregating users details:", error);
    throw error;
  }
}
