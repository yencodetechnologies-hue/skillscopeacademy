const express = require('express')
const router  = express.Router()

const {
  getAllPayments,
  createPayment,
  getPaymentById,
  updatePaymentStatus,
} = require('../controllers/paymentController')

const { protect } = require('../middleware/authMiddleware')

// ── Public ────────────────────────────────────────────────────
// Anyone can POST a payment (guests checking out don't have a token)
router.post('/', createPayment)

// ── Protected (must be logged in) ─────────────────────────────
// Your app only has one admin account, so protect is enough.
// The frontend already hides these pages behind ProtectedAdminRoute.
router.get('/',             protect, getAllPayments)
router.get('/:id',          protect, getPaymentById)
router.patch('/:id/status', protect, updatePaymentStatus)

module.exports = router