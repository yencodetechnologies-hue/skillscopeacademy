const mongoose = require("mongoose");

const AssessmentSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  assessor_id: { type: mongoose.Schema.Types.ObjectId, ref: "AssessmentUser" },
  name: { type: String, default: "Question 1" },
  expires_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Assessment", AssessmentSchema);
