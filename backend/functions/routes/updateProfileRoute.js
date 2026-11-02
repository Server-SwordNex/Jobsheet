import { Router } from "express";
import { updateProfileHandler } from "../controllers/updateProfileController.js";

const router = Router();

router.put("/api/profile/:uid", updateProfileHandler);

export default router;
