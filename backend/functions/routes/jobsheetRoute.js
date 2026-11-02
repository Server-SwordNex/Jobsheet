import { Router } from "express";
import { uploadMiddleware, createJobsheetHandler, getJobsheetsByUserHandler, updateJobsheetStatusHandler, searchJobsheetHandler } from "../controllers/jobsheetController.js";

const router = Router();

router.get("/api/jobsheets/search", searchJobsheetHandler);
router.post("/api/jobsheets", uploadMiddleware, createJobsheetHandler);
router.get("/api/jobsheets/user/:generatedById", getJobsheetsByUserHandler);
router.patch("/api/jobsheets/:id/status", updateJobsheetStatusHandler);

export default router;
