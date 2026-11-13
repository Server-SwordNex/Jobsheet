import { pricingPlansCollections, subUserPriceCollection } from "../config/dbCollection.js";
import PricingPlanModel from "../models/pricingPlanModel.js";
import { clearEntitlementCache } from "./entitlements.js";

const SUB_USER_PRICE_DOC = "config";

const BILLING_ORDER = { free: 0, monthly: 1, annual: 2 };

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const validate = (model) => {
  if (!model.name) throw httpError(400, "Give the plan a name");
  if (!["free", "monthly", "annual"].includes(model.billingType)) {
    throw httpError(400, "Billing must be free, monthly or annual");
  }
  if (model.billingType !== "free" && !(model.price > 0)) {
    throw httpError(400, "A paid plan needs a price above zero");
  }
};

// sign-up finds a plan by name + billing type, so that pair has to be unique
const assertUnique = async (model, exceptId = null) => {
  const snap = await pricingPlansCollections
    .where("name", "==", model.name)
    .where("billingType", "==", model.billingType)
    .get();
  if (snap.docs.some((doc) => doc.id !== exceptId)) {
    throw httpError(409, `A ${model.billingType} plan named "${model.name}" already exists`);
  }
};

/* ================= GET ================= */

export async function getAllPlans() {
  const snapshot = await pricingPlansCollections.get();
  return snapshot.docs
    .map((doc) => new PricingPlanModel({ ...doc.data(), id: doc.id }).toApi())
    .sort(
      (a, b) =>
        (BILLING_ORDER[a.billingType] ?? 9) - (BILLING_ORDER[b.billingType] ?? 9) || a.price - b.price
    );
}

export async function getPlanById(id) {
  const doc = await pricingPlansCollections.doc(id).get();
  if (!doc.exists) throw httpError(404, "Pricing plan not found");
  return new PricingPlanModel({ ...doc.data(), id: doc.id }).toApi();
}

/* ================= CREATE ================= */

export async function createPlan(data) {
  const ref = pricingPlansCollections.doc();

  const model = new PricingPlanModel({
    ...data,
    id: ref.id,
    price: data.billingType === "free" ? 0 : data.price,
    createdAt: new Date(),
  });

  validate(model);
  await assertUnique(model);
  await ref.set(model.toFirestore());
  clearEntitlementCache();

  return model.toApi();
}

/* ================= UPDATE ================= */

export async function updatePlan(id, data) {
  const ref = pricingPlansCollections.doc(id);
  const doc = await ref.get();
  if (!doc.exists) throw httpError(404, "Pricing plan not found");

  const existing = doc.data();
  const billingType = data.billingType ?? existing.billingType;

  const model = new PricingPlanModel({
    ...existing,
    ...data,
    // an update that does not mention them keeps the saved ones
    capabilities: data.capabilities ?? existing.capabilities,
    id,
    price: billingType === "free" ? 0 : data.price ?? existing.price,
    updatedAt: new Date(),
  });

  validate(model);
  await assertUnique(model, id);
  await ref.update(model.toFirestore());
  clearEntitlementCache();

  return model.toApi();
}

/* ================= DELETE ================= */

export async function deletePlan(id) {
  const doc = await pricingPlansCollections.doc(id).get();
  if (!doc.exists) throw httpError(404, "Pricing plan not found");

  await pricingPlansCollections.doc(id).delete();
  clearEntitlementCache();
  return { message: "Pricing plan deleted successfully" };
}

/* ================= SUB-USER PRICE ================= */

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
