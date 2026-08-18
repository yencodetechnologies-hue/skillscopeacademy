/**
 * Remove a student login from the assessment portal.
 *
 * Usage:
 *   node scripts/removeAssessmentStudent.js
 *   node scripts/removeAssessmentStudent.js student@test.com
 */
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const AssessmentStudent = require("../models/AssessmentStudent");

const EMAIL = process.argv[2] || process.env.STUDENT_EMAIL || "student@test.com";

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 25000 });

  const result = await AssessmentStudent.deleteOne({ email: EMAIL });
  if (result.deletedCount === 0) {
    console.log("No student found with email:", EMAIL);
  } else {
    console.log("Removed student login:", EMAIL);
  }

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
