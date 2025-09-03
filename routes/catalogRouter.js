import express from "express";
import IndulgenceCategory from "../models/IndulgenceCategory.js";
import IndulgenceItem from "../models/IndulgenceItem.js";
import { StatusCodes } from "http-status-codes";

export const allowancesRouter = express.Router();

allowancesRouter.get("/indulgences", async (req, res) => {
  const [cats, items] = await Promise.all([
    IndulgenceCategory.find({ active: true }).sort({ sort: 1 }),
    IndulgenceItem.find({ active: true }),
  ]);

  // group items by category for easy rendering
  const itemsByCat = Object.fromEntries(
    cats.map((c) => [c._id.toString(), []])
  );
  items.forEach((i) => itemsByCat[i.categoryId.toString()]?.push(i));

  const grouped = cats.map((c) => ({
    _id: c._id,
    key: c.key,
    name: c.name,
    emoji: c.emoji,
    color: c.color,
    items: itemsByCat[c._id.toString()] || [],
  }));

  res.status(StatusCodes.OK).json({ categories: grouped });
});
