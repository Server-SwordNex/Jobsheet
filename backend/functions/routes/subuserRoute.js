import { Router } from "express";
import { createSubuserHandler, deleteSubuserHandler, getSubusersHandler } from "../controllers/subuserController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/api/subusers/:parentUid", requireAuth, createSubuserHandler);
router.delete("/api/subusers/:subUserUid", requireAuth, deleteSubuserHandler);
router.get("/api/subusers/:parentUid", requireAuth, getSubusersHandler);

export default router;
