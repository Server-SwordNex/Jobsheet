import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Timestamp } from "firebase-admin/firestore";
import { usersCollections, userSessionsCollections, subUsersCollection } from "../config/dbCollection.js";
import { config } from "../config/envConfig.js";
import { createSessionModel } from "../models/sessionModel.js";

export async function loginUser(email, password, deviceInfo = "", ipAddress = "") {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.status = 400;
    throw error;
  }

  let snapshot = await usersCollections
    .where("email", "==", email)
    .limit(1)
    .get();

  let userData;
  let doc;
  let isSubuser = false;

  if (snapshot.empty) {
    // If not found in usersCollections, check subUsersCollection
    const subuserSnapshot = await subUsersCollection
      .where("email", "==", email)
      .limit(1)
      .get();

    if (subuserSnapshot.empty) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    doc = subuserSnapshot.docs[0];
    userData = doc.data();
    isSubuser = true;
  } else {
    doc = snapshot.docs[0];
    userData = doc.data();
  }

  const passwordMatch = await bcrypt.compare(password, userData.password || "");
  if (!passwordMatch) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  // Use team role if subuser, otherwise user's role (admin)
  const role = isSubuser ? (userData.role || "team") : (userData.role || "admin");
  const tokenPayload = { userId: doc.id, email: userData.email, role: role };
  const token = jwt.sign(tokenPayload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  const expiresAtDate = new Date();
  expiresAtDate.setDate(expiresAtDate.getDate() + 7);

  const sessionData = createSessionModel({
    userId: doc.id,
    token,
    deviceInfo,
    ipAddress,
    expiresAt: Timestamp.fromDate(expiresAtDate),
  });

  await userSessionsCollections.add(sessionData);

  const { password: _, ...safeUser } = userData;
  return { token, user: { id: doc.id, uid: doc.id, ...safeUser, role } };
}

export async function logoutUser(token) {
  if (!token) {
    const error = new Error("Token is required");
    error.status = 400;
    throw error;
  }

  try {
    jwt.verify(token, config.jwtSecret);
  } catch {
    const error = new Error("Invalid or expired token");
    error.status = 401;
    throw error;
  }

  const snapshot = await userSessionsCollections
    .where("token", "==", token)
    .where("isActive", "==", true)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const sessionDoc = snapshot.docs[0];
    await sessionDoc.ref.update({ isActive: false, lastActivityAt: Timestamp.now() });
  }

  return { message: "Logged out successfully" };
}

export function getCurrentUser(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    const error = new Error("Invalid or expired token");
    error.status = 401;
    throw error;
  }
}
