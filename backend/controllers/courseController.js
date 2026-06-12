// const Course = require('../models/Course')

// // ── Helper: build update object from body ─────────────────────
// const ALLOWED = [
//   'title','urlSlug','code','instructor','duration','certificateValidity',
//   'pricingType','vocPrice','originalPrice','price','deliveryMethod','location',
//   'description','trainingOverview','vocationalOutcome','feesAndCharges',
//   'optionalCharges','outcomePoint','metaTitle','metaDescription',
//   'courseRequirement','codeOfPracticeTitle',
//   'courseType','comboEnabled','comboPrice','comboDescription','comboDuration',
//   'category','isActive','order',
// ]

// const pickFields = (body) => {
//   const obj = {}
//   ALLOWED.forEach(k => {
//     if (body[k] !== undefined && body[k] !== null && body[k] !== '') {
//       obj[k] = body[k]
//     }
//   })
//   // Booleans
//   if (body.comboEnabled !== undefined) obj.comboEnabled = body.comboEnabled === 'true' || body.comboEnabled === true
//   if (body.isActive    !== undefined) obj.isActive    = body.isActive    === 'true' || body.isActive    === true
//   // Numbers
//   ;['vocPrice','originalPrice','price','comboPrice','comboDuration','order'].forEach(k => {
//     if (obj[k] !== undefined) obj[k] = Number(obj[k]) || 0
//   })
//   return obj
// }

// const makeSlug = (title) =>
//   title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
//   '-' + Date.now().toString(36)

// // ══════════════════════════════════════════════════════════════
// // GET ALL COURSES
// // ══════════════════════════════════════════════════════════════
// exports.getCourses = async (req, res) => {
//   try {
//     const courses = await Course.find()
//       .populate('category', 'name')
//       .sort({ order: 1, createdAt: -1 })
//     res.json({ success: true, courses })
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message })
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // GET SINGLE COURSE BY ID
// // ══════════════════════════════════════════════════════════════
// exports.getCourseById = async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id).populate('category', 'name')
//     if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
//     res.json({ success: true, course })
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message })
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // CREATE COURSE
// // ══════════════════════════════════════════════════════════════
// exports.createCourse = async (req, res) => {
//   try {
//     const { title } = req.body
//     if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' })

//     const fields = pickFields(req.body)
//     fields.title = title.trim()
//     fields.slug  = req.body.urlSlug?.trim()
//       ? req.body.urlSlug.trim()
//       : makeSlug(title)

//     if (req.file?.path) fields.thumbnail = req.file.path

//     // PDF uploads
//     if (req.files?.codeOfPracticeFile?.[0]?.path)
//       fields.codeOfPracticeFile = req.files.codeOfPracticeFile[0].path
//     if (req.files?.syllabusFile?.[0]?.path)
//       fields.syllabusFile = req.files.syllabusFile[0].path

//     const course = await Course.create(fields)
//     res.status(201).json({ success: true, course })
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message })
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // UPDATE COURSE
// // ══════════════════════════════════════════════════════════════
// exports.updateCourse = async (req, res) => {
//   try {
//     const fields = pickFields(req.body)
//     if (req.body.title?.trim()) fields.title = req.body.title.trim()
//     if (req.file?.path) fields.thumbnail = req.file.path
//     if (req.files?.codeOfPracticeFile?.[0]?.path)
//       fields.codeOfPracticeFile = req.files.codeOfPracticeFile[0].path
//     if (req.files?.syllabusFile?.[0]?.path)
//       fields.syllabusFile = req.files.syllabusFile[0].path

//     const course = await Course.findByIdAndUpdate(req.params.id, fields, { new: true })
//       .populate('category', 'name')
//     if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
//     res.json({ success: true, course })
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message })
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // DELETE COURSE
// // ══════════════════════════════════════════════════════════════
// exports.deleteCourse = async (req, res) => {
//   try {
//     await Course.findByIdAndDelete(req.params.id)
//     res.json({ success: true, message: 'Course deleted' })
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message })
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // TOGGLE STATUS
// // ══════════════════════════════════════════════════════════════
// exports.toggleCourseStatus = async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id)
//     if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
//     course.isActive = !course.isActive
//     await course.save()
//     res.json({ success: true, course })
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message })
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // REORDER COURSES
// // ══════════════════════════════════════════════════════════════
// exports.reorderCourses = async (req, res) => {
//   try {
//     const { orderedIds } = req.body
//     if (!Array.isArray(orderedIds))
//       return res.status(400).json({ success: false, message: 'orderedIds array required' })
//     await Promise.all(orderedIds.map((id, idx) =>
//       Course.findByIdAndUpdate(id, { order: idx })
//     ))
//     res.json({ success: true, message: 'Courses reordered' })
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message })
//   }
// }

const Course = require('../models/Course')
const { logActivity } = require('./activityLogController')

