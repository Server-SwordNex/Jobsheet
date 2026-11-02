import { getDashboardData } from "../services/dashboardService.js";

export async function getDashboardHandler(req, res) {
  try {
    const { uid } = req.params;
    const { subuserId } = req.query;
    const result = await getDashboardData(uid, subuserId);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}
