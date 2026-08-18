/**
 * Create or update an assessor login for the Student Assessment portal.
 *
 * Usage:
 *   node scripts/seedAssessmentUser.js
 *   ASSESSOR_EMAIL=you@example.com ASSESSOR_PASSWORD=secret node scripts/seedAssessmentUser.js
 */
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const AssessmentUser = require("../models/AssessmentUser");

const EMAIL = process.env.ASSESSOR_EMAIL || "assessor@skillscopeacademy.com";
const PASSWORD = process.env.ASSESSOR_PASSWORD || "123456";

(async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 25000,
  });

  let user = await AssessmentUser.findOne({ email: EMAIL });
  if (user) {
    user.password = PASSWORD;
    await user.save();
    console.log("Updated assessor login:", EMAIL);
  } else {
    user = await AssessmentUser.create({ email: EMAIL, password: PASSWORD });
    console.log("Created assessor login:", EMAIL);
  }

  const ok = await user.comparePassword(PASSWORD);
  console.log({ id: String(user._id), email: user.email, passwordMatches: ok });
  console.log("Login at: /studentassement/login");

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
