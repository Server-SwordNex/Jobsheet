import jwt from "jsonwebtoken";
import { config } from "../config/envConfig.js";
import { getAggregatedUsersDetails } from "../services/superAdminUserService.js";

export async function getAggregatedUsersDetailsHandler(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized access: Token missing or invalid" });
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return res.status(401).json({ error: "Unauthorized access: Invalid or expired token" });
    }

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ error: "Access denied. Superadmin only." });
    }

    const details = await getAggregatedUsersDetails();
    res.status(200).json(details);
  } catch (error) {
    console.error("Error in getAggregatedUsersDetailsHandler:", error);
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}
