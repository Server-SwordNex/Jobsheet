import { userSessionsCollections } from "../config/dbCollection.js";
import { Timestamp } from "firebase-admin/firestore";

export async function getActiveSessions(userId) {
  const snapshot = await userSessionsCollections
    .where("userId", "==", userId)
    .where("isActive", "==", true)
    .get();

  const sessions = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    sessions.push({ id: doc.id, ...data });
  });

  return sessions;
}

export async function revokeSession(sessionId, userId) {
  if (!sessionId) {
    const error = new Error("Session ID is required");
    error.status = 400;
    throw error;
  }

  const sessionRef = userSessionsCollections.doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    const error = new Error("Session not found");
    error.status = 404;
    throw error;
  }

  const sessionData = sessionDoc.data();
  if (sessionData.userId !== userId) {
    const error = new Error("You can only revoke your own sessions");
    error.status = 403;
    throw error;
  }

  await sessionRef.update({ isActive: false, lastActivityAt: Timestamp.now() });

  return { message: "Session revoked successfully" };
}
