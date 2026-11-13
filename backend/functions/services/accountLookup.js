import { usersCollections, subUsersCollection } from "../config/dbCollection.js";

export const normalizeEmail = (email) => String(email ?? "").trim().toLowerCase();

async function findByEmail(collection, email) {
  const clean = normalizeEmail(email);
  let snap = await collection.where("email", "==", clean).limit(1).get();
  const raw = String(email ?? "").trim();
  if (snap.empty && raw && raw !== clean) {
    snap = await collection.where("email", "==", raw).limit(1).get();
  }
  return snap.empty ? null : snap.docs[0];
}

/** Finds a registered account (admin first, then sub-user) by email. */
export async function findAccountByEmail(email) {
  if (!normalizeEmail(email)) return null;

  const userDoc = await findByEmail(usersCollections, email);
  if (userDoc) return { id: userDoc.id, ref: userDoc.ref, data: userDoc.data(), isSubuser: false };

  const subDoc = await findByEmail(subUsersCollection, email);
  if (subDoc) return { id: subDoc.id, ref: subDoc.ref, data: subDoc.data(), isSubuser: true };

  return null;
}

/** Finds a registered account by its document id (same id as the Firebase Auth uid). */
export async function findAccountById(id) {
  if (!id) return null;

  const userDoc = await usersCollections.doc(String(id)).get();
  if (userDoc.exists) return { id: userDoc.id, ref: userDoc.ref, data: userDoc.data(), isSubuser: false };

  const subDoc = await subUsersCollection.doc(String(id)).get();
  if (subDoc.exists) return { id: subDoc.id, ref: subDoc.ref, data: subDoc.data(), isSubuser: true };

  return null;
}
