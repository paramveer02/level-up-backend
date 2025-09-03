import mongoose from "mongoose";

const ActSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  category: {
    type: String,
    enum: [
      "movement",
      "hydration",
      "mindfulness",
      "nutrition",
      "sleep",
      "connection",
      "mobility",
      "screen",
    ],
    default: "movement",
  },
  imageKey: { type: String }, // optional – can mirror category or a custom key
  target: { type: Number, min: 1, max: 14, required: true },
  done: { type: Number, default: 0 },
  history: [{ type: Date }],
});

const WeeklyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    weekStart: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED"],
      default: "ACTIVE",
      index: true,
    },
    summary: String,
    microActions: [String],
    motivation: String,
    acts: [ActSchema],
  },
  { timestamps: true }
);

export default mongoose.model("WeeklyPlan", WeeklyPlanSchema);
