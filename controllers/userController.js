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
  
  // Add absolute URL for profile image if it exists
  const userResponse = user.toObject();
  if (userResponse.profileImage) {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    userResponse.profileImageUrl = `${baseUrl}${userResponse.profileImage}`;
  }
  
  res.status(StatusCodes.OK).json({ status: "success", user: userResponse });
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

  // Add absolute URL for immediate frontend use
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const userResponse = user.toObject();
  userResponse.profileImageUrl = `${baseUrl}${profileImagePath}`;

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Profile image updated successfully",
    user: userResponse,
  });
});
