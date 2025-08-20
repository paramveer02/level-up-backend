import express from "express";
import { authenticate, restrict } from "../middlewares/authenticate.js";
import { getAllUsers, makeAdmin } from "../controllers/userController.js";

export const userRouter = express.Router();

userRouter.use(authenticate);

userRouter.get("/:id/admin", restrict("admin"), makeAdmin);
userRouter.get("/", restrict("admin"), getAllUsers);
