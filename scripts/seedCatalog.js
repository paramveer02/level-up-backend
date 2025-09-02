import dotenv from "dotenv";
import mongoose from "mongoose";
import IndulgenceCategory from "../models/IndulgenceCategory.js";
import IndulgenceItem from "../models/IndulgenceItem.js";

dotenv.config();

async function main() {
  await mongoose.connect(process.env.DB_URI);

  const cats = [
    {
      key: "food_drink",
      name: "Food & Drink",
      sort: 1,
    },
    {
      key: "screen_tech",
      name: "Screen & Tech",
      color: "#3b82f6",
      sort: 2,
    },
    { key: "sleep", name: "Sleep", emoji: "😴", color: "#8b5cf6", sort: 3 },
    {
      key: "social_party",
      name: "Social/Party",
      emoji: "🎉",
      color: "#f59e0b",
      sort: 4,
    },
    {
      key: "sedentary",
      name: "Sedentary",
      emoji: "🪑",
      color: "#10b981",
      sort: 5,
    },
  ];

  const items = [
    // Food & Drink
    {
      key: "fast_food",
      name: "Fast food meals",
      emoji: "📱",
      category: "food_drink",
      defaultWeight: 4,
      frequency: 5,
    },
    {
      key: "sugary_drinks",
      name: "Sugary drinks / sodas",
      category: "food_drink",
      emoji: "📱",
      defaultWeight: 3,
    },
    {
      key: "desserts",
      name: "Desserts & sweets",
      category: "food_drink",
      emoji: "📱",
      defaultWeight: 3,
    },
    {
      key: "alcohol_night",
      name: "Alcohol at night",
      category: "food_drink",
      emoji: "📱",
      defaultWeight: 4,
    },

    // Screen & Tech
    {
      key: "late_night_screen",
      name: "Late-night screen time",
      category: "screen_tech",
      defaultWeight: 3,
    },
    {
      key: "doomscroll",
      name: "Doomscrolling",
      category: "screen_tech",
      defaultWeight: 3,
    },
    {
      key: "gaming_binge",
      name: "Gaming binge",
      category: "screen_tech",
      defaultWeight: 3,
    },

    // Sleep
    {
      key: "bed_after_midnight",
      name: "Bed after midnight",
      category: "sleep",
      defaultWeight: 4,
    },
    {
      key: "no_wind_down",
      name: "No wind-down routine",
      category: "sleep",
      defaultWeight: 2,
    },

    // Social & Party
    {
      key: "party_night",
      name: "Party night",
      category: "social_party",
      defaultWeight: 4,
    },
    {
      key: "heavy_drinking",
      name: "Heavy drinking",
      category: "social_party",
      defaultWeight: 5,
    },

    // Sedentary
    {
      key: "skip_workout",
      name: "Skip workout",
      category: "sedentary",
      defaultWeight: 4,
    },
    {
      key: "sit_8h_plus",
      name: "Sit > 8h",
      category: "sedentary",
      defaultWeight: 3,
    },
  ];

  // clear database collections
  await IndulgenceCategory.deleteMany();
  await IndulgenceItem.deleteMany();

  const savedCats = await IndulgenceCategory.insertMany(cats);
  const idByKey = Object.fromEntries(savedCats.map((c) => [c.key, c._id])); // returns object with key value pairs

  await IndulgenceItem.insertMany(
    items.map((i) => ({ ...i, categoryId: idByKey[i.category] }))
  );

  console.log("Catalog Seeded");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
