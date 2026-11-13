import multer from "multer";
import { createJobsheet, getJobsheetsByGeneratedById, updateJobsheetStatus, searchJobsheet } from "../services/jobsheetService.js";
import { jobsheetsCollections } from "../config/dbCollection.js";
import { assertAccess } from "../middleware/access.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

export const uploadMiddleware = upload.single("pdf");

const sendError = (res, error) =>
  res.status(error.status || 500).json({ error: error.message || "Internal server error" });

export async function createJobsheetHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required" });
    }
    if (!req.user?.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // The author is always the authenticated user, never a client-supplied id.
    const result = await createJobsheet({
      pdfBuffer: req.file.buffer,
      fields: { ...req.body, generatedById: req.user.userId },
      ownerId: req.user.parentUid || req.user.userId,
    });

    res.status(201).json(result);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getJobsheetsByUserHandler(req, res) {
  try {
    const { generatedById } = req.params;
    await assertAccess(req.user, generatedById);
    const jobsheets = await getJobsheetsByGeneratedById(generatedById);
    res.status(200).json(jobsheets);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateJobsheetStatusHandler(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const existing = await jobsheetsCollections.doc(String(id)).get();
    if (!existing.exists) {
      return res.status(404).json({ error: "Jobsheet not found" });
    }
    await assertAccess(req.user, existing.data().generatedById);

    const result = await updateJobsheetStatus(id, status);
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}

// Public customer lookup (job id + mobile number); intentionally unauthenticated.
export async function searchJobsheetHandler(req, res) {
  try {
    const { jobId, mobileNumber, name } = req.query;
    const result = await searchJobsheet({ jobId, mobileNumber, name });
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}
