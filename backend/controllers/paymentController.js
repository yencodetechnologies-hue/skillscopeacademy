const Payment    = require('../models/Payment')
const { logActivity } = require('./activityLogController')

/* ══════════════════════════════════════════════════════════════
   GET ALL PAYMENTS  (admin)
   GET /api/payments?page=1&limit=20&status=paid&search=john
   ══════════════════════════════════════════════════════════════ */
exports.getAllPayments = async (req, res) => {
  try {
    const limit  = Math.min(Number(req.query.limit)  || 20, 200)
    const page   = Math.max(Number(req.query.page)   || 1, 1)
    const skip   = (page - 1) * limit

    const filter = {}
    if (req.query.status) filter.status = req.query.status
    if (req.query.search) {
      filter.$or = [
        { userName:  { $regex: req.query.search, $options: 'i' } },
        { userEmail: { $regex: req.query.search, $options: 'i' } },
        { courseName:{ $regex: req.query.search, $options: 'i' } },
      ]
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('courseId', 'title')
        .populate('user', 'name email'),
      Payment.countDocuments(filter),
    ])

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])

    res.json({
      success: true,
      data: payments,
      total,
      page,
      pages: Math.ceil(total / limit),
      totalRevenue: totalRevenue[0]?.total || 0,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ══════════════════════════════════════════════════════════════
   CREATE PAYMENT  (public — called from checkout page)
   POST /api/payments
   ══════════════════════════════════════════════════════════════ */
exports.createPayment = async (req, res) => {
  try {
    const {
      courseId, courseName, option, qty, unitPrice, amount, currency,
      userName, userEmail, userPhone, company,
      cardType, cardLast4, cardName,
      status, paymentMode, transactionId,
    } = req.body

    if (!amount) {
      return res.status(400).json({ success: false, message: 'amount is required' })
    }

    const payment = await Payment.create({
      courseId:  courseId || null,
      courseName: courseName || '',
      option:    option || 'Standard',
      qty:       qty || 1,
      unitPrice: unitPrice || 0,
      amount,
      currency:  currency || 'AUD',
      user:      req.user?._id || null,
      userName:  userName || req.user?.name || '',
      userEmail: userEmail || req.user?.email || '',
      userPhone: userPhone || '',
      company:   company || '',
      cardType:  cardType || 'visa',
      cardLast4: cardLast4 || '',
      cardName:  cardName || '',
      status:    status || 'paid',
      paymentMode: paymentMode || 'demo_card',
      transactionId: transactionId || ('DEMO-' + Date.now()),
    })

    // ── Log the payment activity ──────────────────────────────
    await logActivity({
      action:      'PAYMENT',
      entity:      'Payment',
      entityId:    payment._id,
      description: `${userName || 'Guest'} paid $${amount} for "${courseName}" (${option}) — txn ${payment.transactionId}`,
      req,
    })

    res.status(201).json({ success: true, data: payment })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ══════════════════════════════════════════════════════════════
   GET SINGLE PAYMENT  (admin)
   GET /api/payments/:id
   ══════════════════════════════════════════════════════════════ */
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('courseId', 'title price')
      .populate('user', 'name email')
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' })
    res.json({ success: true, data: payment })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/* ══════════════════════════════════════════════════════════════
   UPDATE PAYMENT STATUS  (admin)
   PATCH /api/payments/:id/status
   Body: { status: 'refunded' }
   ══════════════════════════════════════════════════════════════ */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['pending', 'paid', 'failed', 'refunded']
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' })

    await logActivity({
      action:      'UPDATE_PAYMENT_STATUS',
      entity:      'Payment',
      entityId:    payment._id,
      description: `Payment ${payment.transactionId} status updated to ${status}`,
      req,
    })

    res.json({ success: true, data: payment })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}