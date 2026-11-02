import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  createOrUpdateSubUserPrice,
  getSubUserPrice,
} from "../services/pricingPlanService.js";

export async function getPlans(req, res) {
  try {
    const plans = await getAllPlans();
    res.status(200).json(plans);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function getPlan(req, res) {
  try {
    const plan = await getPlanById(req.params.id);
    res.status(200).json(plan);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function addPlan(req, res) {
  try {
    const plan = await createPlan(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function editPlan(req, res) {
  try {
    const plan = await updatePlan(req.params.id, req.body);
    res.status(200).json(plan);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function removePlan(req, res) {
  try {
    const result = await deletePlan(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function updateSubUserPrice(req, res) {
  try {
    const { pricePerSubUser } = req.body;
    if (pricePerSubUser == null || isNaN(Number(pricePerSubUser))) {
      return res.status(400).json({ error: "pricePerSubUser is required and must be a number" });
    }
    const result = await createOrUpdateSubUserPrice(Number(pricePerSubUser));
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message || "Internal server error" });
  }
}

export async function getSubUserPriceHandler(req, res) {
  try {
    const price = await getSubUserPrice();
    res.status(200).json({ success: true, data: price });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message || "Internal server error" });
  }
}
