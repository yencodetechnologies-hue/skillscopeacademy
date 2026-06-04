const mongoose = require('mongoose')

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type:     String,
      required: true,
      // e.g. 'CREATE_COURSE', 'DELETE_USER', 'UPLOAD_GALLERY', etc.
    },
    entity: {
      type:    String,
      default: '',
      // e.g. 'Course', 'User', 'Gallery', 'Banner'
    },
    entityId: {
      type:    String,
      default: '',
    },
    description: {
      type:    String,
      default: '',
      // Human-readable summary: "Admin created course 'Work Safely at Heights'"
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      default: null,
    },
    ip: {
      type:    String,
      default: '',
    },
    meta: {
      type:    mongoose.Schema.Types.Mixed,
      default: {},
      // Any extra data to attach to the log
    },
  },
  { timestamps: true }
)

// Index for fast date-range queries in admin dashboard
activityLogSchema.index({ createdAt: -1 })

module.exports = mongoose.model('ActivityLog', activityLogSchema)