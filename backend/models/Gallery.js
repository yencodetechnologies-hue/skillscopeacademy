const mongoose = require('mongoose')

const gallerySchema = new mongoose.Schema(
  {
    image: {
      type:     String,    // Cloudinary URL
      required: true,
    },
    caption: {
      type:    String,
      default: '',
    },
    order: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Gallery', gallerySchema)