import { FieldValue } from "firebase-admin/firestore";
import bcrypt from "bcrypt";
import { usersCollections, subUsersCollection } from "../config/dbCollection.js";
import { tenantAuth } from "../config/firebaseTenantConfig.js";
import { createSubuserModel } from "../models/subuserModel.js";

export async function createSubuser(parentUid, data) {
  if (!parentUid) {
    const error = new Error("Parent UID missing");
    error.status = 400;
    throw error;
  }

  try {
    await tenantAuth.getUserByEmail(data.email);
    const error = new Error("Email already exists");
    error.status = 409;
    throw error;
  } catch (err) {
    if (err.status === 409) throw err;
    if (err.code !== "auth/user-not-found") throw err;
  }

  const userRecord = await tenantAuth.createUser({
    email: data.email,
    password: data.password,
    displayName: data.subUserName,
  });

  const uid = userRecord.uid;
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
    data: { ...subUserData, authUid: uid },
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

  try {
    await tenantAuth.deleteUser(subUserUid);
  } catch (authErr) {
    console.warn("Auth user deletion failed:", authErr.message);
  }

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

  const data = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));

  return { data, count: data.length };
}
