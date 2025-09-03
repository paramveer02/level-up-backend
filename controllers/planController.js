import HealthTrackingPlan from "../models/HealthTrackingPlan.js";

export const createPlan = async (req, res) => {
  try {
    console.log("Create plan request body:", req.body);
    const { id, weekStartDate, indulgences, healthActs } = req.body;

    if (
      !userId ||
      !weekStartDate ||
      !Array.isArray(indulgences) ||
      !Array.isArray(healthActs)
    ) {
      return res.status(400).json({ message: "Invalid request format." });
    }

    // Format healthActs
    const formattedHealthActs = healthActs.map((act) => ({
      healthActId: act.healthActId, //the ObjectId of HealthActItem
      frequency: act.frequency,
      emoji: act.emoji,
      relatedIndulgenceKey: act.relatedIndulgenceKey,
      checkIns: [],
      isCompleted: false,
    }));

    // Format indulgences
    const formattedIndulgences = indulgences.map((item) => ({
      indulgenceId: item.indulgenceId, //the ObjectId of IndulgenceItem from DB
      frequency: item.frequency,
      emoji: item.emoji,
    }));

    // Create the plan
    const plan = await HealthTrackingPlan.create({
      id,
      weekStartDate,
      indulgences: formattedIndulgences,
      healthActs: formattedHealthActs,
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error("Create plan error:", error);
    res.status(500).json({ message: "Failed to create plan." });
  }
};
