const VocRegistration = require('../models/VocRegistration')

// POST /api/voc/register
exports.createVocRegistration = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, studentId,
      address, city, state, postcode,
      courses, paymentMethod, total
    } = req.body

    // Basic server-side validation
    if (!firstName || !lastName || !email || !phone || !studentId || !address || !city || !state || !postcode) {
      return res.status(400).json({ success: false, message: 'All personal details are required.' })
    }
    if (!courses || courses.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one course must be selected.' })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email required.' })
    }

    const registration = await VocRegistration.create({
      firstName, lastName, email, phone, studentId,
      address, city, state, postcode,
      courses, paymentMethod, total
    })

    res.status(201).json({ success: true, data: registration, message: 'VOC Registration submitted successfully.' })
  } catch (err) {
    console.error('VOC registration error:', err)
    res.status(500).json({ success: false, message: 'Server error. Please try again.' })
  }
}

// GET /api/voc/registrations  (admin)
exports.getAllVocRegistrations = async (req, res) => {
  try {
    const registrations = await VocRegistration.find()
      .populate('courses.courseId', 'title')
      .populate('courses.date', 'date startTime')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: registrations })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' })
  }
}