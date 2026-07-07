const mongoose = require("mongoose");

const reviewMetaSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "google_sync" },
    lastSyncDate: { type: String, default: "" },
    lastSyncAt: { type: Date, default: null },
    lastError: { type: String, default: "" },
    placeName: { type: String, default: "", trim: true },
    placeRating: { type: Number, default: null },
    userRatingsTotal: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReviewMeta", reviewMetaSchema);
