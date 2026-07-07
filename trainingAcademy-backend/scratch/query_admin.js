require("dns").setServers(["8.8.8.8"]);
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Company = require("../models/Company");
const StudentMain = require("../models/student_main");

async function checkAdmin() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not defined in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB!");

    const email = "info@safetytrainingacademy.edu.au";
    const inputPassword = "Safety45234@";

    // 1. Check in User
    const user = await User.findOne({ email });
    console.log("User table query results:");
    if (user) {
      console.log(`Found User: ID=${user._id}, Name=${user.name}, Email=${user.email}, Role=${user.role}`);
      const isMatch = await bcrypt.compare(inputPassword, user.password);
      console.log(`Password match in User table: ${isMatch}`);
    } else {
      console.log("User NOT found in User table.");
    }

    // 2. Check in Company
    const company = await Company.findOne({ email });
    console.log("\nCompany table query results:");
    if (company) {
      console.log(`Found Company: ID=${company._id}, Name=${company.companyName}, Email=${company.email}, Role=${company.role}`);
      const isMatch = await bcrypt.compare(inputPassword, company.password);
      console.log(`Password match in Company table: ${isMatch}`);
    } else {
      console.log("User NOT found in Company table.");
    }

    // 3. Check in StudentMain
    const student = await StudentMain.findOne({ email });
    console.log("\nStudentMain table query results:");
    if (student) {
      console.log(`Found Student: ID=${student._id}, Name=${student.name}, Email=${student.email}`);
      const isMatch = await bcrypt.compare(inputPassword, student.password);
      console.log(`Password match in StudentMain table: ${isMatch}`);
    } else {
      console.log("User NOT found in StudentMain table.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkAdmin();
