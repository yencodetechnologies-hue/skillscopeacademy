// ════════════════════════════════════════════
// routes/scheduleRoutes.js
// ════════════════════════════════════════════
const express = require('express')
const {
  getAllSchedules, getSchedulesByCourse,
  createSchedule, createBulkSchedules,
  updateSchedule, deleteSchedule, toggleScheduleStatus,deleteOldSchedules
} = require('../controllers/scheduleController')

const router = express.Router()

router.get('/',                     getAllSchedules)
router.get('/course/:courseId',     getSchedulesByCourse)
router.post('/',                    createSchedule)
router.post('/bulk',                createBulkSchedules)
router.put('/:id',                  updateSchedule)
router.delete('/:id',               deleteSchedule)
router.patch('/:id/toggle-status',  toggleScheduleStatus)
router.delete('/old', deleteOldSchedules)

module.exports = router

// ════════════════════════════════════════════
// routes/galleryRoutes.js
// ════════════════════════════════════════════
// const express   = require('express')
// const router    = express.Router()
// const upload    = require('../middleware/upload')   // your multer config
// const { getGallery, uploadGallery, deleteGallery } = require('../controllers/galleryController')
//
// router.get('/',        getGallery)
// router.post('/',       upload.single('image'), uploadGallery)
// router.delete('/:id',  deleteGallery)
// module.exports = router

// ════════════════════════════════════════════
// routes/bannerRoutes.js
// ════════════════════════════════════════════
// const express = require('express')
// const router  = express.Router()
// const upload  = require('../middleware/upload')
// const { getBanners, createBanner, updateBanner, deleteBanner, toggleBanner } = require('../controllers/bannerController')
//
// router.get('/',            getBanners)
// router.post('/',           upload.single('image'), createBanner)
// router.put('/:id',         updateBanner)
// router.delete('/:id',      deleteBanner)
// router.patch('/:id/toggle', toggleBanner)
// module.exports = router

// ════════════════════════════════════════════
// routes/paymentRoutes.js
// ════════════════════════════════════════════
// const express = require('express')
// const router  = express.Router()
// const { getAllPayments, createPayment } = require('../controllers/paymentController')
//
// router.get('/',   getAllPayments)
// router.post('/',  createPayment)
// module.exports = router

// ════════════════════════════════════════════
// routes/activityLogRoutes.js
// ════════════════════════════════════════════
// const express = require('express')
// const router  = express.Router()
// const { getActivityLogs } = require('../controllers/activityLogController')
//
// router.get('/', getActivityLogs)
// module.exports = router

// ════════════════════════════════════════════
// routes/courseRoutes.js  — add this line:
// ════════════════════════════════════════════
// router.patch('/:id/toggle-status', toggleCourseStatus)

// ════════════════════════════════════════════
// server.js / app.js — register all routes:
// ════════════════════════════════════════════
// app.use('/api/schedules',      require('./routes/scheduleRoutes'))
// app.use('/api/gallery',        require('./routes/galleryRoutes'))
// app.use('/api/banners',        require('./routes/bannerRoutes'))
// app.use('/api/payments',       require('./routes/paymentRoutes'))
// app.use('/api/activity-logs',  require('./routes/activityLogRoutes'))