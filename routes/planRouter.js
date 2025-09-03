import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js"; 
import {
  createOrActivatePlan,
  getActivePlan,
  getActiveAct,
  checkIn,
} from "../controllers/weeklyPlanController.js";

const planRouter = Router();

planRouter.post("/", authenticate, createOrActivatePlan); // Get Started
planRouter.get("/active", authenticate, getActivePlan); // Dashboard
planRouter.get("/active/act/:actId", authenticate, getActiveAct); // Detail loader
planRouter.post("/:planId/act/:actId/checkin", authenticate, checkIn); // Mark done

export default planRouter;
