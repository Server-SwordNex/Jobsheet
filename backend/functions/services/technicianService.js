import { FieldValue } from "firebase-admin/firestore";
import { jobsheetsCollections, techniciansCollections, usersCollections } from "../config/dbCollection.js";
import TechnicianModel from "../models/technicianModel.js";
import { assertCanCreateTechnician } from "./planLimitService.js";

export async function getAllTechnicians() {
  const snapshot = await techniciansCollections.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getTechniciansByUser(uid) {
  const snapshot = await techniciansCollections
    .where("technicianOf", "==", uid)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getTechnicianById(id) {
  const doc = await techniciansCollections.doc(id).get();
  if (!doc.exists) {
    const error = new Error("Technician not found");
    error.status = 404;
    throw error;
  }
  return { id: doc.id, ...doc.data() };
}

export async function createTechnician(data) {
  if (!data.name || !data.email || !data.mobileNo || !data.technicianOf) {
    const error = new Error("Name, email, mobileNo, and technicianOf are required");
    error.status = 400;
    throw error;
  }

  await assertCanCreateTechnician(data.technicianOf);

  const model = new TechnicianModel(data);
  const docRef = await techniciansCollections.add(model.toFirestore());
  await docRef.update({ id: docRef.id });

  await usersCollections.doc(data.technicianOf).update({
    currentStaffs: FieldValue.increment(1),
  });

  return { id: docRef.id, ...model.toFirestore(), id: docRef.id };
}

export async function updateTechnician(id, data) {
  const doc = await techniciansCollections.doc(id).get();
  if (!doc.exists) {
    const error = new Error("Technician not found");
    error.status = 404;
    throw error;
  }
  const existing = new TechnicianModel(doc.data());
  const updated = new TechnicianModel({
    ...existing.toFirestore(),
    ...data,
    id,
    updatedAt: new Date(),
  });
  await techniciansCollections.doc(id).update(updated.toFirestore());
  return { id, ...updated.toFirestore() };
}

export async function deleteTechnician(id) {
  const doc = await techniciansCollections.doc(id).get();
  if (!doc.exists) {
    const error = new Error("Technician not found");
    error.status = 404;
    throw error;
  }
  const ownerId = doc.data().technicianOf;
  await techniciansCollections.doc(id).delete();

  // keep the displayed staff counter in step with creation
  if (ownerId) {
    try {
      await usersCollections.doc(ownerId).update({ currentStaffs: FieldValue.increment(-1) });
    } catch (err) {
      console.warn("Could not decrement currentStaffs:", err.message);
    }
  }
  return { message: "Technician deleted successfully" };
}

export async function assignJobsheetToTechnician(technicianId, jobsheetId, jobsheetNo) {
  if (!technicianId || !jobsheetId) {
    const error = new Error("technicianId and jobsheetId are required");
    error.status = 400;
    throw error;
  }

  const techDoc = await techniciansCollections.doc(technicianId).get();
  if (!techDoc.exists) {
    const error = new Error("Technician not found");
    error.status = 404;
    throw error;
  }

  const jsDoc = await jobsheetsCollections.doc(jobsheetId).get();
  if (!jsDoc.exists) {
    const error = new Error("Jobsheet not found");
    error.status = 404;
    throw error;
  }

  const jsData = jsDoc.data();
  const displayNo = jobsheetNo || jsData.jobsheetNo || "";

  const techData = techDoc.data();
  const assigned = techData.assignedJobsheets || [];
  const alreadyAssigned = assigned.some(item =>
    typeof item === "string" ? item === jobsheetId : item.id === jobsheetId
  );

  if (!alreadyAssigned) {
    await techniciansCollections.doc(technicianId).update({
      assignedJobsheets: FieldValue.arrayUnion({ id: jobsheetId, jobsheetNo: displayNo }),
      totalAssignedJobs: FieldValue.increment(1),
      updatedAt: new Date(),
    });
  }

  await jobsheetsCollections.doc(jobsheetId).update({
    technicianId,
    updatedAt: new Date(),
  });

  return { message: "Jobsheet assigned to technician successfully" };
}

export async function getTechnicianWithJobsheets(id) {
  const techData = await getTechnicianById(id);

  const assigned = techData.assignedJobsheets || [];
  if (assigned.length === 0) {
    return { ...techData, jobsheets: [] };
  }

  const jobsheetIds = assigned.map(item => (typeof item === "string" ? item : item.id));

  const jobsheets = [];
  for (const jsId of jobsheetIds) {
    const doc = await jobsheetsCollections.doc(jsId).get();
    if (doc.exists) {
      jobsheets.push({ id: doc.id, ...doc.data() });
    }
  }

  jobsheets.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });

  return { ...techData, jobsheets };
}
