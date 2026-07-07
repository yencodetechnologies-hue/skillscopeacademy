const mongoose = require("mongoose");
const slugify = require("slugify")

const courseSchema = new mongoose.Schema({

  // BASIC INFO
  courseCode: String,
  title: { type: String },

  // ✅ CHANGED: String → ObjectId ref to Category
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  duration: String,
  certificateValidity: String,
  deliveryMethod: String,
  location: String,
  image: String,

  // PRICING
  pricingType: { type: String, enum: ["standard", "experience", "slbl"], default: "standard" },
  originalPrice: Number,
  sellingPrice: Number,
  vocPrice: { type: Number, default: 150 },
  slSingleStrikePrice: Number,
  slSinglePrice: Number,
  slblStrikePrice: Number,
  slblPrice: Number,

  // SEO (per-course Google title & snippet)
  metaTitle: { type: String, maxlength: 60 },
  metaDescription: { type: String, maxlength: 160 },

  // DETAILS
  description: [String],
  trainingOverview: [String],
  vocationalOutcome: [String],
  feesCharges: [String],
  optionalCharges: [String],
  outcomePoints: [String],
  syllabusUrl: String,

  // REQUIREMENTS
  requirements: [String],

  handbook: {
    title: String,
    pdf: String,
    url: String,
    cardImage: String
  },

  // PATHWAYS
  pathways: [String],

  // COMBO
  comboType: { type: String, enum: ["Premium", "Standard"] },
  studentsEnrolled: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },
  experienceBasedBooking: { type: Boolean, default: false },
  comboEnabled:    { type: Boolean, default: false },
  comboDescription: String,
  comboPrice:    Number,
  comboDuration: String,

  // Slug is the SEO-friendly URL segment (e.g. /course/forklift-licence).
  // It MUST be unique across all courses — the controller pre-checks this
  // and we keep `unique: true` as a safety net for race conditions.
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },

  withExperiencePrice:    Number,
  withExperienceOriginal: Number,
  withoutExperiencePrice:    Number,
  withoutExperienceOriginal: Number,

  // sortOrder for drag reorder
  sortOrder: { type: Number, default: 0 },

}, { timestamps: true })

module.exports = mongoose.model("Course", courseSchema)