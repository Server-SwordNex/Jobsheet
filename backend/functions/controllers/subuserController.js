import { createSubuser, deleteSubuser, getSubusers } from "../services/subuserService.js";

export async function createSubuserHandler(req, res) {
  try {
    const { parentUid } = req.params;
    const result = await createSubuser(parentUid, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function deleteSubuserHandler(req, res) {
  try {
    const { subUserUid } = req.params;
    const result = await deleteSubuser(subUserUid);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function getSubusersHandler(req, res) {
  try {
    const { parentUid } = req.params;
    const result = await getSubusers(parentUid);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}
