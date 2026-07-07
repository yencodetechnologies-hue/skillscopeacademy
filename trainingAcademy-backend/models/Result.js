const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentMain",
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  courseName: String,
  courseCode: String,
  unitName: String,
  assessmentType: {
    type: String,
    enum: ["Theory", "Practical", "Exam"],
    default: "Theory"
  },
  score: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["Competent", "Not Yet Competent", "Pending"],
    default: "Pending"
  },
  feedback: String,
  attempts: {
    type: Number,
    default: 1
  },
  assessmentDate: Date
}, { timestamps: true });

module.exports = mongoose.model("Result", resultSchema);