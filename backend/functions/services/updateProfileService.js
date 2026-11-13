import { Timestamp } from "firebase-admin/firestore";
import { usersCollections, subUsersCollection } from "../config/dbCollection.js";

/* ================= UPDATE PROFILE ================= */

export const updateProfile = async (uid, body) => {
  try {
    console.log("\n================ UPDATE PROFILE START ================\n");

    if (!uid) {
      const e = new Error("UID is required");
      e.status = 400;
      throw e;
    }

    const trimmedUID = uid.trim();

    const allowedFields = [
      "addressLine1",
      "addressLine2",
      "city",
      "pincode",
      "mobileNo",
      "terms",
      "jobSheetPrefix",
      "jobSheetSuffix",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      const e = new Error("No valid fields to update");
      e.status = 400;
      throw e;
    }

    updateData.updatedAt = Timestamp.now();

    let userRef = usersCollections.doc(trimmedUID);
    let existingDoc = await userRef.get();

    // FALLBACK QUERY
    if (!existingDoc.exists) {
      const querySnapshot = await usersCollections
        .where("uid", "==", trimmedUID)
        .limit(1)
        .get();

      if (!querySnapshot.empty) {
        userRef = querySnapshot.docs[0].ref;
        existingDoc = await userRef.get();
      } else {
        // a sub-user editing their own profile
        const subRef = subUsersCollection.doc(trimmedUID);
        const subSnap = await subRef.get();
        if (!subSnap.exists) {
          const notFound = new Error("User document not found");
          notFound.status = 404;
          throw notFound;
        }
        userRef = subRef;
        existingDoc = subSnap;
      }
    }

    await userRef.update(updateData);
    const updatedDoc = await userRef.get();
    console.log("✅ PROFILE UPDATED");
    return updatedDoc.data();
  } catch (error) {
    console.error("\n❌ UPDATE PROFILE ERROR ❌", error);
    throw error;
  }
};
