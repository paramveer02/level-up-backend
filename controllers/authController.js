import User from "../models/User.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from "../errors/customErrors.js";
import { createSendToken } from "../utils/createSendToken.js";
import { StatusCodes } from "http-status-codes";
import { sendMail } from "../utils/sendMail.js";
import crypto from "crypto";

export const signup = asyncWrapper(async function (req, res) {
  const { name, lastName, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new BadRequestError("User already exists");

  const user = await User.create({
    name,
    lastName,
    email,
    password,
    role: "user",
  });

  createSendToken(user, StatusCodes.CREATED, res);
});

export const login = asyncWrapper(async function (req, res) {
  const { email, password } = req.body;

  // check if user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new UnauthenticatedError("Please check your credentials");
  }

  createSendToken(user, StatusCodes.OK, res);
});

export const logout = asyncWrapper(async function (req, res) {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "lax",
    secure: false,
  });
  res.status(StatusCodes.OK).json({ message: "User logged out" });
});

export const forgotPassword = asyncWrapper(async function (req, res) {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("User not found");

  // create temporary reset token for the user
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // create reset URL
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and confirmPassword to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendMail({
      email: user.email,
      subject: "Your password reset token (valid for 10 mins)",
      message,
    });
    res.status(200).json({ status: "success", message: "Token sent to email" });
  } catch (error) {
    // if mail send fails
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      status: "fail",
      message: "There was an error sending the email. Try again later!",
    });
  }
});

export const resetPassword = asyncWrapper(async function (req, res) {
  // get token from the reset link
  const resetToken = req.params.token;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400).json({
      status: "fail",
      message: "Token is invalid or has expired",
    });
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  await user.save();

  createSendToken(user, StatusCodes.CREATED, res);
});
