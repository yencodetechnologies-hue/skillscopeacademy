const ActivityLog = require('../models/Activitylogs')

/*
=======================================
GET ACTIVITY LOGS
Query params:
  ?limit=50        — how many to return (default 50, max 200)
  ?page=1          — pagination (default 1)
  ?entity=Course   — filter by entity name
  ?action=CREATE   — filter by action (partial match)
=======================================
*/
exports.getActivityLogs = async (req, res) => {
  try {
    const limit  = Math.min(Number(req.query.limit)  || 50, 200)
    const page   = Math.max(Number(req.query.page)   || 1, 1)
    const skip   = (page - 1) * limit

    // Build optional filter
    const filter = {}
    if (req.query.entity) {
      filter.entity = req.query.entity
    }
    if (req.query.action) {
      // Case-insensitive partial match
      filter.action = { $regex: req.query.action, $options: 'i' }
    }

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('performedBy', 'name email'),
      ActivityLog.countDocuments(filter),
    ])

    res.json({
      success: true,
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/*
=======================================
CREATE ACTIVITY LOG  (used internally)
Call this from other controllers to record actions.

Usage:
  const { logActivity } = require('./activityLogController')
  await logActivity({ action, entity, entityId, description, req })
=======================================
*/
exports.logActivity = async ({ action, entity = '', entityId = '', description = '', req = null, meta = {} } = {}) => {
  try {
    await ActivityLog.create({
      action,
      entity,
      entityId:    String(entityId),
      description,
      performedBy: req?.user?._id || null,
      ip:          req?.ip        || '',
      meta,
    })
  } catch (err) {
    // Never throw — logging should never break the main flow
    console.error('ActivityLog write failed:', err.message)
  }
}

/*
=======================================
DELETE A SINGLE LOG (admin only)
=======================================
*/
exports.deleteLog = async (req, res) => {
  try {
    await ActivityLog.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Log deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/*
=======================================
CLEAR ALL LOGS (admin only — dangerous)
=======================================
*/
exports.clearAllLogs = async (req, res) => {
  try {
    await ActivityLog.deleteMany({})
    res.json({ success: true, message: 'All activity logs cleared' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}