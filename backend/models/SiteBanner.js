const mongoose = require("mongoose")

const siteBannerSchema = new mongoose.Schema(
  {
    title:    { type: String, default: "", trim: true },
    imageUrl: { type: String, required: true, trim: true },
    link:     { type: String, default: "", trim: true },
    order:    { type: Number, default: 0 },
    active:   { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model("SiteBanner", siteBannerSchema)
