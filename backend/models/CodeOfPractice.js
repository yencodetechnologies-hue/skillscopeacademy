const mongoose = require("mongoose");

const codeOfPracticeSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    slug:        { type: String, required: true, trim: true, lowercase: true, unique: true },
    description: { type: String, default: "", trim: true },
    fileUrl:     { type: String, required: true, trim: true },
    order:       { type: Number, default: 0 },
    active:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodeOfPractice", codeOfPracticeSchema);