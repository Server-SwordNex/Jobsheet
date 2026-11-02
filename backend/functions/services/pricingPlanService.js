import { pricingPlansCollections, subUserPriceCollection } from "../config/dbCollection.js";
import PricingPlanModel from "../models/pricingPlanModel.js";

const SUB_USER_PRICE_DOC = "config";

export async function getAllPlans() {
  const snapshot = await pricingPlansCollections.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getPlanById(id) {
  const doc = await pricingPlansCollections.doc(id).get();
  if (!doc.exists) {
    const error = new Error("Pricing plan not found");
    error.status = 404;
    throw error;
  }
  return { id: doc.id, ...doc.data() };
}

export async function createPlan(data) {
  const model = new PricingPlanModel(data);
  const docRef = await pricingPlansCollections.add(model.toFirestore());
  await docRef.update({ id: docRef.id });
  return { id: docRef.id, ...model.toFirestore(), id: docRef.id };
}

export async function updatePlan(id, data) {
  const doc = await pricingPlansCollections.doc(id).get();
  if (!doc.exists) {
    const error = new Error("Pricing plan not found");
    error.status = 404;
    throw error;
  }
  const existing = new PricingPlanModel(doc.data());
  const updated = new PricingPlanModel({ ...existing.toFirestore(), ...data, id, updatedAt: new Date() });
  await pricingPlansCollections.doc(id).update(updated.toFirestore());
  return { id, ...updated.toFirestore() };
}

export async function deletePlan(id) {
  const doc = await pricingPlansCollections.doc(id).get();
  if (!doc.exists) {
    const error = new Error("Pricing plan not found");
    error.status = 404;
    throw error;
  }
  await pricingPlansCollections.doc(id).delete();
  return { message: "Pricing plan deleted successfully" };
}

export async function createOrUpdateSubUserPrice(amount) {
  const docRef = subUserPriceCollection.doc(SUB_USER_PRICE_DOC);
  const doc = await docRef.get();

  if (!doc.exists) {
    await docRef.set({
      pricePerSubUser: amount,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    await docRef.update({
      pricePerSubUser: amount,
      updatedAt: new Date(),
    });
  }

  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

export async function getSubUserPrice() {
  const docRef = subUserPriceCollection.doc(SUB_USER_PRICE_DOC);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  return { id: doc.id, ...doc.data() };
}
