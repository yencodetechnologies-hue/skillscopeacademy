const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },
    imageUrl:   { type: String, required: true, trim: true },
    category:   { type: String, default: "COURSE", trim: true },
    courseName: { type: String, default: "Work Safely at Heights", trim: true },
    active:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);


