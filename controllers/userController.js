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

export const updateProfileImage = asyncWrapper(async function (req, res) {
  // req.file is provided by multer
  if (!req.file) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "No image file provided",
    });
  }

  // Get user ID from authenticated session
  const userId = req.user.id;

  // Construct the file path/URL to store in database
  const profileImagePath = `/uploads/profiles/${req.file.filename}`;

  // Update user in database
  const user = await User.findByIdAndUpdate(
    userId,
    { profileImage: profileImagePath },
    { new: true, runValidators: true }
  ).select("-password");

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Profile image updated successfully",
    user: user,
  });
});
