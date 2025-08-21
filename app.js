import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import { authRouter } from "./routes/authRouter.js";
import { authenticate, restrict } from "./middlewares/authenticate.js";
import { userRouter } from "./routes/userRouter.js";
import aiRouter from "./routes/aiRouter.js";

export const app = express();
app.set("trust proxy", 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
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

// Healthcheck
app.get("/health", (_, res) => res.status(200).send("ok"));

// routes
app.use("/ai", aiRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

// error handler
app.use(notFound);
app.use(errorHandler);
