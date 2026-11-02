import {
  createAnnouncementService,
  getAnnouncementsService,
  toggleAnnouncementService,
  deleteAnnouncementService,
  getAnnouncementsByRoleService,
} from "../services/announcementService.js";

/* =========================
   CREATE
========================= */

export const createAnnouncement = async (req, res) => {
  try {
    const data = await createAnnouncementService(req.body);

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data,
    });
  } catch (err) {
    console.error("CREATE ANNOUNCEMENT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

/* =========================
   GET ALL
========================= */

export const getAllAnnouncements = async (req, res) => {
  try {
    const { role } = req.query;

    if (role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const result = await getAnnouncementsService(role);

    return res.status(200).json({
      success: true,
      data: result.data,
      count: result.count,
    });
  } catch (err) {
    console.error("GET ALL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Error fetching announcements",
    });
  }
};

/* =========================
   TOGGLE STATUS
========================= */

export const toggle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing announcement id",
      });
    }

    const data = await toggleAnnouncementService(id);

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data,
    });
  } catch (err) {
    console.error("TOGGLE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Toggle failed",
    });
  }
};

/* =========================
   DELETE
========================= */

export const remove = async (req, res) => {
  try {
    const data = await deleteAnnouncementService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
      data,
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Delete failed",
    });
  }
};

/* =========================
   GET BY ROLE
========================= */

export const getAnnouncementsByRole = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const result = await getAnnouncementsByRoleService(role);

    return res.status(200).json({
      success: true,
      data: result.data,
      count: result.count,
    });
  } catch (err) {
    console.error("GET ANNOUNCEMENTS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch announcements",
    });
  }
};