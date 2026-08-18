const mongoose = require("mongoose");

const CommonAssessmentSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  assessor_id: { type: mongoose.Schema.Types.ObjectId, ref: "AssessmentUser" },
  question_ids: [{ type: String }], // e.g., ['question-1', 'question-2']
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CommonAssessment", CommonAssessmentSchema);
