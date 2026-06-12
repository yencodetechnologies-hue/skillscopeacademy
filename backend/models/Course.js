const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    // ── Basic Info ─────────────────────────────────────────────
    title:       { type: String, required: true },
    slug:        { type: String, required: true, unique: true, trim: true },
    urlSlug:     { type: String, default: "" },
    code:        { type: String, default: "" },         // Course Code (Optional)
    category:    { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    instructor:  { type: String, default: "" },
    duration:    { type: String, default: "" },         // e.g. "1 Day Course"
    certificateValidity: { type: String, default: "" }, // e.g. "3 years"
    pricingType: { type: String, default: "Standard" }, // Standard | Experience-Based | SL or BL
    vocPrice:    { type: Number, default: 150 },
    originalPrice:   { type: Number, default: 0 },     // Strike price
    price:           { type: Number, default: 0 },     // Selling price
    deliveryMethod:  { type: String, default: "" },    // e.g. Online, Classroom
    location:        { type: String, default: "" },
    thumbnail:       { type: String, default: "" },

    // ── Details tab ───────────────────────────────────────────
    description:       { type: String, default: "" },
    trainingOverview:  { type: String, default: "" },
    vocationalOutcome: { type: String, default: "" },
    feesAndCharges:    { type: String, default: "" },
    optionalCharges:   { type: String, default: "" },
    outcomePoint:      { type: String, default: "" },

    // SEO
    metaTitle:       { type: String, default: "" },
    metaDescription: { type: String, default: "" },

    // ── Requirements tab ──────────────────────────────────────
    courseRequirement:    { type: String, default: "" },
    codeOfPracticeTitle:  { type: String, default: "" },
    codeOfPracticeFile:   { type: String, default: "" }, // PDF URL
    syllabusFile:         { type: String, default: "" }, // PDF URL

    // ── Combo Offer tab ───────────────────────────────────────
    courseType:       { type: String, default: "single" },
    comboEnabled:     { type: Boolean, default: false },
    comboPrice:       { type: Number, default: 0 },
    comboDescription: { type: String, default: "" },
    comboDuration:    { type: Number, default: 0 },

    // ── Misc ──────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    order:    { type: Number, default: 0 },
    rating:   { type: Number, default: 4.5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);