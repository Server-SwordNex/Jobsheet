import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { tenantAuth, getCollection, db } from "../config/firebaseTenantConfig.js";
import { tempOtpsCollections, usersCollections } from "../config/dbCollection.js";
import { createUserModel } from "../models/userModel.js";
import { mailService } from "../mail/mailService.js";
import { issueSessionToken } from "./userLoginService.js";
import { normalizeEmail, findAccountByEmail, findAccountById } from "./accountLookup.js";
import { stripSecrets } from "../middleware/access.js";
import { config } from "../config/envConfig.js";
import { getPricingEnabled } from "./entitlements.js";

const OTP_TTL_MS = 5 * 60 * 1000;
const VERIFIED_VALID_MS = 30 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// the email already belongs to someone's shared SwordNex login (made in another SwordNex app)
const accountExists = () => {
  const error = httpError(409, "This email already has a SwordNex account. Please sign in to set up Jobsheet.");
  error.apiCode = "ACCOUNT_EXISTS";
  return error;
};

const toMillis = (ts) => (ts?.toMillis ? ts.toMillis() : Number(ts) || 0);

/* ======================= REGISTRATION OTP ======================= */

export async function sendOtp(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!EMAIL_RE.test(email)) throw httpError(400, "A valid email is required");

  if (await findAccountByEmail(email)) throw httpError(409, "Email already registered");

  if (config.sharedLogin) {
    try {
      await tenantAuth.getUserByEmail(email);
      throw accountExists();
    } catch (err) {
      if (err.apiCode) throw err;
      if (err.code !== "auth/user-not-found") throw err;
    }
  }

  const previous = await tempOtpsCollections.where("email", "==", email).get();
  const now = Date.now();

  if (previous.docs.some((doc) => now - toMillis(doc.data().createdAt) < RESEND_COOLDOWN_MS)) {
    throw httpError(429, "Please wait a minute before requesting another OTP");
  }

  if (!previous.empty) {
    const batch = db.batch();
    previous.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  const otp = crypto.randomInt(100000, 1000000).toString();

  await tempOtpsCollections.add({
    email,
    otpHash: await bcrypt.hash(otp, 10),
    attempts: 0,
    expiresAt: Timestamp.fromMillis(now + OTP_TTL_MS),
    verified: false,
    createdAt: Timestamp.fromMillis(now),
  });

  await mailService({
    type: "REGISTER_VERIFICATION",
    to: email,
    data: { name: email, otp },
  });

  return { message: "OTP sent successfully" };
}

export async function verifyOtp(rawEmail, otp) {
  const email = normalizeEmail(rawEmail);
  const invalid = () => httpError(400, "Invalid or expired OTP");

  const snapshot = await tempOtpsCollections.where("email", "==", email).limit(1).get();
  if (snapshot.empty) throw invalid();

  const doc = snapshot.docs[0];
  const data = doc.data();

  if (!data.otpHash || data.verified === true || toMillis(data.expiresAt) < Date.now()) {
    await doc.ref.delete();
    throw invalid();
  }

  if ((data.attempts || 0) >= MAX_OTP_ATTEMPTS) {
    await doc.ref.delete();
    throw httpError(429, "Too many incorrect attempts. Please request a new OTP.");
  }

  if (!(await bcrypt.compare(String(otp).trim(), data.otpHash))) {
    await doc.ref.update({ attempts: FieldValue.increment(1) });
    throw invalid();
  }

  await doc.ref.update({ verified: true, verifiedAt: Timestamp.now() });

  return { message: "OTP verified successfully", verified: true };
}

/** Returns the verified-OTP document for this email, or throws 403. */
async function requireVerifiedEmail(email) {
  const snapshot = await tempOtpsCollections
    .where("email", "==", email)
    .where("verified", "==", true)
    .limit(1)
    .get();

  const doc = snapshot.docs[0];
  if (!doc || Date.now() - toMillis(doc.data().verifiedAt) > VERIFIED_VALID_MS) {
    throw httpError(403, "Please verify your email with the OTP before registering");
  }
  return doc;
}

/* ========================= SHARED BUILDING BLOCKS ========================= */

// While pricing is OFF a new business needs no plan: it simply gets free, unlimited, never-expiring access.
// (It starts a fresh free trial on the day pricing is switched ON; see platformSettingsService.)
const FREE_ACCESS_PLAN = {
  name: "Free",
  billingType: "free",
  price: 0,
  jobSheetLimit: 0,
  staffLimit: 0,
  subuserLimit: null,
};

