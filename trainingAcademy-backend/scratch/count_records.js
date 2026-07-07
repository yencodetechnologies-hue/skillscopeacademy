require("dns").setServers(["8.8.8.8"]);
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const EnrollmentFlow = require("../models/EnrollmentFlows");
const StudentMain = require("../models/student_main");

async function check() {
  const uri = process.env.MONGO_URI;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to DB");

    const flowCount = await EnrollmentFlow.countDocuments();
    const studentCount = await StudentMain.countDocuments();
    console.log(`EnrollmentFlow count: ${flowCount}`);
    console.log(`StudentMain count: ${studentCount}`);

    console.time("Query execution time");
    const data = await EnrollmentFlow.find({ studentId: { $ne: null } })
      .populate("studentId")
      .sort({ createdAt: -1 })
      .lean();
    console.timeEnd("Query execution time");
    console.log(`Retrieved ${data.length} records`);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

check();
