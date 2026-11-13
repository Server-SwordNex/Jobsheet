import { updateProfile } from "../services/updateProfileService.js";
import { assertAccess } from "../middleware/access.js";

export async function updateProfileHandler(req, res) {
  try {
    const { uid } = req.params;
    // a profile can only be edited by its owner (or a super-admin)
    await assertAccess(req.user, uid, { allowSubusers: false });
    const result = await updateProfile(uid, req.body || {});
    // never hand the password hash back to the browser
    const { password: _password, ...safe } = result || {};
    res.status(200).json(safe);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}
