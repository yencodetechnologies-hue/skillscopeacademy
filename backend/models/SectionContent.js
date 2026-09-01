// models/SectionContent.js
const mongoose = require("mongoose");

const sectionContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true, // "duration", "classHours", etc.
      trim: true,
    },
    icon: {
      type: String, // stored for reference/display only — never edited via admin
    },
    val: {
      type: String,
      trim: true,
    },
    label: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SectionContent", sectionContentSchema);