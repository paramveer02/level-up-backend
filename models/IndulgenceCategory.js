import mongoose from "mongoose";

const indulgenceCategorySchema = new mongoose.Schema(
  {
    key: { type: String, unique: true }, // fast_food
    name: { type: String, required: true }, // Food & Drinks
    sort: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const IndulgenceCategory = mongoose.model(
  "IndulgenceCategory",
  indulgenceCategorySchema
);

export default IndulgenceCategory;
