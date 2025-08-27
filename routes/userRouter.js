import express from "express";
import { authenticate, restrict } from "../middlewares/authenticate.js";
import {
  getAllUsers,
  getCurrentUser,
  makeAdmin,
} from "../controllers/userController.js";

export const userRouter = express.Router();

userRouter.use(authenticate);

userRouter.get("/current-user", getCurrentUser);

// admin routes
userRouter.get("/:id/admin", restrict("admin"), makeAdmin);
userRouter.get("/", restrict("admin"), getAllUsers);
