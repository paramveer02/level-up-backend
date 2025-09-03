import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { createPlan } from "../controllers/planController.js";

export const planRouter = express.Router();

planRouter.post("/create", authenticate, createPlan);
