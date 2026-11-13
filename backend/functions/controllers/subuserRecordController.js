import { getAdminSubuserRecordsService } from "../services/subuserRecordService.js";
import { assertAdminOf } from "../middleware/access.js";

export async function getAdminSubuserRecordsHandler(req, res) {
  try {
    const { parentUid } = req.params;
    const { subuserName } = req.query;
    assertAdminOf(req.user, parentUid);

    const result = await getAdminSubuserRecordsService(parentUid, subuserName);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}
