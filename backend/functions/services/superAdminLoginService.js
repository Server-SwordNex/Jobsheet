import jwt from 'jsonwebtoken';
import { config } from "../config/envConfig.js";
import { safeEqual } from "../utils/safeEqual.js";

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
  const emailOk = safeEqual(cleanEmail, cleanConfigEmail);
  const passwordOk = safeEqual(cleanPassword, cleanConfigPassword);
  if (emailOk && passwordOk) {
    return true;
  }

  // 2. Reject all other attempts with standard error
  const error = new Error("Invalid email or password");
  error.status = 401;
  throw error;
}

export function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    algorithm: 'HS256',
  });
}
