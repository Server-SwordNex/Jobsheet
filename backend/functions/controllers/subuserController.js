import { createSubuser, deleteSubuser, getSubusers } from "../services/subuserService.js";
import { subUsersCollection } from "../config/dbCollection.js";
import { assertAdminOf } from "../middleware/access.js";

const sendError = (res, error) =>
  res.status(error.status || 500).json({ error: error.message || "Internal server error" });

export async function createSubuserHandler(req, res) {
  try {
    const { parentUid } = req.params;
    assertAdminOf(req.user, parentUid);
    const result = await createSubuser(parentUid, req.body || {});
    res.status(201).json(result);
  } catch (error) {
    sendError(res, error);
  }
}

export async function deleteSubuserHandler(req, res) {
  try {
    const { subUserUid } = req.params;

    const snap = await subUsersCollection.doc(String(subUserUid)).get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Subuser not found" });
    }
    assertAdminOf(req.user, snap.data().parentUserId);

    const result = await deleteSubuser(subUserUid);
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getSubusersHandler(req, res) {
  try {
    const { parentUid } = req.params;
    assertAdminOf(req.user, parentUid);
    const result = await getSubusers(parentUid);
    res.status(200).json(result);
  } catch (error) {
    sendError(res, error);
  }
}
