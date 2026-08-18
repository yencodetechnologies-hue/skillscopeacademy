const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AssessmentStudentSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  student_id: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

AssessmentStudentSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

AssessmentStudentSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("AssessmentStudent", AssessmentStudentSchema);
