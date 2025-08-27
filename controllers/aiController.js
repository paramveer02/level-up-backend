// controllers/aiController.js
import { ai } from "../utils/aiClient.js";
import { getGoogleText, stripFences } from "../helpers/googleText.js";

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

    const prompt = [
      "You are a positive, guilt-free wellness coach.",
      "Return STRICT JSON with keys: summary, habitsToAdd[], microActions[], motivation.",
      `User name: ${userName}`,
      `Indulgences: ${JSON.stringify(clean)}`,
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
