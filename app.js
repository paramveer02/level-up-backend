import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import { authRouter } from "./routes/authRouter.js";
import { userRouter } from "./routes/userRouter.js";
import aiRouter from "./routes/aiRouter.js";
import { allowancesRouter } from "./routes/catalogRouter.js";
import { planRouter } from "./routes/planRouter.js";

// Import models to ensure they're registered with Mongoose
import "./models/User.js";
import "./models/HealthActItem.js";
import "./models/IndulgenceItem.js";
import "./models/IndulgenceCategory.js";
import "./models/HealthTrackingPlan.js";

export const app = express();
app.set("trust proxy", 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://balance-frontend.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by cors"));
    },
    credentials: true,
  })
);

// security headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// middlewares
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Healthcheck
app.get("/health", (_, res) => res.status(200).send("ok"));

// routes
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/allowances", allowancesRouter);
app.use("/api/v1/plan", planRouter);

// error handler
app.use(notFound);
app.use(errorHandler);
