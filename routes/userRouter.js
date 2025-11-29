import express from "express";
import { authenticate, restrict } from "../middlewares/authenticate.js";
import {
  getAllUsers,
  getCurrentUser,
  makeAdmin,
  updateProfileImage,
} from "../controllers/userController.js";
import { uploadProfileImage } from "../middlewares/upload.js";

export const userRouter = express.Router();

userRouter.use(authenticate);

userRouter.get("/current-user", getCurrentUser);

// Profile image upload route
userRouter.patch(
  "/profile-image",
  uploadProfileImage.single("profileImage"),
  updateProfileImage
);

// admin routes
userRouter.get("/:id/admin", restrict("admin"), makeAdmin);
userRouter.get("/", restrict("admin"), getAllUsers);
