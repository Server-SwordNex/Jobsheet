// src/routes/announcement.routes.js

import express from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
  toggle,
  remove,
  getAnnouncementsByRole
} from "../controllers/announcementController.js";
import { requireAdminAuth } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

/* =========================
   ✅ CREATE (ADMIN ONLY)
========================= */
router.post("/api/create-announcement", requireAdminAuth, createAnnouncement);


/* =========================
   ✅ GET ALL (ADMIN ONLY)
========================= */
router.get("/api/getall-announcements", requireAdminAuth, getAllAnnouncements);


/* =========================
   ✅ TOGGLE STATUS (ADMIN ONLY)
========================= */
router.put("/api/toggle-announcement/:id", requireAdminAuth, toggle);


/* =========================
   ✅ DELETE (SOFT DELETE) (ADMIN ONLY)
========================= */
router.delete("/api/delete-announcement/:id", requireAdminAuth, remove);


router.get("/api/announcements", getAnnouncementsByRole);   


export default router;