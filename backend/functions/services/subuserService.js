import { FieldValue } from "firebase-admin/firestore";
import bcrypt from "bcryptjs";
import { usersCollections, subUsersCollection } from "../config/dbCollection.js";
import { newAccountId } from "../config/firebaseTenantConfig.js";
import { createSubuserModel } from "../models/subuserModel.js";
import { stripSecrets } from "../middleware/access.js";
import { assertCanCreateSubuser } from "./planLimitService.js";
import { findAccountByEmail } from "./accountLookup.js";

export async function createSubuser(parentUid, data) {
  if (!parentUid) {
    const error = new Error("Parent UID missing");
    error.status = 400;
    throw error;
  }

  await assertCanCreateSubuser(parentUid);

  if (!data.email || !data.password || !data.subUserName) {
    const error = new Error("Name, email and password are required");
    error.status = 400;
    throw error;
  }
  if (String(data.password).length < 6) {
    const error = new Error("Password must be at least 6 characters");
    error.status = 400;
    throw error;
  }
  data = { ...data, email: String(data.email).trim().toLowerCase() };

  // an email may belong to only one Jobsheet account (admin or sub-user)
  if (await findAccountByEmail(data.email)) {
    const error = new Error("Email already exists");
    error.status = 409;
    throw error;
  }

  // A team member signs in with a login that belongs to this business only: it is not an
  // account of the shared SwordNex login, so it never touches another SwordNex app's accounts.
  const uid = newAccountId();
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const subUserData = createSubuserModel({
    uid,
    parentUserId: parentUid,
    role: "team",
    password: hashedPassword,
    empId: data.empId,
    subUserName: data.subUserName,
    email: data.email,
    phone: data.phone,
    jobSheetGenerated: 0,
    subBranchName: data.subBranchName || "",
    addressLine1: data.addressLine1 || "",
    addressLine2: data.addressLine2 || "",
    city: data.city || "",
    state: data.state || "",
    pincode: data.pincode || "",
    companyName: data.companyName || "",
    username: data.username || "",
    gstin: data.gstin || "",
    website: data.website || "",
  });

  await subUsersCollection.doc(uid).set(subUserData);

  await usersCollections.doc(parentUid).update({
    currentStaffs: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    message: "Subuser created successfully",
    data: { ...stripSecrets(subUserData), authUid: uid },
  };
}

export async function deleteSubuser(subUserUid) {
  if (!subUserUid) {
    const error = new Error("Subuser UID is required");
    error.status = 400;
    throw error;
  }

  const docRef = subUsersCollection.doc(subUserUid);
  const doc = await docRef.get();

  if (!doc.exists) {
    const error = new Error("Subuser not found");
    error.status = 404;
    throw error;
  }

  const subUserData = doc.data();
  const parentUid = subUserData.parentUserId;

  await docRef.delete();

  if (parentUid) {
    await usersCollections.doc(parentUid).update({
      currentStaffs: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  return { message: "Subuser deleted successfully", data: { uid: subUserUid, parentUid } };
}

export async function getSubusers(parentUid) {
  if (!parentUid) {
    const error = new Error("Parent UID missing");
    error.status = 400;
    throw error;
  }

  const snapshot = await subUsersCollection
    .where("parentUserId", "==", parentUid)
    .get();

  const data = snapshot.docs.map((doc) => ({ uid: doc.id, ...stripSecrets(doc.data()) }));

  return { data, count: data.length };
}
