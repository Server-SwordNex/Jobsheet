import { db, tenantAuth } from "../config/firebaseTenantConfig.js";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { usersCollections, emailOtpsCollection } from "../config/dbCollection.js";
import { config } from "../config/envConfig.js";
import { mailService } from "../mail/mailService.js";

/* =========================
   OTP COLLECTION
========================= */

const otpCollection = emailOtpsCollection;
const userCollection = usersCollections;


/* =========================================================
   CHANGE PASSWORD (ADMIN ONLY)
========================================================= */

export const changePasswordService = async ({
  email,
  newPassword,
  uid,
}) => {
  try {
    /* =========================
       GET USER FROM AUTH
    ========================== */

    const userRecord = await tenantAuth.getUserByEmail(email);

    if (!userRecord) {
      throw new Error("User not found");
    }

    /* =========================
       UPDATE AUTH PASSWORD
    ========================== */

    await tenantAuth.updateUser(userRecord.uid, {
      password: newPassword,
    });

    /* =========================
       CREATE TIMESTAMP
    ========================== */

    const now = new Date().toISOString();

    /* =========================
       UPDATE FIRESTORE (ADMIN ONLY)
    ========================== */

    await userCollection.doc(uid).set(
      {
        passwordChangedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log("✅ Admin password updated successfully");

    return {
      success: true,
      message: "Password updated successfully",
      data: {
        passwordChangedAt: now, // ✅ send real readable value
      },
    };

  } catch (error) {
    console.error("❌ CHANGE PASSWORD ERROR:", error);
    throw error;
  }
};




/* =========================================================
   FORGOT PASSWORD - SEND OTP SERVICE
========================================================= */

export const forgotPasswordSendOtpService =
  async (email) => {

    try {

      /* =========================
         VALIDATION
      ========================== */

      if (!email) {
        throw new Error(
          "Email is required"
        );
      }

      /* =========================
         FIND USER
      ========================== */

      const userSnapshot =
        await userCollection
          .where("email", "==", email)
          .limit(1)
          .get();

      if (userSnapshot.empty) {
        throw new Error(
          "User not found"
        );
      }

      const userDoc =
        userSnapshot.docs[0];

      const userData =
        userDoc.data();

      const name =
        userData.name || "User";

      /* =========================
         REMOVE OLD OTPs
      ========================== */

      const oldOtps =
        await otpCollection
          .where("email", "==", email)
          .get();

      if (!oldOtps.empty) {

        const batch =
          db.batch();

        oldOtps.docs.forEach(
          (doc) => {
            batch.delete(doc.ref);
          }
        );

        await batch.commit();
      }

      /* =========================
         GENERATE OTP
      ========================== */

      const otp = Math.floor(
        100000 +
        Math.random() * 900000
      ).toString();

      /* =========================
         HASH OTP
      ========================== */

      const hashedOtp =
        await bcrypt.hash(
          otp,
          10
        );

      /* =========================
         TIMESTAMP
      ========================== */

      const now =
        Date.now();

      const expiresAt =
        now + 10 * 60 * 1000;

      /* =========================
         STORE OTP
      ========================== */

      await otpCollection.doc().set({
        email,

        otp: hashedOtp,

        createdAt: now,

        expiresAt,
      });

      /* =========================
         SEND MAIL
      ========================== */
 
      await mailService({
        type: "FORGOT_PASSWORD",
        to: email,
        data: {
          name,
          otp,
        },
      });

      /* =========================
         CREATE TEMP TOKEN
      ========================== */

      const token =
        jwt.sign(
          {
            email,
 
            verified: false,
          },
 
          config.jwtSecret,
 
          {
            expiresIn: "10m",
          }
        );

      /* =========================
         RESPONSE
      ========================== */

      return {
        success: true,

        token,
      };

    } catch (error) {

      console.error(
        "❌ SEND OTP SERVICE ERROR:",
        error
      );

      throw error;
    }
  };



/* =========================================================
   FORGOT PASSWORD - VERIFY OTP SERVICE
========================================================= */

export const forgotPasswordVerifyOtpService =
  async (email, otp) => {

    try {

      /* =========================
         VALIDATION
      ========================== */

      if (!email || !otp) {
        throw new Error(
          "Email and OTP are required"
        );
      }

      /* =========================
         FIND OTP
      ========================== */

      const snapshot =
        await otpCollection
          .where("email", "==", email)
          .limit(1)
          .get();

      if (snapshot.empty) {
        throw new Error(
          "OTP not found"
        );
      }

      const otpDoc =
        snapshot.docs[0];

      const otpData =
        otpDoc.data();

      /* =========================
         CHECK EXPIRY
      ========================== */

      if (
        Date.now() >
        otpData.expiresAt
      ) {

        await otpDoc.ref.delete();

        throw new Error(
          "OTP expired"
        );
      }

      /* =========================
         VERIFY OTP
      ========================== */

      const isMatch =
        await bcrypt.compare(
          otp,
          otpData.otp
        );

      if (!isMatch) {
        throw new Error(
          "Invalid OTP"
        );
      }

      /* =========================
         DELETE OTP
      ========================== */

      await otpDoc.ref.delete();

      /* =========================
         CREATE VERIFIED TOKEN
      ========================== */

      const verifiedToken =
        jwt.sign(
          {
            email,
 
            verified: true,
          },
 
          config.jwtSecret,
 
          {
            expiresIn: "10m",
          }
        );

      /* =========================
         RESPONSE
      ========================== */

      return {
        success: true,

        token:
          verifiedToken,
      };

    } catch (error) {

      console.error(
        "❌ VERIFY OTP SERVICE ERROR:",
        error
      );

      throw error;
    }
  };



/* =========================================================
   FORGOT PASSWORD - RESET PASSWORD SERVICE
========================================================= */

export const forgotPasswordResetPasswordService =
  async (
    email,
    newPassword
  ) => {

    try {

      /* =========================
         VALIDATION
      ========================== */

      if (
        !email ||
        !newPassword
      ) {
        throw new Error(
          "Email and new password are required"
        );
      }

      /* =========================
         GET USER FROM AUTH
      ========================== */

      const userRecord =
        await tenantAuth.getUserByEmail(
          email
        );

      if (!userRecord) {
        throw new Error(
          "User not found"
        );
      }

      /* =========================
         UPDATE AUTH PASSWORD
      ========================== */

      await tenantAuth.updateUser(
        userRecord.uid,
        {
          password:
            newPassword,
        }
      );

      /* =========================
         UPDATE FIRESTORE
      ========================== */

      const userSnapshot =
        await userCollection
          .where("email", "==", email)
          .limit(1)
          .get();

      if (
        !userSnapshot.empty
      ) {

        await userSnapshot.docs[0].ref.set(
          {
            passwordChangedAt:
              admin.firestore.FieldValue.serverTimestamp(),
          },

          {
            merge: true,
          }
        );
      }

      /* =========================
         RESPONSE
      ========================== */

      return {
        success: true,

        message:
          "Password reset successfully",
      };

    } catch (error) {

      console.error(
        "❌ RESET PASSWORD SERVICE ERROR:",
        error
      );

      throw error;
    }
  };