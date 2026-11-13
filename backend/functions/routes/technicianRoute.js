import { Router } from "express";
import {
  getTechnicians,
  getTechnician,
  getTechniciansByUserHandler,
  getTechnicianWithJobsHandler,
  addTechnician,
  editTechnician,
  removeTechnician,
  assignTechnicianJobsheetHandler,
} from "../controllers/technicianController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use("/api/technicians", requireAuth);

router.get("/api/technicians", getTechnicians);
router.get("/api/technicians/user/:uid", getTechniciansByUserHandler);
router.get("/api/technicians/:id", getTechnician);
router.get("/api/technicians/:id/jobs", getTechnicianWithJobsHandler);
router.post("/api/technicians", addTechnician);
router.put("/api/technicians/:id", editTechnician);
router.delete("/api/technicians/:id", removeTechnician);
router.post("/api/technicians/:technicianId/jobs", assignTechnicianJobsheetHandler);

export default router;
