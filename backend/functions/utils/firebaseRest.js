import { config } from "../config/envConfig.js";

/**
 * Checks an email + password against the shared SwordNex login (Firebase Auth).
 * Returns { localId, idToken, refreshToken, ... } or null when the credentials are wrong.
 */
export const signInWithPassword = async (email, password) => {
  const key = config.webApiKey;
  if (!key) throw new Error("Shared login is not configured (FB_WEB_API_KEY)");

  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
    signal: AbortSignal.timeout(8000),
  });

  const data = await res.json().catch(() => ({}));
  return res.ok ? data : null;
};