// ── Helper: build update object from body ─────────────────────
const ALLOWED = [
  'title','urlSlug','code','instructor','duration','certificateValidity',
  'pricingType','vocPrice','originalPrice','price','deliveryMethod','location',
  'description','trainingOverview','vocationalOutcome','feesAndCharges',
  'optionalCharges','outcomePoint','metaTitle','metaDescription',
  'courseRequirement','codeOfPracticeTitle',
  'courseType','comboEnabled','comboPrice','comboDescription','comboDuration',
  'category','isActive','order',
]

const pickFields = (body) => {
  const obj = {}
  ALLOWED.forEach(k => {
    if (body[k] !== undefined && body[k] !== null && body[k] !== '') {
      obj[k] = body[k]
    }
  })
  if (body.comboEnabled !== undefined) obj.comboEnabled = body.comboEnabled === 'true' || body.comboEnabled === true
  if (body.isActive    !== undefined) obj.isActive    = body.isActive    === 'true' || body.isActive    === true
  ;['vocPrice','originalPrice','price','comboPrice','comboDuration','order'].forEach(k => {
    if (obj[k] !== undefined) obj[k] = Number(obj[k]) || 0
  })
  return obj
}

const makeSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
  '-' + Date.now().toString(36)

// ══════════════════════════════════════════════════════════════
// GET ALL COURSES
// ══════════════════════════════════════════════════════════════
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('category', 'name')
      .sort({ order: 1, createdAt: -1 })
    res.json({ success: true, courses })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ══════════════════════════════════════════════════════════════
// GET SINGLE COURSE BY ID
// ══════════════════════════════════════════════════════════════
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('category', 'name')
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
    res.json({ success: true, course })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ══════════════════════════════════════════════════════════════
// CREATE COURSE
// ══════════════════════════════════════════════════════════════
exports.createCourse = async (req, res) => {
  try {
    const { title } = req.body
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' })

    const fields = pickFields(req.body)
    fields.title = title.trim()
    fields.slug  = req.body.urlSlug?.trim() ? req.body.urlSlug.trim() : makeSlug(title)

    if (req.file?.path) fields.thumbnail = req.file.path
    if (req.files?.codeOfPracticeFile?.[0]?.path) fields.codeOfPracticeFile = req.files.codeOfPracticeFile[0].path
    if (req.files?.syllabusFile?.[0]?.path)        fields.syllabusFile = req.files.syllabusFile[0].path

    const course = await Course.create(fields)

    await logActivity({
      action:      'CREATE_COURSE',
      entity:      'Course',
      entityId:    course._id,
      description: `Course "${course.title}" created`,
      req,
    })

    res.status(201).json({ success: true, course })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ══════════════════════════════════════════════════════════════
// UPDATE COURSE
// ══════════════════════════════════════════════════════════════
exports.updateCourse = async (req, res) => {
  try {
    const fields = pickFields(req.body)
    if (req.body.title?.trim()) fields.title = req.body.title.trim()
    if (req.file?.path) fields.thumbnail = req.file.path
    if (req.files?.codeOfPracticeFile?.[0]?.path) fields.codeOfPracticeFile = req.files.codeOfPracticeFile[0].path
    if (req.files?.syllabusFile?.[0]?.path)        fields.syllabusFile = req.files.syllabusFile[0].path

    const course = await Course.findByIdAndUpdate(req.params.id, fields, { new: true })
      .populate('category', 'name')
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' })

    await logActivity({
      action:      'UPDATE_COURSE',
      entity:      'Course',
      entityId:    course._id,
      description: `Course "${course.title}" updated`,
      req,
    })

    res.json({ success: true, course })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ══════════════════════════════════════════════════════════════
// DELETE COURSE
// ══════════════════════════════════════════════════════════════
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)

    await logActivity({
      action:      'DELETE_COURSE',
      entity:      'Course',
      entityId:    req.params.id,
      description: `Course "${course?.title || req.params.id}" deleted`,
      req,
    })

    res.json({ success: true, message: 'Course deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ══════════════════════════════════════════════════════════════
// TOGGLE STATUS
// ══════════════════════════════════════════════════════════════
exports.toggleCourseStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' })
    course.isActive = !course.isActive
    await course.save()

    await logActivity({
      action:      course.isActive ? 'ACTIVATE_COURSE' : 'DEACTIVATE_COURSE',
      entity:      'Course',
      entityId:    course._id,
      description: `Course "${course.title}" ${course.isActive ? 'activated' : 'deactivated'}`,
      req,
    })

    res.json({ success: true, course })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ══════════════════════════════════════════════════════════════
// REORDER COURSES
// ══════════════════════════════════════════════════════════════
exports.reorderCourses = async (req, res) => {
  try {
    const { orderedIds } = req.body
    if (!Array.isArray(orderedIds))
      return res.status(400).json({ success: false, message: 'orderedIds array required' })
    await Promise.all(orderedIds.map((id, idx) => Course.findByIdAndUpdate(id, { order: idx })))

    await logActivity({
      action:      'REORDER_COURSES',
      entity:      'Course',
      description: `${orderedIds.length} courses reordered`,
      req,
    })

    res.json({ success: true, message: 'Courses reordered' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}