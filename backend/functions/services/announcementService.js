import {
  createAnnouncementModel,
  updateAnnouncementModel,
} from "../models/announcementModel.js";
import { mailService } from "../mail/mailService.js";
import { announcementsCollection, usersCollections } from "../config/dbCollection.js";
import { findAccountById } from "./accountLookup.js";

const VALID_TARGETS = ["All Users", "Admin Only", "Active Users", "Expired Users"];
const MAIL_BATCH_SIZE = 10;

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// only http(s) links may end up behind the email button (no javascript: / data: URLs)
const safeLink = (link) => (/^https?:\/\//i.test(String(link || "").trim()) ? String(link).trim() : "#");

/* =========================
   CREATE ANNOUNCEMENT
========================= */

// export const createAnnouncementService = async (payload) => {
//   const id = announcementsCollection.doc().id;

//   const model = createAnnouncementModel({
//     id,
//     ...payload,
//   });

//   await announcementsCollection.doc(id).set(model);

//   return model;
// };


export const createAnnouncementService = async (payload) => {
  if (!payload?.title?.trim() || !payload?.message?.trim()) {
    throw httpError(400, "Title and message are required");
  }
  if (payload.target && !VALID_TARGETS.includes(payload.target)) {
    throw httpError(400, `Target must be one of: ${VALID_TARGETS.join(", ")}`);
  }

  const id =
    announcementsCollection
      .doc().id;

  const model =
    createAnnouncementModel({
      ...payload,
      announcementId: id,
    });

  await announcementsCollection
    .doc(id)
    .set(model);

  /* ================= GET USERS ================= */

  let users = [];

  // ALL USERS
  if (
    payload.target ===
    "All Users"
  ) {
    const snapshot =
      await usersCollections.get();

    users =
      snapshot.docs.map((doc) =>
        doc.data()
      );
  }

  // ADMIN ONLY (every registered business account)
  else if (
    payload.target ===
    "Admin Only"
  ) {
    const snapshot =
      await usersCollections.get();

    users =
      snapshot.docs.map((doc) =>
        doc.data()
      );
  }

  // ACTIVE USERS
  else if (
    payload.target ===
    "Active Users"
  ) {
    const snapshot =
      await usersCollections
        .where(
          "subscriptionStatus",
          "==",
          "ACTIVE"
        )
        .get();

    users =
      snapshot.docs.map((doc) =>
        doc.data()
      );
  }

  // EXPIRED USERS
  else if (
    payload.target ===
    "Expired Users"
  ) {
    const snapshot =
      await usersCollections
        .where(
          "subscriptionStatus",
          "==",
          "EXPIRED"
        )
        .get();

    users =
      snapshot.docs.map((doc) =>
        doc.data()
      );
  }

  /* ================= SEND MAILS ================= */

  // Sent in small parallel batches: one-by-one takes too long for many users, and
  // one failing address must not stop the rest.
  const recipients = users.filter((user) => user?.email);
  for (let i = 0; i < recipients.length; i += MAIL_BATCH_SIZE) {
    const batch = recipients.slice(i, i + MAIL_BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((user) =>
        mailService({
          type: "ANNOUNCEMENT_MAIL",
          to: user.email,
          data: {
            name: escapeHtml(user.username || "User"),
            title: escapeHtml(payload.title),
            message: escapeHtml(payload.message).replace(/\r?\n/g, "<br>"),
            type: escapeHtml(payload.type),
            priority: escapeHtml(payload.priority),
            buttonText: escapeHtml(payload.buttonText || "Open Dashboard"),
            buttonLink: safeLink(payload.buttonLink),
          },
        })
      )
    );

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Failed to send announcement mail to ${batch[index].email}:`, result.reason?.message);
      }
    });
  }

  return { id, ...model };
};

/* =========================
   GET ALL (ROLE FILTER)
========================= */

export const getAnnouncementsService = async (role) => {
  let query = announcementsCollection.where("isDeleted", "==", false);

  if (role && role !== "All") {
    query = query.where("target", "in", [role, "All Users"]);
  }

  const snapshot = await query.get();

  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    data,
    count: data.length,
  };
};

/* =========================
   TOGGLE STATUS
========================= */

export const toggleAnnouncementService = async (id) => {
  const ref = announcementsCollection.doc(id);
  const docSnap = await ref.get();

  if (!docSnap.exists) {
    throw new Error("Announcement not found");
  }

  const current = docSnap.data().status || "Inactive";
  const newStatus = current === "Active" ? "Inactive" : "Active";

  const updatedData = updateAnnouncementModel({
    status: newStatus,
  });

  await ref.update(updatedData);

  return {
    id,
    status: newStatus,
  };
};

/* =========================
   DELETE (SOFT DELETE)
========================= */

export const deleteAnnouncementService = async (id) => {
  const ref = announcementsCollection.doc(id);
  const docSnap = await ref.get();

  if (!docSnap.exists) {
    throw new Error("Announcement not found");
  }

  const updated = updateAnnouncementModel({
    isDeleted: true,
  });

  await ref.update(updated);

  return {
    id,
    message: "Announcement deleted successfully",
  };
};

/* =========================
   GET BY ROLE
========================= */

/**
 * Announcements a signed-in user should see: active, not deleted, and addressed to
 * them ("All Users", "Admin Only" for admins, or by subscription status).
 */
export const getAnnouncementsForUserService = async (user) => {
  const snapshot = await announcementsCollection.where("isDeleted", "==", false).get();
  let all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (user?.role !== "superadmin") {
    const account = await findAccountById(user?.userId);
    let status = account?.data?.subscriptionStatus;
    if (account?.isSubuser) {
      // a sub-user is covered by the parent business's subscription
      const parent = await findAccountById(account.data.parentUserId);
      status = parent?.data?.subscriptionStatus;
    }
    const isAdmin = user?.role === "admin";

    all = all.filter((a) => {
      if (a.status !== "Active") return false;
      switch (a.target) {
        case "Admin Only": return isAdmin;
        case "Active Users": return status === "ACTIVE";
        case "Expired Users": return status === "EXPIRED";
        default: return true; // "All Users" and legacy values
      }
    });
  }

  all.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  return { data: all, count: all.length };
};

export const getAnnouncementsByRoleService = async (role) => {
  let query = announcementsCollection.where("isDeleted", "==", false);

  if (role && role !== "superadmin") {
    query = query.where("target", "in", [role, "All Users"]);
  }

  const snapshot = await query.get();

  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    data,
    count: data.length,
  };
};