const loadPlan = async (planName, billingType) => {
  const plansSnapshot = await getCollection("pricingPlans")
    .where("name", "==", planName)
    .where("billingType", "==", billingType)
    .limit(1)
    .get();
  if (plansSnapshot.empty) throw httpError(400, "Selected pricing plan not found");
  return plansSnapshot.docs[0].data();
};

/** Writes the business profile (users/<uid>) with the plan's limits and dates. */
const saveProfile = async ({ uid, email, hashedPassword = "", isGoogleAuth = false, planDetails, fields, pricingOff = false }) => {
  // "annual" is the stored value; "yearly" is kept for older plan documents
  const billingType = planDetails.billingType;
  const durationDays = billingType === "annual" || billingType === "yearly" ? 365 : billingType === "free" ? 14 : 30;
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + durationDays);

  const userDoc = createUserModel({
    uid,
    email,
    ...fields,
    password: hashedPassword,
    role: "admin",

    plan: planDetails.name || "",
    planPrice: planDetails.price || 0,
    billingType: planDetails.billingType || "monthly",
    jobSheetLimit: planDetails.jobSheetLimit || 0,
    staffLimit: planDetails.staffLimit || 0,
    subuserLimit: planDetails.subuserLimit === undefined ? 0 : planDetails.subuserLimit,
    planStartDate: startDate,
    planEndDate: pricingOff ? null : endDate,
    pricingOffSignup: pricingOff,

    authSource: config.sharedLogin ? "shared" : "local",
    isGoogleAuth: Boolean(isGoogleAuth),
    termsAccepted: true,
    isVerified: true,
  });

  await usersCollections.doc(uid).set(userDoc);
  return userDoc;
};

/** Welcome mail + the session returned to the browser after an account is created. */
const finishSignUp = async ({ uid, email, username, deviceInfo, ipAddress }) => {
  // a failed welcome mail must not fail a completed registration
  try {
    await mailService({ type: "WELCOME_MAIL", to: email, data: { name: username } });
  } catch (mailError) {
    console.error("Welcome mail failed:", mailError.message);
  }

  const savedUser = stripSecrets((await usersCollections.doc(uid).get()).data());
  const token = await issueSessionToken({ userId: uid, email, role: "admin", deviceInfo, ipAddress });

  return { id: uid, ...savedUser, token, user: { id: uid, uid, ...savedUser } };
};

/* ============================ REGISTER ============================ */

export const registerUser = async (data, { deviceInfo = "", ipAddress = "" } = {}) => {
  const {
    password,
    companyName,
    username,
    website,
    gstin,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    mobileNo,
    planName,
    billingType,
    isGoogleAuth,
    idToken,
  } = data;

  let email = normalizeEmail(data.email);
  let finalUid;

  /* ---------- identity ---------- */

  if (isGoogleAuth) {
    // Never trust a client-supplied uid/email: take them from a verified Google ID token.
    if (!idToken) throw httpError(400, "Google ID token is required");
    let decoded;
    try {
      decoded = await tenantAuth.verifyIdToken(String(idToken));
    } catch {
      throw httpError(401, "Google sign-in could not be verified");
    }
    if (!decoded.email || decoded.email_verified !== true) {
      throw httpError(400, "Google account email is not verified");
    }
    email = normalizeEmail(decoded.email);
    finalUid = decoded.uid;
  } else {
    if (!password) throw httpError(400, "Password is required");
    if (String(password).length < 6) throw httpError(400, "Password must be at least 6 characters");
    if (String(password).length > 128) throw httpError(400, "Password is too long");
  }

  /* ---------- validation ---------- */

  const pricingOn = await getPricingEnabled();

  const missing = [];
  if (!email) missing.push("email");
  if (!companyName) missing.push("companyName");
  if (!username) missing.push("username");
  if (!addressLine1) missing.push("addressLine1");
  if (!pincode) missing.push("pincode");
  if (!city) missing.push("city");
  if (!mobileNo) missing.push("mobileNo");
  // a plan is only needed while pricing is ON
  if (pricingOn && !planName) missing.push("planName");
  if (pricingOn && !billingType) missing.push("billingType");
  if (missing.length) throw httpError(400, `Missing required fields: ${missing.join(", ")}`);
  if (!EMAIL_RE.test(email)) throw httpError(400, "A valid email is required");

  // email ownership must have been proven with the registration OTP
  const verifiedOtpDoc = isGoogleAuth ? null : await requireVerifiedEmail(email);

  let createdAuthUid = null;

  try {
    if (await findAccountByEmail(email)) throw httpError(409, "User already exists");

    /* ---------- pricing plan ---------- */

    const planDetails = pricingOn ? await loadPlan(planName, billingType) : FREE_ACCESS_PLAN;

    /* ---------- auth user ---------- */

    let hashedPassword = "";
    if (!isGoogleAuth) {
      let userRecord;
      try {
        userRecord = await tenantAuth.createUser({
          email,
          password,
          emailVerified: true,
          disabled: false,
          displayName: username,
        });
      } catch (err) {
        if (err.code === "auth/email-already-exists") throw accountExists();
        throw err;
      }
      finalUid = userRecord.uid;
      createdAuthUid = userRecord.uid;
      // on the shared SwordNex login the password lives there only; otherwise it is kept (hashed) here
      hashedPassword = config.sharedLogin ? "" : await bcrypt.hash(password, 10);
    }

    await saveProfile({
      uid: finalUid,
      email,
      hashedPassword,
      isGoogleAuth,
      planDetails,
      pricingOff: !pricingOn,
      fields: { companyName, username, website, gstin, addressLine1, addressLine2, city, state, pincode, mobileNo },
    });

    if (verifiedOtpDoc) await verifiedOtpDoc.ref.delete();
    createdAuthUid = null; // fully persisted: nothing to roll back

    return await finishSignUp({ uid: finalUid, email, username, deviceInfo, ipAddress });
  } catch (error) {
    // don't leave an orphaned Auth account behind a failed registration
    if (createdAuthUid) {
      await tenantAuth.deleteUser(createdAuthUid).catch(() => {});
    }

    if (error.code === "auth/email-already-exists") {
      throw config.sharedLogin ? accountExists() : httpError(409, "Email already registered");
    }
    console.error("REGISTER SERVICE ERROR:", error.message);
    throw error;
  }
};

