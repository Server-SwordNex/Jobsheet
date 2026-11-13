import { Router } from "express";
import { updateProfileHandler } from "../controllers/updateProfileController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.put("/api/profile/:uid", requireAuth, updateProfileHandler);

export default router;
