import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const DB_URI = process.env.DB_URI;
mongoose
  .connect(DB_URI)
  .then(() => console.log("DB Connection Successful"))
  .catch(() => console.log("DB Connection Unsuccessful"));
