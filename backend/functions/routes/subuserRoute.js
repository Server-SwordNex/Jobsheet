import { Router } from "express";
import { createSubuserHandler, deleteSubuserHandler, getSubusersHandler } from "../controllers/subuserController.js";

const router = Router();

router.post("/api/subusers/:parentUid", createSubuserHandler);
router.delete("/api/subusers/:subUserUid", deleteSubuserHandler);
router.get("/api/subusers/:parentUid", getSubusersHandler);

export default router;
