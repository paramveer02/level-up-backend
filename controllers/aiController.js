// controllers/aiController.js
import { ai } from "../utils/aiClient.js";
import { getGoogleText, stripFences } from "../helpers/googleText.js";
import { habitBase } from "../utils/habitBase.js";

export async function aiPing(req, res, next) {
  try {
    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: 'Reply with "pong" only and add some humor to it' }],
        },
      ],
    });
    return res.status(200).json({ ok: true, text: getGoogleText(resp) });
  } catch (err) {
    next(err);
  }
}

export async function aiPlan(req, res, next) {
  try {
    const { indulgences = [] } = req.body || {};

    const clean = indulgences.slice(0, 6).map((i) => ({
      category: String(i?.category || "other")
        .toLowerCase()
        .slice(0, 20),
      timesPerWeek: Math.max(0, Math.min(14, Number(i?.timesPerWeek) || 0)),
    }));

    const userName = req.user?.name || "Friend";
    const habitBase = [
      {
        name: "30-min Cardio Workout",
        frequency: { times: 3, period: "week" },
        category: "exercise",
        weight: 8,
        xp: 10,
      },
      {
        name: "30-min Strength Training",
        frequency: { times: 2, period: "week" },
        category: "exercise",
        weight: 9,
        xp: 20,
      },
      {
        name: "Cooked Healthy Meal",
        frequency: { times: 4, period: "week" },
        category: "food",
        weight: 5,
        xp: 5,
      },
      {
        name: "Walk 20 mins After Dinner",
        frequency: { times: 3, period: "week" },
        category: "exercise",
        weight: 3,
        xp: 10,
      },
      {
        name: "7+ Hours of Sleep",
        frequency: { times: 5, period: "week" },
        category: "sleep",
        weight: 2,
        xp: 10,
      },
      {
        name: "No Screens 60 min Before Bed",
        frequency: { times: 3, period: "week" },
        category: "sleep",
        weight: 2,
        xp: 10,
      },
      {
        name: "10-min Mobility/Stretch",
        frequency: { times: 3, period: "week" },
        category: "mobility",
        weight: 2,
        xp: 10,
      },
      {
        name: "2L Water Intake",
        frequency: { times: 5, period: "week" },
        category: "hydration",
        weight: 1,
        xp: 10,
      },
      {
        name: "10-min Mindfulness/Meditation",
        frequency: { times: 2, period: "week" },
        category: "mental",
        weight: 1,
        xp: 10,
      },
      {
        name: "High-Protein Breakfast",
        frequency: { times: 0, period: "week" },
        category: "food",
        weight: 2,
      },
      {
        name: "Add One Fruit Serving",
        frequency: { times: 0, period: "week" },
        category: "food",
        weight: 1,
      },
      {
        name: "Add One Veg Serving",
        frequency: { times: 0, period: "week" },
        category: "food",
        weight: 1,
      },
      {
        name: "15-min Sunlight Exposure",
        frequency: { times: 0, period: "week" },
        category: "sunlight",
        weight: 2,
      },
      {
        name: "Posture Breaks (2×/day)",
        frequency: { times: 0, period: "week" },
        category: "mobility",
        weight: 1,
      },
      {
        name: "Alcohol-Free Social Night",
        frequency: { times: 0, period: "week" },
        category: "social",
        weight: 3,
      },
      {
        name: "Take the Stairs",
        frequency: { times: 0, period: "week" },
        category: "exercise",
        weight: 1,
      },
      {
        name: "Meal Prep Two Lunches",
        frequency: { times: 0, period: "week" },
        category: "food",
        weight: 4,
      },
      {
        name: "Extra 5k Steps Day",
        frequency: { times: 0, period: "week" },
        category: "exercise",
        weight: 3,
      },
      {
        name: "5-min Gratitude Journal",
        frequency: { times: 0, period: "week" },
        category: "mental",
        weight: 1,
      },
      {
        name: "2-min Cold Shower",
        frequency: { times: 0, period: "week" },
        category: "recovery",
        weight: 1,
      },
    ];
    const prompt = [
      "You are a positive, guilt-free wellness coach.",
      "Return STRICT JSON with keys: summary, selectedHabits[], microActions[], motivation.",
      `User name: ${userName}`,
      `Create a personalized weekly wellness plan with 5 habbits selected from the ${habitBase} and saved in selectedHabits[]. The habits should be based on the user's indulgences and the base habits.`,
      `Indulgences: ${JSON.stringify(clean)}`,
      `Base habits: ${JSON.stringify(habitBase)}`,
      "The plan should be realistic, achievable, and guilt-free.",
    ].join("\n");

    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const raw = getGoogleText(resp); // JSON string
    const plan = JSON.parse(stripFences(raw)); // parse to object

    return res
      .status(200)
      .json({ user: { name: userName }, indulgences: clean, plan });
  } catch (err) {
    next(err);
  }
}
export async function aiCalculate(req, res, next) {
  try {
    const weeklyAllowances = req.body || {};

    const allowanceSheet = weeklyAllowances.map((i) => ({
      name: String(i?.name || "other")
        .toLowerCase()
        .slice(0, 20),
      category: String(i?.category || "other")
        .toLowerCase()
        .slice(0, 20),
      frequency: Math.max(0, Math.min(14, Number(i?.frequency) || 0)),
      weight: Math.min(-1, Math.max(-5, -Math.abs(Number(i?.weight) || -1))),
    }));

    const userName = req.user?.name || "Friend";
    //Calculate TNW
    const TNW = allowanceSheet.reduce(
      (sum, item) => sum + item.frequency * Math.abs(item.weight),
      0
    );
    const maxTPW = TNW * 1.25;
    // AI generates a pool of suggestions.
    const prompt = [
      `You are a health balancing assistant for a wellness app. The user is trying to balance out some unhealthy weekly habits, which are provided below as a list of allowances.`,
      `Your task is to review the provided list of unhealthy allowances and suggest 10 realistic, guilt-free healthy habits that could help balance them out.`,
      `For each of the 5 healthy habits you suggest, you must provide a recommended weekly frequency. Make the frequencies realistic and achievable, generally between 1 and 3 times per week. Try to suggest habit frequencies that are similar to the frequencies of the unhealthy allowances, but focus on what is practical for most people. Prioritize habits that are easy to integrate into a busy lifestyle. Prioritize exercise, nutrition and hydration habits.`,
      `All suggested habits must be selected from the provided 'habitBase' list.`,
      `Return your response as a strict JSON array of objects. Each object in the array must have the following keys:`,
      `• "name": A string representing the name of the healthy habit.`,
      `• "category": A string representing the category of the habit.`,
      `• "frequency": An integer between 1 and 7, representing the suggested weekly frequency.`,
      `•	"weight" : A positive integer, following the weights defined in the habitBase.`,
      `Add a weekly allowance analysis summary at the start of your response, evaluate the weekly allowances and mention from which aspects the user should work on to balance it out. Keep it really concise and possitive, no more than 50 words. Add some scientific reasoning behind your theory.`,
      `Return your response as a strict JSON object which has the following key:`,
      `"summary": A string with the weekly allowance analysis summary.`,
      `This will be the first object item in your response.`,
      `Do not include any other text, explanations, or code fences in your response.`,
      `User name: ${userName}`,
      `User's weekly allowances: ${JSON.stringify(allowanceSheet)}`,
      `Available healthy habits: ${JSON.stringify(habitBase)}`,
    ].join("\n");

    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const raw = getGoogleText(resp); // JSON string
    const suggestedHabits = JSON.parse(stripFences(raw)); // parse to object
    //Calculate TNW and TPW
    let plan = [];
    let currentTPW = 0;
    //Iterate over suggested habits and add them to the plan until maxTPW is reached
    for (const habit of suggestedHabits) {
      if (currentTPW >= maxTPW) break;
      const habitWeight = habit.frequency * habit.weight || 0;
      if (currentTPW + habitWeight < maxTPW) {
        plan.push(habit);
        currentTPW += habitWeight;
      }
    }
    return res.status(200).json({
      user: { name: userName },
      weeklyAllowances: allowanceSheet,
      TNW,
      plan,
      currentTPW,
    });
  } catch (err) {
    next(err);
  }
}
