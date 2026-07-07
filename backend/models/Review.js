const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    googleTime: { type: Number, required: true },
    authorName: { type: String, required: true, trim: true },
    authorUrl: { type: String, default: "", trim: true },
    profilePhotoUrl: { type: String, default: "", trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: "", trim: true },
    relativeTime: { type: String, default: "", trim: true },
    placeName: { type: String, default: "", trim: true },
    placeRating: { type: Number, default: null },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

reviewSchema.index({ googleTime: -1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
