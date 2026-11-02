import {
  createAnnouncementModel,
  updateAnnouncementModel,
} from "../models/announcementModel.js";
import { mailService } from "../mail/mailService.js";
import { announcementsCollection, usersCollections } from "../config/dbCollection.js";

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
  const id =
    announcementsCollection
      .doc().id;

  const model =
    createAnnouncementModel({
      id,
      ...payload,
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

  for (const user of users) {
    if (!user?.email)
      continue;

    try {
      await mailService({
        type:
          "ANNOUNCEMENT_MAIL",

        to: user.email,

        data: {
          name:
            user.username ||
            "User",

          title:
            payload.title,

          message:
            payload.message,

          type:
            payload.type,

          priority:
            payload.priority,

          buttonText:
            payload.buttonText ||
            "Open Dashboard",

          buttonLink:
            payload.buttonLink ||
            "#",
        },
      });

      console.log(
        `✅ Announcement mail sent to ${user.email}`
      );
    } catch (error) {
      console.error(
        `❌ Failed to send mail to ${user.email}`
      );

      console.error(error);
    }
  }

  return model;
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