const mongoose = require("mongoose");

const llndSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentMain"
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },

  name: String,
  email: String,
  phone: String,

  total: Number,
  correct: Number,
  percentage: Number,

  status: {
    type: String,
    enum: ["Passed", "Failed"]
  },

  sections: [
    {
      name: String,
      score: Number,
      status: String
    }
  ],

  approved: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("LLNDAssessment", llndSchema);