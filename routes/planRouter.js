import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import {
  createPlan,
  getCurrentPlan,
  getUserPlans,
  checkInHealthAct,
  getHealthActProgress,
  terminatePlan
} from "../controllers/planController.js";

export const planRouter = express.Router();

// Plan management routes
planRouter.post("/create", authenticate, createPlan);
planRouter.get("/current", authenticate, getCurrentPlan);
planRouter.get("/", authenticate, getUserPlans);

// Health act check-in routes
planRouter.post("/:planId/health-act/:healthActId/checkin", authenticate, checkInHealthAct);
planRouter.get("/:planId/health-act/:healthActId/progress", authenticate, getHealthActProgress);
planRouter.post("/terminate", authenticate, terminatePlan);
