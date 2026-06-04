const express = require('express')
const router  = express.Router()

const {
  getActivityLogs,
  deleteLog,
  clearAllLogs,
} = require('../controllers/activityLogController')

router.get('/',         getActivityLogs)
router.delete('/clear', clearAllLogs)    // must be before /:id
router.delete('/:id',   deleteLog)

module.exports = router