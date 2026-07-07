/**
 * One-time patch: Operate elevating work platform (RIIHAN301E) → SL/BL pricing.
 * Run from trainingAcademy-backend: node scripts/patchEwpSlblPricing.js
 */
const mongoose = require("mongoose");
const Course = require("../models/Course");
require("dotenv").config();

const SLUG = "operate-elevating-work-platforms-syd";
const COURSE_CODE = "RIIHAN301E";

async function patchEwpSlblPricing() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const course = await Course.findOne({
    $or: [
      { slug: SLUG },
      { courseCode: new RegExp(`^${COURSE_CODE.trim()}\\s*$`, "i") },
    ],
  });

  if (!course) {
    console.error(
      `Course not found (slug: ${SLUG} or courseCode: ${COURSE_CODE}). Update via Admin instead.`
    );
    process.exit(1);
  }

  course.pricingType = "slbl";
  course.slSinglePrice = course.slSinglePrice ?? 220;
  course.slSingleStrikePrice = course.slSingleStrikePrice ?? 250;
  course.slblPrice = course.slblPrice ?? 290;
  course.slblStrikePrice = course.slblStrikePrice ?? 330;
  course.experienceBasedBooking = false;

  await course.save();

  console.log("Patched course:", {
    _id: course._id,
    title: course.title,
    slug: course.slug,
    pricingType: course.pricingType,
    slSinglePrice: course.slSinglePrice,
    slblPrice: course.slblPrice,
  });

  process.exit(0);
}

patchEwpSlblPricing().catch((err) => {
  console.error(err);
  process.exit(1);
});
