const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Assessor account for the Student Assessment module. Kept separate from
// the main site's User model (own login system, own collection).
const AssessmentUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

AssessmentUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

AssessmentUserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("AssessmentUser", AssessmentUserSchema);
