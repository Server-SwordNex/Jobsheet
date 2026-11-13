import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { FieldValue } from "firebase-admin/firestore";
import { db, tenantAuth } from "../config/firebaseTenantConfig.js";
import { emailOtpsCollection, userSessionsCollections } from "../config/dbCollection.js";
import { config } from "../config/envConfig.js";
import { mailService } from "../mail/mailService.js";
import { findAccountByEmail, findAccountById, normalizeEmail } from "./accountLookup.js";
import { signInWithPassword } from "../utils/firebaseRest.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;
const RESET_TOKEN_PURPOSE = "password-reset";
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

function validateNewPassword(password) {
  if (typeof password !== "string" || !password.trim()) {
    throw httpError(400, "New password is required");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw httpError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw httpError(400, "Password is too long");
  }
}

/**
 * Login verifies the bcrypt hash stored in Firestore, so that hash is the source of
 * truth. Firebase Auth is kept in sync as well (the account id is the Auth uid).
 */
// an owner on the shared SwordNex login: the password lives in that login, not here
const isSharedAccount = (account) => config.sharedLogin && !account.isSubuser && account.data.authSource === "shared";

async function setAccountPassword(account, newPassword) {
  const shared = isSharedAccount(account);
  const stamp = { passwordChangedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() };

  if (shared) {
    // the shared login is the source of truth (and also changes the same person's other SwordNex apps)
    await tenantAuth.updateUser(account.id, { password: newPassword });
    await account.ref.set(stamp, { merge: true });
    return;
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await account.ref.set({ password: hash, ...stamp }, { merge: true });

  try {
    await tenantAuth.updateUser(account.id, { password: newPassword });
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
  }
}

/** Deactivates every active session of a user (optionally keeping one). */
async function revokeUserSessions(userId, exceptSessionId = null) {
  const snap = await userSessionsCollections
    .where("userId", "==", userId)
    .where("isActive", "==", true)
    .get();

  const targets = snap.docs.filter((doc) => doc.id !== exceptSessionId);
  if (!targets.length) return;

  const batch = db.batch();
  targets.forEach((doc) => batch.update(doc.ref, { isActive: false }));
  await batch.commit();
}

/* =========================================================
   CHANGE PASSWORD (signed-in user, must know current password)
========================================================= */

export const changePasswordService = async ({ user, currentPassword, newPassword }) => {
  if (!user?.userId || user.role === "superadmin") {
    throw httpError(403, "Password change is not available for this account");
  }
  if (typeof currentPassword !== "string" || !currentPassword) {
    throw httpError(400, "Current password is required");
  }
  validateNewPassword(newPassword);

  const account = await findAccountById(user.userId);
  if (!account) throw httpError(404, "Account not found");

  let matches;
  if (isSharedAccount(account)) {
    const authData = await signInWithPassword(String(account.data.email || "").toLowerCase(), currentPassword);
    matches = Boolean(authData) && authData.localId === account.id;
  } else {
    matches = await bcrypt.compare(currentPassword, account.data.password || "");
  }
  if (!matches) {
    // 400 (not 401) so the client doesn't treat this as an expired session
    throw httpError(400, "Current password is incorrect");
  }
  if (currentPassword === newPassword) {
    throw httpError(400, "New password must be different from the current password");
  }

  await setAccountPassword(account, newPassword);

  // sign out every other device
  await revokeUserSessions(account.id, user.sid);

  return {
    success: true,
    message: "Password updated successfully",
    data: { passwordChangedAt: new Date().toISOString() },
  };
};

/* =========================================================
   FORGOT PASSWORD - STEP 1: SEND OTP
========================================================= */

export const forgotPasswordSendOtpService = async (rawEmail) => {
  const email = normalizeEmail(rawEmail);
  if (!email) throw httpError(400, "Email is required");

  // Same response whether or not the account exists (no account enumeration).
  const genericResponse = { success: true, message: "If this email is registered, an OTP has been sent." };

  const account = await findAccountByEmail(email);
  if (!account) return genericResponse;

  const existing = await emailOtpsCollection.where("email", "==", email).get();
  const now = Date.now();

  const recentlySent = existing.docs.some((doc) => now - (doc.data().createdAt || 0) < RESEND_COOLDOWN_MS);
  if (recentlySent) return genericResponse;

  if (!existing.empty) {
    const batch = db.batch();
    existing.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  const otp = crypto.randomInt(100000, 1000000).toString();

  await emailOtpsCollection.doc().set({
    email,
    otpHash: await bcrypt.hash(otp, 10),
    attempts: 0,
    verified: false,
    createdAt: now,
    expiresAt: now + OTP_TTL_MS,
  });

  await mailService({
    type: "FORGOT_PASSWORD",
    to: account.data.email || email,
    data: { name: account.data.username || account.data.name || "User", otp },
  });

  return genericResponse;
};

/* =========================================================
   FORGOT PASSWORD - STEP 2: VERIFY OTP
========================================================= */

export const forgotPasswordVerifyOtpService = async (rawEmail, otp) => {
  const email = normalizeEmail(rawEmail);
  if (!email || !otp) throw httpError(400, "Email and OTP are required");

  const invalid = () => httpError(400, "Invalid or expired OTP");

  const snapshot = await emailOtpsCollection.where("email", "==", email).limit(1).get();
  if (snapshot.empty) throw invalid();

  const otpDoc = snapshot.docs[0];
  const otpData = otpDoc.data();

  if (!otpData.otpHash || otpData.verified === true || Date.now() > otpData.expiresAt) {
    await otpDoc.ref.delete();
    throw invalid();
  }

  if ((otpData.attempts || 0) >= MAX_OTP_ATTEMPTS) {
    await otpDoc.ref.delete();
    throw httpError(429, "Too many incorrect attempts. Please request a new OTP.");
  }

  const isMatch = await bcrypt.compare(String(otp).trim(), otpData.otpHash);
  if (!isMatch) {
    await otpDoc.ref.update({ attempts: FieldValue.increment(1) });
    throw invalid();
  }

  await otpDoc.ref.update({ verified: true, verifiedAt: Date.now() });

  // Short-lived, single-purpose token that the reset step requires.
  const token = jwt.sign(
    { email, purpose: RESET_TOKEN_PURPOSE, otpId: otpDoc.id },
    config.jwtSecret,
    { expiresIn: "10m", algorithm: "HS256" }
  );

  return { success: true, token };
};

/* =========================================================
   FORGOT PASSWORD - STEP 3: RESET PASSWORD
========================================================= */

export const forgotPasswordResetPasswordService = async (rawEmail, newPassword, resetToken) => {
  const email = normalizeEmail(rawEmail);
  if (!email || !newPassword) throw httpError(400, "Email and new password are required");
  validateNewPassword(newPassword);

  let decoded;
  try {
    decoded = jwt.verify(String(resetToken || ""), config.jwtSecret, { algorithms: ["HS256"] });
  } catch {
    throw httpError(400, "Reset session expired. Please verify your email again.");
  }
  if (decoded.purpose !== RESET_TOKEN_PURPOSE || decoded.email !== email || !decoded.otpId) {
    throw httpError(400, "Reset session expired. Please verify your email again.");
  }

  const otpRef = emailOtpsCollection.doc(String(decoded.otpId));
  const otpSnap = await otpRef.get();
  if (!otpSnap.exists || otpSnap.data().verified !== true || otpSnap.data().email !== email) {
    throw httpError(400, "Reset session expired. Please verify your email again.");
  }

  const account = await findAccountByEmail(email);
  if (!account) throw httpError(400, "Reset session expired. Please verify your email again.");

  // single use: consume the verified OTP before changing anything
  await otpRef.delete();

  await setAccountPassword(account, newPassword);
  await revokeUserSessions(account.id);

  return { success: true, message: "Password reset successfully" };
};
