import crypto from "crypto";
import bcrypt from "bcrypt";
import { Timestamp } from "firebase-admin/firestore";
import { tenantAuth, getCollection } from "../config/firebaseTenantConfig.js";
import { tempOtpsCollections, usersCollections } from "../config/dbCollection.js";
import { createUserModel } from "../models/userModel.js";
import { mailService } from "../mail/mailService.js";

export async function sendOtp(email) {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await tempOtpsCollections.add({
    email,
    otp,
    expiresAt: Timestamp.fromDate(expiresAt),
    verified: false,
    createdAt: Timestamp.now(),
  });

  await mailService({
    type: "REGISTER_VERIFICATION",
    to: email,
    data: { name: email, otp },
  });

  return { message: "OTP sent successfully" };
}

export async function verifyOtp(email, otp) {
  const snapshot = await tempOtpsCollections
    .where("email", "==", email)
    .where("otp", "==", otp)
    .where("verified", "==", false)
    .get();

  if (snapshot.empty) {
    const error = new Error("Invalid or expired OTP");
    error.status = 400;
    throw error;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  if (data.expiresAt.toDate() < new Date()) {
    const error = new Error("OTP has expired");
    error.status = 400;
    throw error;
  }

  await doc.ref.update({ verified: true });

  return { message: "OTP verified successfully", verified: true };
}


export const registerUser = async (data) => {
  const {
    uid,
    email,
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
  } = data;

  /* ================= VALIDATION ================= */

  const missing = [];

  if (!email) missing.push("email");

  if (!companyName)
    missing.push("companyName");

  if (!username)
    missing.push("username");

  if (!addressLine1)
    missing.push("addressLine1");

  if (!pincode)
    missing.push("pincode");

  if (!city)
    missing.push("city");

  if (!mobileNo)
    missing.push("mobileNo");

  if (!planName)
    missing.push("planName");

  if (missing.length) {
    console.error(
      "❌ Missing required fields:",
      missing
    );

    throw new Error(
      `Missing required fields: ${missing.join(
        ", "
      )}`
    );
  }

  /* PASSWORD REQUIRED ONLY FOR NORMAL LOGIN */

  if (
    !isGoogleAuth &&
    !password
  ) {
    throw new Error(
      "Password is required"
    );
  }

  try {
    console.log(
      "\n================= REGISTER START ================="
    );

    console.log(
      "📧 Registering Email:",
      email
    );

    console.log(
      "🔥 Google Auth:",
      isGoogleAuth
    );

    /* ================= CHECK EXISTING USER ================= */

    console.log(
      "🔍 Checking existing Firestore user..."
    );

    const existingUser =
      await usersCollections
        .where(
          "email",
          "==",
          email
        )
        .limit(1)
        .get();

    if (!existingUser.empty) {
      console.log(
        "❌ User already exists"
      );

      throw new Error(
        "User already exists"
      );
    }

    console.log(
      "✅ User does not exist"
    );

    /* ================= UID ================= */

    let finalUid = uid;

    /* ================= CREATE FIREBASE AUTH USER ================= */

    if (!isGoogleAuth) {
      console.log(
        "🔐 Creating Firebase Tenant Auth user..."
      );

      const userRecord =
        await tenantAuth.createUser({
          email,
          password,
          emailVerified: true,
          disabled: false,
        });

      finalUid =
        userRecord.uid;

      console.log(
        "✅ Tenant Auth user created"
      );

      console.log(
        "🆔 UID:",
        finalUid
      );
    }

    /* ================= GOOGLE LOGIN ================= */

    else {
      console.log(
        "🔥 Google Auth Register"
      );

      if (!uid) {
        throw new Error(
          "Google UID missing"
        );
      }

      console.log(
        "✅ Using Google UID:",
        uid
      );
    }

    /* ================= GET PLAN ================= */

    console.log(
      "📄 Fetching pricing plan..."
    );

    const plansSnapshot =
      await getCollection(
        "pricingPlans"
      )
        .where(
          "name",
          "==",
          planName
        )
        .where(
          "billingType",
          "==",
          billingType
        )
        .limit(1)
        .get();

        console.log(plansSnapshot);
    if (plansSnapshot.empty) {
      throw new Error(
        "Selected pricing plan not found"
      );
    }

    const planDoc =
      plansSnapshot.docs[0];

    const planDetails =
      planDoc.data();

    console.log(
      "✅ Pricing plan fetched"
    );

    /* ================= HASH PASSWORD ================= */

    let hashedPassword = "";

    if (
      !isGoogleAuth &&
      password
    ) {
      console.log(
        "🔒 Hashing password..."
      );

      hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      console.log(
        "✅ Password hashed"
      );
    }

    /* ================= PLAN DATES ================= */

    const durationDays =
      billingType === "annual"
        ? 365
        : billingType === "free"
        ? 14
        : 30;

    const startDate =
      new Date();

    const endDate =
      new Date();

    endDate.setDate(
      startDate.getDate() +
        durationDays
    );

    /* ================= CREATE USER MODEL ================= */

    console.log(
      "🛠 Creating Firestore user model..."
    );

    const userDoc =
      createUserModel({
        uid: finalUid,

        email,

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

        password: hashedPassword,

        role: "admin",

        // ================= PLAN =================

        plan:
          planDetails.name ||
          "",

        planPrice:
          planDetails.price ||
          0,

        billingType:
          planDetails.billingType ||
          "monthly",

        jobSheetLimit:
          planDetails.jobSheetLimit ||
          0,

        staffLimit:
          planDetails.staffLimit ||
          0,

        subuserLimit:
          planDetails.subuserLimit ||
          0,

        // ================= PLAN DATES =================

        planStartDate:
          startDate,

        planEndDate:
          endDate,

        // ================= AUTH =================

        isGoogleAuth:
          isGoogleAuth || false,

        termsAccepted: true,

        isVerified: true,
      });

      console.log(userDoc);
    /* ================= SAVE USER ================= */

    console.log(
      "💾 Saving user to Firestore..."
    );

    await usersCollections
      .doc(finalUid)
      .set(userDoc);

    console.log(
      "✅ User stored successfully"
    );

    /* ================= FETCH USER ================= */

    const savedUser =
      await usersCollections
        .doc(finalUid)
        .get();

    console.log(
      "================= REGISTER END =================\n"
    );

    /* ================= SEND WELCOME MAIL ================= */

    await mailService({
      type: "WELCOME_MAIL",

      to: email,

      data: {
        name: username,
      },
    });

    return {
      id: finalUid,
      ...savedUser.data(),
    };
  } catch (error) {
    console.error(
      "\n❌ REGISTER SERVICE ERROR:"
    );

    console.error(error);

    if (
      error.code ===
      "auth/email-already-exists"
    ) {
      throw new Error(  
        "Email already registered"
      );
    }

    throw error;
  }
};