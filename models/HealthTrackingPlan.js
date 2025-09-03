import mongoose from "mongoose";
import { setPlanCompleted } from "../middlewares/healthTrackingPlanCompleted.js";

const checkInSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  completed: { type: Boolean, default: true },
});

const healthActTrackingSchema = new mongoose.Schema({
  healthActId: {
    type: mongoose.Types.ObjectId,
    ref: "HealthActItem",
    required: true,
  },
  targetFrequency: {
    type: Number,
    required: true,
    min: 1,
  },
  checkIns: [checkInSchema],
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const healthTrackingPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    indulgences: [
      {
        indulgenceId: {
          type: mongoose.Types.ObjectId,
          ref: "IndulgenceItem",
        },
        frequency: Number,
      },
    ],
    healthActs: [healthActTrackingSchema],
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-check if the plan is completed
healthTrackingPlanSchema.pre("save", setPlanCompleted);

const HealthTrackingPlan = mongoose.model(
  "HealthTrackingPlan",
  healthTrackingPlanSchema
);

export default HealthTrackingPlan;
