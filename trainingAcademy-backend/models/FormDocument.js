const mongoose = require("mongoose");

// Used by the public "Forms" resources page.
// section: "featured" -> shown as the big card on the left (e.g. Participant Handbook)
//          "list"      -> shown as a row in the right-hand PDF list (e.g. WHS Act)
const formDocumentSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    fileUrl:     { type: String, required: true, trim: true },
    section:     { type: String, enum: ["featured", "list"], default: "list" },
    bannerImage: { type: String, default: "", trim: true }, // optional, "featured" cards only
    order:       { type: Number, default: 0 },
    active:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormDocument", formDocumentSchema);