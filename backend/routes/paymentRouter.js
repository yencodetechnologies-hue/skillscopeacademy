const express = require('express');
const router = express.Router();
const {
  createPayment,
  createPaymentWithToken,
  createPaymentToken,
  refundPayment,
  getPaymentDetails,
  getPaymentHistory,
  getSquareConfig,
} = require('../controllers/paymentController');

router.get('/square-config', getSquareConfig);
router.post('/pay', createPayment);
router.post('/create', createPayment);
router.post('/create-with-token', createPaymentWithToken);
router.post('/create-token', createPaymentToken);
router.post('/refund', refundPayment);
router.get('/details/:transactionId', getPaymentDetails);
router.get('/history/:userId', getPaymentHistory);

module.exports = router;