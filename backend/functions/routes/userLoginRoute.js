import { Router } from "express";
import { loginHandler, logoutHandler } from "../controllers/userLoginController.js";

const router = Router();

router.post("/api/auth/login", loginHandler);
router.post("/api/auth/logout", logoutHandler);

export default router;
