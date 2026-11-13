import { Router } from "express";
import { requireAdminAuth } from "../middleware/adminAuthMiddleware.js";
import { getSettings, updateSettings } from "../services/platformSettingsService.js";

const router = Router();

const fail = (res, error) =>
  res.status(error.status || 500).json({ error: error.message || "Internal server error" });

router.get("/api/superadmin/settings", requireAdminAuth, async (req, res) => {
  try {
    res.json(await getSettings());
  } catch (error) {
    fail(res, error);
  }
});

router.put("/api/superadmin/settings", requireAdminAuth, async (req, res) => {
  try {
    res.json(await updateSettings(req.body || {}));
  } catch (error) {
    fail(res, error);
  }
});

export default router;
