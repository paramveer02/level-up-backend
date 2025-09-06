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
    required: false, // Made optional for AI-generated acts
  },
  // Fields for AI-generated health acts
  name: {
    type: String,
    required: function() {
      return !this.healthActId; // Required only if healthActId is not provided
    },
  },
  emoji: String,
  category: String,
  weight: {
    type: Number,
    min: 1,
    max: 5,
  },
  relatedIndulgenceKey: String,
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
          required: false, // Made optional for frontend indulgences
        },
        // Fields for frontend indulgences
        name: {
          type: String,
          required: function() {
            return !this.indulgenceId; // Required only if indulgenceId is not provided
          },
        },
        emoji: String,
        category: String,
        weight: Number,
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
