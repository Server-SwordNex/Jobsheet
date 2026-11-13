import { getActiveSessions, revokeSession } from "../services/userSessionService.js";

export async function getSessionsHandler(req, res) {
  try {
    if (!req.user.userId || req.user.role === "superadmin") {
      return res.status(200).json({ sessions: [] });
    }
    const sessions = await getActiveSessions(req.user.userId);
    // never expose anything token-related; flag the caller's own session
    const safeSessions = sessions.map(({ token: _token, ...rest }) => ({
      ...rest,
      isCurrent: rest.id === req.user.sid,
    }));

    res.status(200).json({ sessions: safeSessions });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function revokeSessionHandler(req, res) {
  try {
    const result = await revokeSession(req.params.id, req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}
