import User from "../models/User.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import {
  BadRequestError,
  UnauthenticatedError,
} from "../errors/customErrors.js";
import { createSendToken } from "../utils/createSendToken.js";
import { StatusCodes } from "http-status-codes";

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
