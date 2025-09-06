import HealthTrackingPlan from "../models/HealthTrackingPlan.js";
import HealthActItem from "../models/HealthActItem.js";

export const createPlan = async (req, res) => {
  try {
    console.log("Create plan request body:", req.body);
    const { weekStartDate, indulgences, healthActs } = req.body;
    const userId = req.user.id;

    if (
      !userId ||
      !weekStartDate ||
      !Array.isArray(indulgences) ||
      !Array.isArray(healthActs)
    ) {
      return res.status(400).json({ message: "Invalid request format." });
    }

    // Check if user already has an active plan
    const existingPlan = await HealthTrackingPlan.findOne({
      userId,
      completed: false
    });

    if (existingPlan) {
      return res.status(400).json({ 
        message: "You already have an active plan. Please terminate it before creating a new one." 
      });
    }

    // Format healthActs - handle both AI-generated and database health acts
    const formattedHealthActs = healthActs.map((act) => ({
      healthActId: act.healthActId || null, // May be null for AI-generated acts
      name: act.name, // Store the name for AI-generated acts
      emoji: act.emoji,
      category: act.category,
      weight: act.weight,
      relatedIndulgenceKey: act.relatedIndulgenceKey,
      targetFrequency: act.frequency, // Use frequency as target frequency
      checkIns: [],
      isCompleted: false,
    }));

    // Format indulgences - handle both database and frontend indulgences
    const formattedIndulgences = indulgences.map((item) => ({
      indulgenceId: item.indulgenceId || null, // May be null for frontend indulgences
      name: item.name, // Store the name for frontend indulgences
      emoji: item.emoji,
      category: item.category,
      weight: item.weight,
      frequency: item.frequency,
    }));

    // Create the plan
    const plan = await HealthTrackingPlan.create({
      userId,
      weekStartDate,
      indulgences: formattedIndulgences,
      healthActs: formattedHealthActs,
    });

    res.status(201).json({
      success: true,
      message: "Health tracking plan created successfully",
      plan
    });
  } catch (error) {
    console.error("Create plan error:", error);
    res.status(500).json({ message: "Failed to create plan." });
  }
};

// Get user's current active plan
export const getCurrentPlan = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the most recent active plan (not completed)
    const plan = await HealthTrackingPlan.findOne({
      userId,
      completed: false
    }).populate({
      path: 'healthActs.healthActId',
      select: 'name emoji description weight categoryId',
      options: { strictPopulate: false }
    }).sort({ createdAt: -1 }); // Get the most recent plan

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "No active plan found"
      });
    }

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error("Get current plan error:", error);
    res.status(500).json({ message: "Failed to get current plan." });
  }
};

// Get all user plans
export const getUserPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, page = 1 } = req.query;

    const plans = await HealthTrackingPlan.find({ userId })
      .populate('healthActs.healthActId', 'name emoji description weight categoryId')
      .sort({ weekStartDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await HealthTrackingPlan.countDocuments({ userId });

    res.json({
      success: true,
      plans,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get user plans error:", error);
    res.status(500).json({ message: "Failed to get user plans." });
  }
};

// Check in for a health act
export const checkInHealthAct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId, healthActId } = req.params;
    const { date = new Date() } = req.body;

    const plan = await HealthTrackingPlan.findOne({
      _id: planId,
      userId
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    const healthAct = plan.healthActs.find(
      act => act._id.toString() === healthActId
    );

    if (!healthAct) {
      return res.status(404).json({
        success: false,
        message: "Health act not found in this plan"
      });
    }

    // Add check-in
    healthAct.checkIns.push({
      date: new Date(date),
      completed: true
    });

    // Update completion status
    const completedCount = healthAct.checkIns.length;
    healthAct.isCompleted = completedCount >= healthAct.targetFrequency;

    await plan.save();

    res.json({
      success: true,
      message: "Check-in recorded successfully",
      healthAct: {
        healthActId: healthAct.healthActId,
        completedCount,
        targetFrequency: healthAct.targetFrequency,
        isCompleted: healthAct.isCompleted
      }
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ message: "Failed to record check-in." });
  }
};

// Terminate current plan
export const terminatePlan = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the most recent active plan (not completed)
    const plan = await HealthTrackingPlan.findOne({
      userId,
      completed: false
    }).sort({ createdAt: -1 });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "No active plan found to terminate"
      });
    }

    // Mark plan as completed
    plan.completed = true;
    plan.completedAt = new Date();
    await plan.save();

    res.json({
      success: true,
      message: "Plan terminated successfully",
      plan
    });
  } catch (error) {
    console.error("Terminate plan error:", error);
    res.status(500).json({ message: "Failed to terminate plan." });
  }
};

// Get health act progress
export const getHealthActProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId, healthActId } = req.params;

    const plan = await HealthTrackingPlan.findOne({
      _id: planId,
      userId
    }).populate('healthActs.healthActId', 'name emoji description weight categoryId');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    const healthAct = plan.healthActs.find(
      act => act._id.toString() === healthActId
    );

    if (!healthAct) {
      return res.status(404).json({
        success: false,
        message: "Health act not found in this plan"
      });
    }

    res.json({
      success: true,
      healthAct: {
        ...healthAct.toObject(),
        completedCount: healthAct.checkIns.length,
        progressPercentage: Math.round((healthAct.checkIns.length / healthAct.targetFrequency) * 100)
      }
    });
  } catch (error) {
    console.error("Get health act progress error:", error);
    res.status(500).json({ message: "Failed to get health act progress." });
  }
};
