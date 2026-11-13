import {
  getAllTechnicians,
  getTechnicianById,
  getTechniciansByUser,
  getTechnicianWithJobsheets,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  assignJobsheetToTechnician,
} from "../services/technicianService.js";
import { jobsheetsCollections, subUsersCollection } from "../config/dbCollection.js";
import { assertAccess, isSuperAdmin } from "../middleware/access.js";

const sendError = (res, error) =>
  res.status(error.status || 500).json({ error: error.message || "Internal server error" });

/** Loads a technician and makes sure the caller may act on its owner's data. */
async function loadAccessibleTechnician(req, id) {
  const technician = await getTechnicianById(id);
  await assertAccess(req.user, technician.technicianOf, { allowParent: true });
  return technician;
}

async function isSubuserOf(subUid, parentUid) {
  if (!subUid || !parentUid) return false;
  const snap = await subUsersCollection.doc(String(subUid)).get();
  return snap.exists && snap.data().parentUserId === parentUid;
}

export async function getTechnicians(req, res) {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({ error: "Access denied" });
    }
    const technicians = await getAllTechnicians();
    res.status(200).json(technicians);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getTechniciansByUserHandler(req, res) {
  try {
    await assertAccess(req.user, req.params.uid, { allowParent: true });
    const technicians = await getTechniciansByUser(req.params.uid);
    res.status(200).json(technicians);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getTechnician(req, res) {
  try {
    const technician = await loadAccessibleTechnician(req, req.params.id);
    res.status(200).json(technician);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getTechnicianWithJobsHandler(req, res) {
  try {
    await loadAccessibleTechnician(req, req.params.id);
    const technician = await getTechnicianWithJobsheets(req.params.id);
    res.status(200).json(technician);
  } catch (error) {
    sendError(res, error);
  }
}

export async function addTechnician(req, res) {
  try {
    const { name, email, mobileNo, technicianOf } = req.body || {};
    await assertAccess(req.user, technicianOf, { allowParent: true });
    const technician = await createTechnician({ name, email, mobileNo, technicianOf });
    res.status(201).json(technician);
  } catch (error) {
    sendError(res, error);
  }
}

export async function editTechnician(req, res) {
  try {
    await loadAccessibleTechnician(req, req.params.id);
    // only profile fields are editable; ownership and counters are server-managed
    const { name, email, mobileNo } = req.body || {};
    const changes = Object.fromEntries(
      Object.entries({ name, email, mobileNo }).filter(([, v]) => v !== undefined)
    );
    const technician = await updateTechnician(req.params.id, changes);
    res.status(200).json(technician);
  } catch (error) {
    sendError(res, error);
  }
}

export async function removeTechnician(req, res) {
  try {
    await loadAccessibleTechnician(req, req.params.id);
    const result = await deleteTechnician(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}

export async function assignTechnicianJobsheetHandler(req, res) {
  try {
    const { technicianId } = req.params;
    const { jobsheetId, jobsheetNo } = req.body || {};

    const technician = await loadAccessibleTechnician(req, technicianId);
    if (!jobsheetId) {
      return res.status(400).json({ error: "technicianId and jobsheetId are required" });
    }

    const jobsheetSnap = await jobsheetsCollections.doc(String(jobsheetId)).get();
    if (!jobsheetSnap.exists) {
      return res.status(404).json({ error: "Jobsheet not found" });
    }

    const authorId = jobsheetSnap.data().generatedById;
    await assertAccess(req.user, authorId, { allowParent: true });

    // a technician can only be given work that belongs to the same business
    if (!isSuperAdmin(req.user)) {
      const sameOwner =
        authorId === technician.technicianOf || (await isSubuserOf(authorId, technician.technicianOf));
      if (!sameOwner) return res.status(403).json({ error: "Access denied" });
    }

    const result = await assignJobsheetToTechnician(technicianId, jobsheetId, jobsheetNo);
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}
