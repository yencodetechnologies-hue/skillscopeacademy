const mongoose = require("mongoose")

// "Partners" power the OUR TRUSTED CLIENTS marquee on the public landing
// page. The shape mirrors Slider so the admin UX is the same — only the
// purpose / display location differs. We use `name` instead of `title`
// because the field is the company/brand name shown as alt text and used
// for the on-hover tooltip.
const partnerSchema = new mongoose.Schema(
  {
    name:     { type: String, default: "", trim: true },
    imageUrl: { type: String, required: true, trim: true },
    link:     { type: String, default: "", trim: true },
    order:    { type: Number, default: 0 },
    active:   { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Partner", partnerSchema)
