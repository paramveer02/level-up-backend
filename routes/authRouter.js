import express from "express";
import {
  forgotPassword,
  login,
  logout,
  resetPassword,
  signup,
} from "../controllers/authController.js";

export const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/logout", logout);

authRouter.post("/forgot", forgotPassword);
authRouter.patch("/resetPassword/:token", resetPassword);
