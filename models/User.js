import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
  passwordResetToken: { type: String, index: true },
  passwordResetExpiry: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  hashedPassword
) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTissuedAt) {
  if (!this.passwordChangedAt) return false;

  const passwordChangedAtTimestamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10
  );

  return JWTissuedAt < passwordChangedAtTimestamp;
};

userSchema.methods.createPasswordResetToken = function () {
  // create temp reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // hash the reset token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // store an expiry for 10 minutes from now
  this.passwordResetExpiry = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;
