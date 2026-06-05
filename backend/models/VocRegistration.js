const mongoose = require('mongoose')

const vocRegistrationSchema = new mongoose.Schema({
  firstName:   { type: String, required: true },
  lastName:    { type: String, required: true },
  email:       { type: String, required: true },
  phone:       { type: String, required: true },
  studentId:   { type: String, required: true },
  address:     { type: String, required: true },
  city:        { type: String, required: true },
  state:       { type: String, required: true },
  postcode:    { type: String, required: true },
  courses: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      title:    String,
      price:    Number,
      date:     { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
    }
  ],
  paymentMethod: { type: String, enum: ['card', 'bank'], default: 'card' },
  total:         { type: Number, default: 0 },
  status:        { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, { timestamps: true })

module.exports = mongoose.model('VocRegistration', vocRegistrationSchema)