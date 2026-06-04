const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type:    String,
      default: '',
    },
    subtitle: {
      type:    String,
      default: '',
    },
    image: {
      type:    String,   // Cloudinary URL
      default: '',
    },
    link: {
      type:    String,   // CTA button URL
      default: '',
    },
    linkText: {
      type:    String,   // CTA button label
      default: 'Learn More',
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    order: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Banner', bannerSchema)