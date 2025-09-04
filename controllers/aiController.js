// controllers/aiController.js
import { ai } from "../utils/aiClient.js";
import { getGoogleText, stripFences } from "../helpers/googleText.js";
import { habitBase } from "../dev-data/habitBase.js";

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

export async function aiCalculate(req, res, next) {
  try {
    const weeklyAllowances = req.body || {};
    const { strategyId, userPreferences } = req.body;
    const userName = req.user?.name || "Friend";
    const userId = req.user?.id;
    
    // Validate input
    if (!Array.isArray(weeklyAllowances) || weeklyAllowances.length === 0) {
      return res.status(400).json({ 
        message: "Weekly allowances must be a non-empty array" 
      });
    }
    
    //Calculate TNW
    const TNW = weeklyAllowances.reduce(
      (sum, item) => sum + (item.frequency || 0) * Math.abs(item.weight || 1),
      0
    );
    
    // Prevent division by zero and ensure minimum target
    const maxTPW = Math.max(TNW * 1.25, 5); // Minimum 5 points target
    // AI generates a pool of suggestions.
    const prompt = [
      `You are a health balancing assistant for a wellness app. The user is trying to balance out some unhealthy weekly habits, which are provided below as a list of allowances.`,
      `Your task is to review the provided list of unhealthy allowances and suggest 10 realistic, guilt-free healthy habits that could help balance them out.`,
      `For each of the 5 to 7 healthy habits you suggest, you must provide a recommended weekly frequency. Make the frequencies realistic and achievable, generally between 1 and 3 times per week. Try to suggest habit frequencies that are similar to the frequencies of the unhealthy allowances, but focus on what is practical for most people. Prioritize habits that are easy to integrate into a busy lifestyle. Prioritize exercise, nutrition and hydration habits.`,
      `All suggested habits must be selected from the provided 'habitBase' list.`,
      `Return your suggested habits as a strict JSON array of objects. Each object in the array must have the following keys:`,
      `• "name": A string representing the name of the healthy habit.`,
      `• "emoji": An emoji representing the healthy habit,following the emoji defined in the habitBase.`,
      `• "category": A string representing the category of the habit.`,
      `• "frequency": An integer between 1 and 7, representing the suggested weekly frequency.`,
      `•	"weight" : A positive integer, following the weights defined in the habitBase.`,
      `Give this Strict JSON array the key "plan".`,
      `Also give a weekly allowance analysis summary, evaluate the weekly allowances and mention from which aspects the user should work on to balance it out. Keep it really concise and possitive, no more than 50 words. Add some scientific reasoning behind your theory.`,
      `Return all your responses as a strict JSON object which has the following key:`,
      `"summary": A string with the weekly allowance analysis summary.`,
      `"plan": The array of suggested healthy habits with their recommended frequencies.`,
      `Do not include any other text, explanations, or code fences in your response.`,
      `User name: ${userName}`,
      `User's weekly allowances: ${JSON.stringify(weeklyAllowances)}`,
      `Available healthy habits: ${JSON.stringify(habitBase)}`,
    ].join("\n");

    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const raw = getGoogleText(resp); // JSON string
    // console.log("Raw AI Response:", raw);
    const aiRespData = JSON.parse(stripFences(raw)); // parse to object
    // console.log("aiRespData:", aiRespData);
    const suggestedHabits = aiRespData.plan || [];
    const summary = aiRespData.summary || "";
    // console.log("Suggested Habits:", suggestedHabits);

    //Calculate TNW and TPW
    let balanceMoves = [];
    let currentTPW = 0;
    
    //Iterate over suggested habits and add them to the plan until maxTPW is reached
    for (const habit of suggestedHabits) {
      if (currentTPW >= maxTPW) break;
      
      const habitWeight = (habit.frequency || 0) * (habit.weight || 0);
      
      // Include habits that don't exceed the target (changed from < to <=)
      if (currentTPW + habitWeight <= maxTPW) {
        balanceMoves.push(habit);
        currentTPW += habitWeight;
      }
    }
    return res.status(200).json({
      user: { name: userName },
      weeklyAllowances: weeklyAllowances,
      summary,
      TNW,
      balanceMoves,
      currentTPW,
    });
  } catch (err) {
    next(err);
  }
}
