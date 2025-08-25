import { Router } from "express";
import { aiPing, aiPlan, aiCalculate } from "../controllers/aiController.js";
import { authenticate } from "../middlewares/authenticate.js";
// If you want to require login later: import authenticate from '../middlewares/authenticate.js';

const aiRouter = Router();

// public for first test:
aiRouter.get("/ping", aiPing);
aiRouter.post("/plan", authenticate, aiPlan);
aiRouter.post("/calculate", authenticate, aiCalculate);

// later you can protect it with auth:
// r.post('/plan', authenticate, aiPlan);

export default aiRouter;
