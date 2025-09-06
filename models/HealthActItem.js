import mongoose from "mongoose";
import { setHealthActItemCompleted } from "../middlewares/healthActCompleted.js";

const checkInSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  completed: { type: Boolean, default: true },
});

const healthActItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    emoji: String,
    description: String,

    // Association to IndulgenceCategory and related IndulgenceItem
    categoryId: {
      type: mongoose.Types.ObjectId,
      ref: "IndulgenceCategory",
    },
    relatedIndulgenceKey: String,

    // How many times the user is supposed to do per week
    frequency: {
      type: Number,
      required: true,
      min: 1,
    },

    // Check-in log: array of { date, completed }
    checkIns: [checkInSchema],

    //Calculate completion
    isCompleted: {
      type: Boolean,
      default: false,
    },

    // Health value: how strong the positive effect is
    weight: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Pre-save hook to auto-update `isCompleted`
healthActItemSchema.pre("save", setHealthActItemCompleted);

const HealthActItem = mongoose.model("HealthActItem", healthActItemSchema);
export default HealthActItem;
