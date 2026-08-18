require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Category = require("../models/Category");

(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 25000,
  });
  const cats = await Category.find().sort("order").select("name courseCount order");
  console.log("Categories:");
  cats.forEach((c) => console.log(`  ${c.order}. ${c.name} (${c.courseCount})`));
  console.log("Courses:", await Course.countDocuments());
  const uncat = await Course.countDocuments({
    $or: [{ category: null }, { category: { $exists: false } }],
  });
  console.log("Uncategorized courses:", uncat);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
