import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Timestamp } from "firebase-admin/firestore";
import { usersCollections, userSessionsCollections, subUsersCollection } from "../config/dbCollection.js";
import { config } from "../config/envConfig.js";
import { createSessionModel } from "../models/sessionModel.js";

async function findUserInCollection(collection, email) {
  const clean = (email || '').trim().toLowerCase();
  let snap = await collection.where("email", "==", clean).limit(1).get();
  if (snap.empty && clean !== (email || '').trim()) {
    snap = await collection.where("email", "==", (email || '').trim()).limit(1).get();
  }
  return snap;
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
      const error = new Error("Access denied. This is an Admin account, please use Admin Login.");
      error.status = 403;
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

  let userData;
  let doc;
  let isSubuser = false;

  if (cleanRole === "team") {
    // 1. Team login: must be in subUsersCollection
    const subuserSnapshot = await findUserInCollection(subUsersCollection, cleanEmail);

    if (!subuserSnapshot.empty) {
      doc = subuserSnapshot.docs[0];
      userData = doc.data();
      isSubuser = true;
    } else {
      // Check if it's an admin user trying to use team login
      const adminSnapshot = await findUserInCollection(usersCollections, cleanEmail);
      if (!adminSnapshot.empty) {
        const adminData = adminSnapshot.docs[0].data();
        const passwordMatch = (await bcrypt.compare(cleanPassword, adminData.password || "")) ||
                              (await bcrypt.compare(password, adminData.password || ""));
        if (passwordMatch) {
          const error = new Error("Access denied. This is an Admin account, please use Admin Login.");
          error.status = 403;
          throw error;
        }
      }

      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }
  } else if (cleanRole === "admin") {
    // 2. Admin login: must be in usersCollections
    const adminSnapshot = await findUserInCollection(usersCollections, cleanEmail);

    if (!adminSnapshot.empty) {
      doc = adminSnapshot.docs[0];
      userData = doc.data();
      isSubuser = false;
    } else {
      // Check if it's a team subuser trying to use admin login
      const subuserSnapshot = await findUserInCollection(subUsersCollection, cleanEmail);
      if (!subuserSnapshot.empty) {
        const subuserData = subuserSnapshot.docs[0].data();
        const passwordMatch = (await bcrypt.compare(cleanPassword, subuserData.password || "")) ||
                              (await bcrypt.compare(password, subuserData.password || ""));
        if (passwordMatch) {
          const error = new Error("Access denied. This is a Team account, please use Team Login.");
          error.status = 403;
          throw error;
        }
      }

      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }
  } else {
    // 3. Fallback when no role is specified
    const adminSnapshot = await findUserInCollection(usersCollections, cleanEmail);

    if (!adminSnapshot.empty) {
      doc = adminSnapshot.docs[0];
      userData = doc.data();
      isSubuser = false;
    } else {
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

  // Enforce role strictly
  if (cleanRole === "admin" && role === "team") {
    const error = new Error("Access denied. This is a Team account, please use Team Login.");
    error.status = 403;
    throw error;
  }

  if (cleanRole === "team" && (role === "admin" || role === "superadmin")) {
    const error = new Error("Access denied. This is an Admin account, please use Admin Login.");
    error.status = 403;
    throw error;
  }
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
