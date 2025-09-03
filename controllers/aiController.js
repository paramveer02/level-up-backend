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
    const body = req.body || {};
    const input = Array.isArray(body.indulgences)
      ? body.indulgences.slice(0, 12)
      : [];
    const userName = req.user?.name || "Friend";

    // Normalize to a weekly view
    const indulgences = input.map(normalizeIndulgence);

    const prompt = [
      "You are a positive, guilt-free wellness coach.",
      "Create a one-week plan using the user's weekly indulgences.",
      "Return STRICT JSON only (no prose, no markdown fences).",
      '{ "summary": "string", "habitsToAdd": [{ "name": "string", "targetPerWeek": 1, "category": "movement|hydration|mindfulness|nutrition|sleep|connection|mobility|screen" }], "microActions": ["string"], "motivation": "string" }',
      "Rules:",
      "- habitsToAdd must contain 3–5 items.",
      "- Each item: name (<= 40 chars), targetPerWeek = integer 1..14,",
      "- category must be exactly one of: movement, hydration, mindfulness, nutrition, sleep, connection, mobility, screen.",
      "- microActions: 4–6 short, concrete tips.",
      `User name: ${userName}`,
      // 🔧 FIX: use the variable you defined above
      `Indulgences (weekly): ${JSON.stringify(indulgences)}`,
    ].join("\n");

    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const raw = getGoogleText(resp);
    const parsed = JSON.parse(stripFences(raw));

    const plan = {
      summary: String(parsed.summary || ""),
      habitsToAdd: (parsed.habitsToAdd || []).map((h) => ({
        name: String(h?.name || h?.title || "Healthy habit"),
        targetPerWeek: clampInt(
          Number(h?.targetPerWeek ?? h?.frequency ?? 1),
          1,
          14
        ),
        category: String(h?.category || "").toLowerCase(),
      })),
      microActions: Array.isArray(parsed.microActions)
        ? parsed.microActions.map(String)
        : [],
      motivation: String(parsed.motivation || ""),
    };

    return res.status(200).json({
      user: { name: userName },
      indulgences, // normalized input
      plan,
    });
  } catch (err) {
    next(err);
  }
}

/* helpers */
function normalizeIndulgence(i) {
  const category = String(i?.category || "other")
    .toLowerCase()
    .slice(0, 30);
  if (i?.hoursPerDay != null) {
    const hoursPerWeek = clampInt(Number(i.hoursPerDay) * 7, 0, 112);
    return { category, hoursPerWeek };
  }
  const timesPerWeek = clampInt(Number(i?.timesPerWeek || 0), 0, 21);
  return { category, timesPerWeek };
}
function clampInt(n, min, max) {
  n = Number.isFinite(n) ? Math.round(n) : 0;
  return Math.max(min, Math.min(max, n));
}
