import express from "express";
import { login, logout, signup } from "../controllers/authController.js";

export const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/logout", logout);
