import { Router } from "express";
import { getAdminSubuserRecordsHandler } from "../controllers/subuserRecordController.js";

const router = Router();

router.get("/api/subusers/records/:parentUid", getAdminSubuserRecordsHandler);

export default router;