/* ============================ ACTIVATE ============================ */

const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/**
 * Set up a Jobsheet business for someone who already has a shared SwordNex account (made in the
 * Products site, Billing, Payroll, Invoice...). The activation token is the Firebase ID token from
 * a sign-in that was answered NEEDS_ACTIVATION, so it proves they know that account's password.
 */
export const activateAccount = async (data, { deviceInfo = "", ipAddress = "" } = {}) => {
  if (!config.sharedLogin) throw httpError(404, "Not available");

  if (typeof data.activationToken !== "string" || !data.activationToken) {
    throw httpError(400, "Please sign in again.");
  }

  let decoded;
  try {
    decoded = await tenantAuth.verifyIdToken(data.activationToken, true);
  } catch {
    throw httpError(401, "Your sign-in has expired. Please sign in again.");
  }

  if (!decoded.email || decoded.email_verified !== true) {
    const error = httpError(403, "Verify your email first. We sent a link when you created your SwordNex account.");
    error.apiCode = "EMAIL_NOT_VERIFIED";
    throw error;
  }

  const email = normalizeEmail(decoded.email);
  const uid = decoded.uid;

  const fields = {
    companyName: text(data.companyName, 120),
    username: text(data.username, 100) || email.split("@")[0],
    website: text(data.website, 120),
    gstin: text(data.gstin, 15).toUpperCase(),
    addressLine1: text(data.addressLine1, 200),
    addressLine2: text(data.addressLine2, 200),
    city: text(data.city, 80),
    state: text(data.state, 60),
    pincode: text(data.pincode, 10),
    mobileNo: text(data.mobileNo, 20),
  };
  const planName = text(data.planName, 120);
  const billingType = text(data.billingType, 20);

  const pricingOn = await getPricingEnabled();

  const missing = [];
  if (!fields.companyName) missing.push("companyName");
  if (!fields.addressLine1) missing.push("addressLine1");
  if (!fields.pincode) missing.push("pincode");
  if (!fields.city) missing.push("city");
  if (!fields.mobileNo) missing.push("mobileNo");
  if (pricingOn && !planName) missing.push("planName");
  if (pricingOn && !billingType) missing.push("billingType");
  if (missing.length) throw httpError(400, `Missing required fields: ${missing.join(", ")}`);

  // a team member (or an existing owner) already has a Jobsheet account
  if ((await findAccountById(uid)) || (await findAccountByEmail(email))) {
    throw httpError(409, "You already have a Jobsheet account. Please sign in.");
  }

  const planDetails = pricingOn ? await loadPlan(planName, billingType) : FREE_ACCESS_PLAN;
  await saveProfile({ uid, email, hashedPassword: "", planDetails, fields, pricingOff: !pricingOn });

  return finishSignUp({ uid, email, username: fields.username, deviceInfo, ipAddress });
};
