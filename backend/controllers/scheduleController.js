// const Schedule = require('../models/Schedule')

// /*
// ========================================
// GET ALL SCHEDULES (for Schedule page)
// ========================================
// */
// exports.getAllSchedules = async (req, res) => {
//   try {
//     const schedules = await Schedule.find()
//       .populate('courseId', 'title')
//       .sort({ date: 1 })

//     res.json({ success: true, schedules })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }

// /*
// ========================================
// GET SCHEDULES BY COURSE
// ========================================
// */
// exports.getSchedulesByCourse = async (req, res) => {
//   try {
//     const schedules = await Schedule.find({ courseId: req.params.courseId })
//       .sort({ date: 1 })

//     res.json({ success: true, schedules })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }

// /*
// ========================================
// CREATE SCHEDULE
// ========================================
// */
// exports.createSchedule = async (req, res) => {
//   try {
//     const {
//       courseId, date, sessionType,
//       startTime, endTime, location,
//       activeSlots, teacher,
//     } = req.body

//     const schedule = await Schedule.create({
//       courseId,
//       date,
//       sessionType: sessionType || 'General',
//       startTime,
//       endTime,
//       location:    location || '',
//       activeSlots: Number(activeSlots),
//       teacher:     teacher || '',
//       isActive:    true,
//     })

//     res.status(201).json({ success: true, schedule })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }

// /*
// ========================================
// UPDATE SCHEDULE
// ========================================
// */
// exports.updateSchedule = async (req, res) => {
//   try {
//     const { startTime, endTime, activeSlots, sessionType, location, teacher } = req.body

//     const updateData = {}
//     if (startTime   !== undefined) updateData.startTime   = startTime
//     if (endTime     !== undefined) updateData.endTime     = endTime
//     if (activeSlots !== undefined) updateData.activeSlots = Number(activeSlots)
//     if (sessionType !== undefined) updateData.sessionType = sessionType
//     if (location    !== undefined) updateData.location    = location
//     if (teacher     !== undefined) updateData.teacher     = teacher

//     const schedule = await Schedule.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     )

//     if (!schedule) {
//       return res.status(404).json({ success: false, message: 'Schedule not found' })
//     }

//     res.json({ success: true, schedule })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }

// /*
// ========================================
// DELETE SCHEDULE
// ========================================
// */
// exports.deleteSchedule = async (req, res) => {
//   try {
//     const schedule = await Schedule.findByIdAndDelete(req.params.id)

//     if (!schedule) {
//       return res.status(404).json({ success: false, message: 'Schedule not found' })
//     }

//     res.json({ success: true, message: 'Schedule deleted' })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }

// /*
// ========================================
// TOGGLE SCHEDULE STATUS
// ========================================
// */
// exports.toggleScheduleStatus = async (req, res) => {
//   try {
//     const schedule = await Schedule.findById(req.params.id)

//     if (!schedule) {
//       return res.status(404).json({ success: false, message: 'Schedule not found' })
//     }

//     schedule.isActive = !schedule.isActive
//     await schedule.save()

//     res.json({ success: true, schedule })
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message })
//   }
// }

const Schedule = require('../models/Schedule')

// GET all schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('courseId', 'title')
      .sort({ date: 1 })
    res.json({ success: true, schedules })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

// GET schedules by course
exports.getSchedulesByCourse = async (req, res) => {
  try {
    const schedules = await Schedule.find({ courseId: req.params.courseId }).sort({ date: 1 })
    res.json({ success: true, schedules })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

// POST create single schedule
exports.createSchedule = async (req, res) => {
  try {
    const { courseId, date, sessionType, startTime, endTime, location, activeSlots, teacher } = req.body
    const schedule = await Schedule.create({
      courseId, date, sessionType: sessionType || 'General',
      startTime, endTime, location: location || '', activeSlots: Number(activeSlots),
      teacher: teacher || '', isActive: true,
    })
    res.status(201).json({ success: true, schedule })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

// POST create BULK schedules (array of dates, same session config)
exports.createBulkSchedules = async (req, res) => {
  try {
    const { courseId, dates, sessionType, startTime, endTime, location, activeSlots, teacher } = req.body

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ success: false, message: 'dates array is required' })
    }

    const docs = dates.map(date => ({
      courseId, date,
      sessionType: sessionType || 'General',
      startTime, endTime,
      location: location || '',
      activeSlots: Number(activeSlots),
      teacher: teacher || '',
      isActive: true,
    }))

    const schedules = await Schedule.insertMany(docs)
    res.status(201).json({ success: true, count: schedules.length, schedules })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

// PUT update schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { startTime, endTime, activeSlots, sessionType, location, teacher } = req.body
    const update = {}
    if (startTime   !== undefined) update.startTime   = startTime
    if (endTime     !== undefined) update.endTime     = endTime
    if (activeSlots !== undefined) update.activeSlots = Number(activeSlots)
    if (sessionType !== undefined) update.sessionType = sessionType
    if (location    !== undefined) update.location    = location
    if (teacher     !== undefined) update.teacher     = teacher

    const schedule = await Schedule.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' })
    res.json({ success: true, schedule })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

// DELETE schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id)
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' })
    res.json({ success: true, message: 'Schedule deleted' })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

// PATCH toggle schedule status
exports.toggleScheduleStatus = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' })
    schedule.isActive = !schedule.isActive
    await schedule.save()
    res.json({ success: true, schedule })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
}

exports.deleteOldSchedules = async (req, res) => {
  try {
    const today = new Date()

    const result = await Schedule.deleteMany({
      date: {
        $lt: today
      }
    })

    res.json({
      success: true,
      deletedCount: result.deletedCount
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}