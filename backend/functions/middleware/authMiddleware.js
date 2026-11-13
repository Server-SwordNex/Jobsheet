import jwt from "jsonwebtoken";
import { config } from "../config/envConfig.js";
import { userSessionsCollections } from "../config/dbCollection.js";

/**
 * Authenticates a request:
 *  - requires a valid "Bearer <jwt>" signed with our secret
 *  - for normal users, the session referenced by the token (`sid`) must still be
 *    active, so logout / "revoke session" / password changes really invalidate tokens
 *  - super-admin tokens carry no session and are accepted on signature alone
 *
 * On success `req.user` holds the decoded token payload.
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: token missing" });
    }

    const token = authHeader.slice(7).trim();
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
    } catch {
      return res.status(401).json({ error: "Unauthorized: invalid or expired token" });
    }

    if (decoded.role === "superadmin") {
      req.user = decoded;
      return next();
    }

    if (!decoded.sid || !decoded.userId) {
      return res.status(401).json({ error: "Session invalid, please sign in again" });
    }

    const sessionSnap = await userSessionsCollections.doc(String(decoded.sid)).get();
    const session = sessionSnap.exists ? sessionSnap.data() : null;
    if (!session || session.isActive !== true || session.userId !== decoded.userId) {
      return res.status(401).json({ error: "Session expired or revoked, please sign in again" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("requireAuth error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
