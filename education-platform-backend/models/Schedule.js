const mongoose = require('mongoose')

const scheduleSchema = new mongoose.Schema(
  {
    courseId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Course',
      required: true,
    },

    date: {
      type:     Date,
      required: true,
    },

    sessionType: {
      type:    String,
      enum:    ['General', 'Theory', 'Practical', 'Exam'],
      default: 'General',
    },

    startTime: {
      type:     String,   // "08:30"
      required: true,
    },

    endTime: {
      type:     String,   // "17:00"
      required: true,
    },

    location: {
      type:    String,    // "Online" | "Face to Face"
      default: '',
    },

    activeSlots: {
      type:     Number,
      required: true,
    },

    teacher: {
      type:    String,
      default: '',
    },

    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Schedule', scheduleSchema)