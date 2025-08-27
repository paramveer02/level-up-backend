import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in .env");
}

// initialise GoogleGeAI object, use globally
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
