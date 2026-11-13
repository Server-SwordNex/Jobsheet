import { getDashboardData } from "../services/dashboardService.js";
import { assertAccess } from "../middleware/access.js";

export async function getDashboardHandler(req, res) {
  try {
    const { uid } = req.params;
    const { subuserId } = req.query;
    // "superadmin" only passes for a super-admin token; everyone else needs to own the uid
    await assertAccess(req.user, uid);
    const result = await getDashboardData(uid, subuserId);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}
