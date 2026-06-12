const express = require('express')
const upload  = require('../middleware/uploadMiddleware')

const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  reorderCourses,
} = require('../controllers/courseController')

const router = express.Router()

// Multi-file upload: thumbnail (image) + codeOfPracticeFile (pdf) + syllabusFile (pdf)
const courseUpload = upload.fields([
  { name: 'thumbnail',           maxCount: 1 },
  { name: 'codeOfPracticeFile',  maxCount: 1 },
  { name: 'syllabusFile',        maxCount: 1 },
])

router.get('/',                    getCourses)
router.get('/:id',                 getCourseById)
router.post('/',                   courseUpload, createCourse)
router.put('/:id',                 courseUpload, updateCourse)
router.delete('/:id',              deleteCourse)
router.patch('/:id/toggle-status', toggleCourseStatus)
router.post('/reorder',            reorderCourses)

module.exports = router