const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  getCouponById,
  validateCoupon
} = require('../controllers/couponController');

router.post('/coupons', createCoupon);
router.get('/coupons', getCoupons);
router.get('/coupons/:id', getCouponById);
router.post(
  '/coupons/validate',validateCoupon
);

module.exports = router;

// In server.js: app.use('/api', couponRoutes);
