import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";

// restricted route
export const getAllUsers = asyncWrapper(async function (req, res) {
  const users = await User.find();
  res
    .status(StatusCodes.OK)
    .json({ status: "success", results: users.length, data: { users } });
});

export const makeAdmin = asyncWrapper(async function (req, res) {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User not found");
  user.role = "admin";
  await user.save();

  res.status(StatusCodes.OK).json({ status: "success", data: { user } });
});

export const getCurrentUser = asyncWrapper(async function (req, res) {
  const user = await User.findById(req.user.id);
  res.status(StatusCodes.OK).json({ status: "success", user });
});
