import mongoose from "mongoose";
import validator from "validator";

export const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name."],
    trim: true,
  },
  lastName: {
    type: String,
    default: "lastName",
  },
  email: {
    type: String,
    required: [true, "Please provide your email."],
    validate: [validator.isEmail, "Please provide a correct email"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password."],
    minlength: 8,
    select: false,
  },
  city: {
    type: String,
    default: "my city",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  avatar: String,
  avatarPublicId: String,
  passwordChangedAt: Date,
});

const User = mongoose.model("User", userSchema);
export default User;
