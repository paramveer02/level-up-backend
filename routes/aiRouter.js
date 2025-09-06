import { Router } from "express";
import { aiPing, aiCalculate } from "../controllers/aiController.js";
import { authenticate } from "../middlewares/authenticate.js";
// If you want to require login later: import authenticate from '../middlewares/authenticate.js';

const aiRouter = Router();

// public for first test:
aiRouter.get("/ping", aiPing);
aiRouter.post("/calculate", authenticate, aiCalculate);

// All routes are now protected with authentication

export default aiRouter;
