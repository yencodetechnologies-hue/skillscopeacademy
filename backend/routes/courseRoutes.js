

// const express = require('express')
// const upload  = require('../middleware/uploadMiddleware')

// const {
//   getCourses,
//   createCourse,
//   updateCourse,
//   deleteCourse,
//   toggleCourseStatus,
// } = require('../controllers/courseController')

// const router = express.Router()

// router.get('/',getCourses)
// router.post('/',    upload.single('thumbnail'), createCourse)
// router.put('/:id',  upload.single('thumbnail'), updateCourse)
// router.delete('/:id',                    deleteCourse)
// router.patch('/:id/toggle-status',       toggleCourseStatus)

// module.exports = router

const express = require('express')
const upload  = require('../middleware/uploadMiddleware')

const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
} = require('../controllers/courseController')

const router = express.Router()

router.get('/',getCourses)
router.get('/:id', getCourseById)
router.post('/',    upload.single('thumbnail'), createCourse)
router.put('/:id',  upload.single('thumbnail'), updateCourse)
router.delete('/:id',                    deleteCourse)
router.patch('/:id/toggle-status',       toggleCourseStatus)

module.exports = router