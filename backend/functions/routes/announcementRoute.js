// src/routes/announcement.routes.js

import express from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
  toggle,
  remove,
  getAnnouncementsByRole
} from "../controllers/announcementController.js";

const router = express.Router();

/* =========================
   ✅ CREATE
========================= */
router.post("/api/create-announcement", createAnnouncement);


/* =========================
   ✅ GET ALL (SUPERADMIN ONLY)
========================= */
router.get("/api/getall-announcements", getAllAnnouncements);


/* =========================
   ✅ TOGGLE STATUS
========================= */
router.put("/api/toggle-announcement/:id", toggle);


/* =========================
   ✅ DELETE (SOFT DELETE)
========================= */
router.delete("/api/delete-announcement/:id", remove);


router.get("/api/announcements", getAnnouncementsByRole);   


export default router;