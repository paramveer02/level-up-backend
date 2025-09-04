import WeeklyPlan from "../models/WeeklyPlan.js";

const mondayStartUTC = (d = new Date()) => {
  const x = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
  const day = x.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  x.setUTCDate(x.getUTCDate() + diff);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

// ⛳ include category & imageKey so Dashboard can render correct chip/image
const shapePlan = (doc) => ({
  id: doc._id.toString(),
  weekStart: doc.weekStart,
  summary: doc.summary,
  microActions: doc.microActions,
  motivation: doc.motivation,
  acts: doc.acts.map((a) => ({
    id: a._id.toString(),
    name: a.name,
    category: a.category, // <--
    imageKey: a.imageKey, // <--
    target: a.target,
    done: a.done,
  })),
});

const clamp = (n, min, max) =>
  Math.max(min, Math.min(max, Math.round(Number(n) || 0)));

export const createOrActivatePlan = async (req, res) => {
  const userId = req.user.id;
  const weekStart = mondayStartUTC();

  const p = req.body?.plan || {};
  const habits = Array.isArray(p.habitsToAdd) ? p.habitsToAdd : [];

  const acts = habits.map((h) => ({
    name: String(h.name || "Healthy act").slice(0, 80),
    category: String(h.category || "movement").toLowerCase(),
    imageKey: h.imageKey || h.category || undefined,
    target: clamp(h.targetPerWeek, 1, 14),
    done: 0,
    history: [],
  }));

  const planDoc = await WeeklyPlan.findOneAndUpdate(
    { userId, weekStart },
    {
      userId,
      weekStart,
      status: "ACTIVE",
      summary: p.summary || "",
      microActions: p.microActions || [],
      motivation: p.motivation || "",
      acts,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await WeeklyPlan.updateMany(
    { userId, _id: { $ne: planDoc._id }, status: "ACTIVE" },
    { $set: { status: "COMPLETED" } }
  );

  res.json({ plan: shapePlan(planDoc) });
};

export const getActivePlan = async (req, res) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    Vary: "Cookie",
  });

  const userId = req.user.id;
  const weekStart = mondayStartUTC();

  let planDoc = await WeeklyPlan.findOne({ userId, weekStart });
  if (!planDoc) {
    planDoc = await WeeklyPlan.findOne({ userId, status: "ACTIVE" }).sort({
      weekStart: -1,
    });
  }
  if (!planDoc) return res.json({ plan: null });

  res.json({ plan: shapePlan(planDoc) });
};

export const getActiveAct = async (req, res) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    Vary: "Cookie",
  });

  const userId = req.user.id;
  console.log(`userId: ${userId}`);
  const planDoc = await WeeklyPlan.findOne({ userId, status: "ACTIVE" }).sort({
    weekStart: -1,
  });
  if (!planDoc) return res.status(404).json({ message: "No active plan" });

  const act = planDoc.acts.id(req.params.actId);
  if (!act) return res.status(404).json({ message: "Act not found" });

  res.json({
    planId: planDoc._id,
    act: {
      id: act._id,
      name: act.name,
      category: act.category,
      imageKey: act.imageKey,
      target: act.target,
      done: act.done,
      history: act.history,
    },
  });
};

export const checkIn = async (req, res) => {
  const userId = req.user.id;
  console.log(userId);
  const { planId, actId } = req.params;

  const snap = await WeeklyPlan.findOne(
    { _id: planId, userId, "acts._id": actId },
    { "acts.$": 1 }
  );
  if (!snap) return res.status(404).json({ message: "Plan or act not found" });

  const act = snap.acts[0];
  if (!act) return res.status(404).json({ message: "Act not found" });
  if (act.done >= act.target) {
    return res
      .status(200)
      .json({ done: act.done, target: act.target, message: "Target reached" });
  }

  await WeeklyPlan.updateOne(
    { _id: planId, userId, "acts._id": actId },
    { $inc: { "acts.$.done": 1 }, $push: { "acts.$.history": new Date() } }
  );

  res.status(201).json({ done: act.done + 1, target: act.target });
};
