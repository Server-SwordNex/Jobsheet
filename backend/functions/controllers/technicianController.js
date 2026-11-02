import {
  getAllTechnicians,
  getTechnicianById,
  getTechniciansByUser,
  getTechnicianWithJobsheets,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  assignJobsheetToTechnician,
} from "../services/technicianService.js";

export async function getTechnicians(req, res) {
  try {
    const technicians = await getAllTechnicians();
    res.status(200).json(technicians);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function getTechniciansByUserHandler(req, res) {
  try {
    const technicians = await getTechniciansByUser(req.params.uid);
    res.status(200).json(technicians);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function getTechnician(req, res) {
  try {
    const technician = await getTechnicianById(req.params.id);
    res.status(200).json(technician);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function getTechnicianWithJobsHandler(req, res) {
  try {
    const technician = await getTechnicianWithJobsheets(req.params.id);
    res.status(200).json(technician);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function addTechnician(req, res) {
  try {
    const technician = await createTechnician(req.body);
    res.status(201).json(technician);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function editTechnician(req, res) {
  try {
    const technician = await updateTechnician(req.params.id, req.body);
    res.status(200).json(technician);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function removeTechnician(req, res) {
  try {
    const result = await deleteTechnician(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function assignTechnicianJobsheetHandler(req, res) {
  try {
    const { technicianId } = req.params;
    const { jobsheetId, jobsheetNo } = req.body;
    const result = await assignJobsheetToTechnician(technicianId, jobsheetId, jobsheetNo);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}
