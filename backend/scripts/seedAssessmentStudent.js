/**
 * Create or update a dummy student login for the assessment portal.
 *
 * Usage:
 *   node scripts/seedAssessmentStudent.js
 *   STUDENT_EMAIL=... STUDENT_PASSWORD=... STUDENT_NAME=... STUDENT_ID=... node scripts/seedAssessmentStudent.js
 */
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const AssessmentStudent = require("../models/AssessmentStudent");

const EMAIL = process.env.STUDENT_EMAIL || "student@test.com";
const PASSWORD = process.env.STUDENT_PASSWORD || "123456";
const NAME = process.env.STUDENT_NAME || "Test Student";
const STUDENT_ID = process.env.STUDENT_ID || "STU001";

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 25000 });

  let student = await AssessmentStudent.findOne({ email: EMAIL });
  if (student) {
    student.password = PASSWORD;
    student.name = NAME;
    student.student_id = STUDENT_ID;
    await student.save();
    console.log("Updated student login:", EMAIL);
  } else {
    student = await AssessmentStudent.create({
      email: EMAIL,
      password: PASSWORD,
      name: NAME,
      student_id: STUDENT_ID,
    });
    console.log("Created student login:", EMAIL);
  }

  console.log({
    id: String(student._id),
    email: student.email,
    name: student.name,
    student_id: student.student_id,
    loginUrl: "/studentassement/student-login",
  });

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
