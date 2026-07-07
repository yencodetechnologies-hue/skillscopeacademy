const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  email: { type: String, required: true },
  date:  { type: String, required: true },
  bookingId: { type: String, default: "" },
});

const enrollmentLinkSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    course:      { type: String, default: "Any course" },
    usage:       { type: Number, default: 0 },
    maxUses:     { type: Number, default: null },
    expires:     { type: String, default: null },
    status:      { type: String, enum: ["Active", "Inactive"], default: "Active" },
    payLater:    { type: Boolean, default: false },
    agent:       { type: Boolean, default: false },
    students:    { type: [studentSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EnrollmentLink", enrollmentLinkSchema);