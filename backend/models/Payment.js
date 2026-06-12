const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    // Course reference
    courseId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    courseName: { type: String, default: '' },
    option:     { type: String, enum: ['Standard', 'VOC', 'Combo'], default: 'Standard' },
    qty:        { type: Number, default: 1 },
    unitPrice:  { type: Number, default: 0 },
    amount:     { type: Number, required: true },   // total incl. GST
    currency:   { type: String, default: 'AUD' },

    // Buyer info
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    userName:   { type: String, default: '' },
    userEmail:  { type: String, default: '' },
    userPhone:  { type: String, default: '' },
    company:    { type: String, default: '' },

    // Demo card info (never store full card number)
    cardType:   { type: String, default: 'visa' },
    cardLast4:  { type: String, default: '' },
    cardName:   { type: String, default: '' },

    // Transaction metadata
    status:        { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentMode:   { type: String, default: 'demo_card' },
    transactionId: { type: String, default: '' },
  },
  { timestamps: true }
)

paymentSchema.index({ createdAt: -1 })
paymentSchema.index({ userEmail: 1 })
paymentSchema.index({ status: 1 })

module.exports = mongoose.model('Payment', paymentSchema)