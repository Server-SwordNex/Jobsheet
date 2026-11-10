import jwt from 'jsonwebtoken';
import { config } from "../config/envConfig.js";
import { usersCollections, subUsersCollection } from "../config/dbCollection.js";

const withTimeout = (promise, ms = 1500) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);

export async function validateSuperAdmin(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanConfigEmail = (config.superadminEmail || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();
  const cleanConfigPassword = (config.superadminPassword || '').trim();

  if (!cleanConfigEmail || !cleanConfigPassword) {
    const error = new Error('SUPERADMIN credentials are not properly configured');
    error.status = 500;
    throw error;
  }

  // 1. Check if credentials match configured Admin
  if (cleanEmail === cleanConfigEmail && cleanPassword === cleanConfigPassword) {
    return true;
  }

  // 2. If it doesn't match, verify if this is a normal user or team user attempting to log into Admin panel
  try {
    const userSnapshot = await withTimeout(
      usersCollections.where("email", "==", cleanEmail).limit(1).get(),
      1500
    );

    if (!userSnapshot.empty) {
      const error = new Error("Unauthorized Access: Normal user credentials cannot access the Admin panel.");
      error.status = 403;
      throw error;
    }

    const subuserSnapshot = await withTimeout(
      subUsersCollection.where("email", "==", cleanEmail).limit(1).get(),
      1500
    );

    if (!subuserSnapshot.empty) {
      const error = new Error("Unauthorized Access: Normal user credentials cannot access the Admin panel.");
      error.status = 403;
      throw error;
    }
  } catch (err) {
    if (err.status) throw err;
  }

  // 3. Invalid admin credentials
  const error = new Error("Unauthorized Access: Invalid Admin Credentials");
  error.status = 401;
  throw error;
}

export function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}
