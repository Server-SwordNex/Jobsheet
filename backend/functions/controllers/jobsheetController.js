import multer from "multer";
import { createJobsheet, getJobsheetsByGeneratedById, updateJobsheetStatus, searchJobsheet } from "../services/jobsheetService.js";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadMiddleware = upload.single("pdf");

export async function createJobsheetHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    const result = await createJobsheet({
      pdfBuffer: req.file.buffer,
      fields: req.body,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function getJobsheetsByUserHandler(req, res) {
  try {
    const { generatedById } = req.params;
    const jobsheets = await getJobsheetsByGeneratedById(generatedById);
    res.status(200).json(jobsheets);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function updateJobsheetStatusHandler(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await updateJobsheetStatus(id, status);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function searchJobsheetHandler(req, res) {
  try {
    const { jobId, mobileNumber, name } = req.query;
    const result = await searchJobsheet({ jobId, mobileNumber, name });
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

