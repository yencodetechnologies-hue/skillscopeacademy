const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    instructor: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      default: 0,
    },

    thumbnail: {
      type: String,
      default: "",
    },

    courseType: {
      type: String,
      default: "single",
    },

    duration: {
      type: Number,
      default: 0,
    },

    certificateValidity: {
      type: Number,
      default: 0,
    },

    pricingType: {
      type: String,
      default: "Standard",
    },

    urlSlug: {
      type: String,
      default: "",
    },

    comboEnabled: {
      type: Boolean,
      default: false,
    },

    comboPrice: {
      type: Number,
      default: 0,
    },

    comboDescription: {
      type: String,
      default: "",
    },

    comboDuration: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 4.5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", courseSchema);