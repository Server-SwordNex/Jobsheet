import { getActiveSessions, revokeSession } from "../services/userSessionService.js";
import { getCurrentUser } from "../services/userLoginService.js";

export async function getSessionsHandler(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const user = getCurrentUser(token);
    const sessions = await getActiveSessions(user.userId);

    const safeSessions = sessions.map(({ token: _, ...rest }) => rest);

    res.status(200).json({ sessions: safeSessions });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function revokeSessionHandler(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const user = getCurrentUser(token);
    const { id } = req.params;

    const result = await revokeSession(id, user.userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}
