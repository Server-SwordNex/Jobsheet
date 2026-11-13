import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Timestamp } from "firebase-admin/firestore";
import { usersCollections, userSessionsCollections, subUsersCollection } from "../config/dbCollection.js";
import { config } from "../config/envConfig.js";
import { createSessionModel } from "../models/sessionModel.js";

const withTimeout = (promise, ms = 2500) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Database query timed out')), ms)),
  ]);

async function findUserInCollection(collection, email) {
  const clean = (email || '').trim().toLowerCase();
  try {
    let snap = await withTimeout(collection.where("email", "==", clean).limit(1).get(), 2500);
    if (snap.empty && clean !== (email || '').trim()) {
      snap = await withTimeout(collection.where("email", "==", (email || '').trim()).limit(1).get(), 2500);
    }
    return snap;
  } catch (err) {
    console.warn("findUserInCollection error or timeout:", err.message);
    return { empty: true, docs: [] };
  }
}

export async function loginUser(email, password, deviceInfo = "", ipAddress = "", requestedRole = null) {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.status = 400;
    throw error;
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();
  const cleanRole = requestedRole ? String(requestedRole).trim().toLowerCase() : null;
  const cleanSuperEmail = (config.superadminEmail || '').trim().toLowerCase();
  const cleanSuperPass = (config.superadminPassword || '').trim();

  // If superadmin logs in through normal login page, permit it only if requestedRole is admin/null
  if (cleanSuperEmail && cleanEmail === cleanSuperEmail) {
    if (cleanRole === "team") {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }
    if (cleanPassword === cleanSuperPass) {
      const tokenPayload = { userId: "superadmin", email: config.superadminEmail, role: "superadmin" };
      const token = jwt.sign(tokenPayload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
      });

      return {
        token,
        user: {
          id: "superadmin",
          uid: "superadmin",
          email: config.superadminEmail,
          role: "superadmin",
          username: "Super Admin",
          companyName: "Super Admin",
        },
      };
    } else {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }
  }

  // "Admin Login should only be used by super admin to login. When an user tries to login with Admin option, It shouldn't work."
  if (cleanRole === "admin") {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  // "The Team Login should be used by registered users to login."
  let userData;
  let doc;
  let isSubuser = false;

  // Search registered users first
  const userSnapshot = await findUserInCollection(usersCollections, cleanEmail);

  if (!userSnapshot.empty) {
    doc = userSnapshot.docs[0];
    userData = doc.data();
    isSubuser = false;
  } else {
    // Search subusers / staff
    const subuserSnapshot = await findUserInCollection(subUsersCollection, cleanEmail);

    if (subuserSnapshot.empty) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    doc = subuserSnapshot.docs[0];
    userData = doc.data();
    isSubuser = true;
  }

  // Verify password for found account
  const passwordMatch = (await bcrypt.compare(cleanPassword, userData.password || "")) ||
                        (await bcrypt.compare(password, userData.password || ""));
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
