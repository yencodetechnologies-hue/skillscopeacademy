require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const AssessmentUser = require("../models/AssessmentUser");

const EMAIL = "test@gmal.com";
const PASSWORD = "123456";

(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 25000,
  });

  let user = await AssessmentUser.findOne({ email: EMAIL });
  if (user) {
    user.password = PASSWORD;
    await user.save();
    console.log("Updated existing AssessmentUser:", EMAIL);
  } else {
    user = await AssessmentUser.create({ email: EMAIL, password: PASSWORD });
    console.log("Created AssessmentUser:", EMAIL);
  }

  const ok = await user.comparePassword(PASSWORD);
  console.log({
    id: String(user._id),
    email: user.email,
    passwordMatches: ok,
  });

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
