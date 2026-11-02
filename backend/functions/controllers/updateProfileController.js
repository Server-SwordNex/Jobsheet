import { updateProfile } from "../services/updateProfileService.js";

export async function updateProfileHandler(req, res) {
  try {
    const { uid } = req.params;
    const result = await updateProfile(uid, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}
