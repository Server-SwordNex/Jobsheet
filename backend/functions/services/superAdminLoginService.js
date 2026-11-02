import jwt from 'jsonwebtoken';
import { config } from "../config/envConfig.js";

export function validateSuperAdmin(email, password) {
  console.log('Validating super admin credentials');
  if (email !== config.superadminEmail || password !== config.superadminPassword) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }
}

export function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}