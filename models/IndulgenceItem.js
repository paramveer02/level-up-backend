import mongoose from "mongoose";

const indulgenceItemSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  name: { type: String, required: true },
  frequency: { type: Number, default: 0 },
  emoji: String,
  categoryId: {
    type: mongoose.Types.ObjectId,
    ref: "IndulgenceCategory",
    index: true,
  },
  description: String,
  defaultWeight: { type: Number, min: -5, max: -1 },
  active: { type: Boolean, default: true },
});

const IndulgenceItem = mongoose.model("IndulgenceItem", indulgenceItemSchema);
export default IndulgenceItem;
