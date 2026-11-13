import { subUsersCollection } from "../config/dbCollection.js";

export const isSuperAdmin = (user) => user?.role === "superadmin";

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

/**
 * Throws a 403 unless `user` may act on data owned by `targetUid`.
 * Allowed: super-admin, the owner themself, an admin acting on one of their own
 * sub-users (unless allowSubusers is false) and, when allowParent is set, a
 * sub-user acting on their parent admin's data.
 */
export async function assertAccess(user, targetUid, { allowParent = false, allowSubusers = true } = {}) {
  if (!user || !targetUid) throw httpError(403, "Access denied");
  if (isSuperAdmin(user)) return;

  const target = String(targetUid).trim();
  if (target && target === user.userId) return;
  if (allowParent && user.parentUid && target === user.parentUid) return;

  if (allowSubusers && user.role === "admin" && target) {
    try {
      const sub = await subUsersCollection.doc(target).get();
      if (sub.exists && sub.data().parentUserId === user.userId) return;
    } catch {
      // invalid document id -> fall through to denial
    }
  }

  throw httpError(403, "Access denied");
}

/** Throws unless the caller is the given admin account (or super-admin). */
export function assertAdminOf(user, parentUid) {
  if (isSuperAdmin(user)) return;
  if (user?.role === "admin" && parentUid && String(parentUid).trim() === user.userId) return;
  throw httpError(403, "Access denied");
}

/** Removes secrets from an account/sub-user document before it leaves the server. */
export function stripSecrets(data) {
  if (!data) return data;
  // eslint-disable-next-line no-unused-vars
  const { password, ...safe } = data;
  return safe;
}
