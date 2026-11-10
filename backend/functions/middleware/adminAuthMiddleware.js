import jwt from "jsonwebtoken";
import { config } from "../config/envConfig.js";

/**
 * Server-side middleware to protect Admin routes.
 * Ensures the incoming request has a valid JWT token with role 'superadmin'.
 */
export function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized Access: Token missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized Access: Invalid or expired token",
      });
    }

    if (!decoded || decoded.role !== "superadmin") {
      return res.status(403).json({
        error: "Unauthorized Access: Admin role required",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error in requireAdminAuth middleware:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

