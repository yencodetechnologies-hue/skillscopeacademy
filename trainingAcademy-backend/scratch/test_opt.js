require("dns").setServers(["8.8.8.8"]);
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const EnrollmentFlow = require("../models/EnrollmentFlows");
const StudentMain = require("../models/student_main");
const Company = require("../models/Company");
const EnrollmentLink = require("../models/EnrollmentLink");
const EnrollmentForm = require("../models/EnrollmentForm");

async function check() {
  const uri = process.env.MONGO_URI;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to DB");

    // Test 1: Original query (No projection)
    console.time("Original Query Time");
    const dataOriginal = await EnrollmentFlow.find({ studentId: { $ne: null } })
      .populate("studentId")
      .sort({ createdAt: -1 })
      .lean();
    console.timeEnd("Original Query Time");

    // Test 2: Optimized query (With projection)
    console.time("Optimized Query Time");
    const dataOptimized = await EnrollmentFlow.find({ studentId: { $ne: null } })
      .select("studentId companyId enrollmentType source sourceToken items llnd.status sessionDate startTime endTime enrollmentFormId status createdAt")
      .populate("studentId", "name email phone lastLogin companyId")
      .sort({ createdAt: -1 })
      .lean();
    console.timeEnd("Optimized Query Time");

    // Compare payload sizes (stringified JSON length)
    const originalSize = Buffer.byteLength(JSON.stringify(dataOriginal));
    const optimizedSize = Buffer.byteLength(JSON.stringify(dataOptimized));
    console.log(`Original data size: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`Optimized data size: ${(optimizedSize / 1024).toFixed(2)} KB`);
    console.log(`Payload size reduction: ${((1 - (optimizedSize / originalSize)) * 100).toFixed(2)}%`);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

check();
