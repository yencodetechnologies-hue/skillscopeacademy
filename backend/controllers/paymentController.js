const axios = require('axios');
const crypto = require('crypto');
const Payment = require('../models/Payment');

const SQUARE_ENV = (process.env.SQUARE_ENVIRONMENT || 'sandbox').trim().toLowerCase();
const IS_PRODUCTION = SQUARE_ENV === 'production';

const SQUARE_BASE_URL = IS_PRODUCTION
  ? 'https://connect.squareup.com'
  : 'https://connect.squareupsandbox.com';

const SQUARE_VERSION = '2024-12-18';

let cachedLocationId = (process.env.SQUARE_LOCATION_ID || '').trim() || null;
let cachedCurrency = (process.env.SQUARE_CURRENCY || '').trim() || null;

console.log(`[Square] Initialize: Environment=${SQUARE_ENV}, URL=${SQUARE_BASE_URL}`);

function getAccessToken() {
  const token = (process.env.SQUARE_ACCESS_TOKEN || '').trim();
  if (!token) {
    console.error('CRITICAL: SQUARE_ACCESS_TOKEN missing in environment variables');
  }
  return token;
}

function squareHeaders() {
  return {
    Authorization: `Bearer ${getAccessToken()}`,
    'Square-Version': SQUARE_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

function translateSquareErrors(errors) {
  if (!errors || !errors.length) return 'Payment processing error';

  const map = {
    CARD_DECLINED: 'Your card was declined. Please try a different card or contact your bank.',
    CVV_FAILURE: 'Incorrect CVV. Please check the security code on your card.',
    INVALID_EXPIRATION: 'Invalid expiry date. Please check your card.',
    INVALID_CARD: 'Invalid card details. Please check and try again.',
    ADDRESS_VERIFICATION_FAILURE: 'Address verification failed. Please check your billing details.',
    PAN_FAILURE: 'Invalid card number. Please check and try again.',
    EXPIRATION_FAILURE: 'Your card has expired. Please use a different card.',
    INSUFFICIENT_FUNDS: 'Insufficient funds. Please try a different card.',
    GENERIC_DECLINE: 'Your card was declined. Please contact your bank or try another card.',
    INVALID_FEES: 'Payment amount is invalid.',
    PAYMENT_LIMIT_EXCEEDED: 'Payment limit exceeded. Please contact support.',
  };

  const messages = errors.map((e) => {
    const code = e.code || e.category || '';
    return map[code] || e.detail || `Payment error: ${code || 'Unknown'}`;
  });

  return [...new Set(messages)].join(' ');
}

async function resolveLocation() {
  if (cachedLocationId && cachedCurrency) {
    return { locationId: cachedLocationId, currency: cachedCurrency };
  }

  const envLocation = (process.env.SQUARE_LOCATION_ID || '').trim();
  const envCurrency = (process.env.SQUARE_CURRENCY || '').trim();

    if (envLocation) {
    cachedLocationId = envLocation;
    cachedCurrency = envCurrency || 'AUD';
    return { locationId: cachedLocationId, currency: cachedCurrency };
  }

  try {
    const response = await axios.get(`${SQUARE_BASE_URL}/v2/locations`, {
      headers: squareHeaders(),
    });
    const locations = response.data?.locations || [];
    const active = locations.find((l) => l.status === 'ACTIVE') || locations[0];
    if (!active?.id) {
      throw new Error('No Square locations found for this account');
    }
    cachedLocationId = active.id;
    // Prefer the location's currency — Square rejects mismatches
    cachedCurrency = active.currency || envCurrency || 'AUD';
    console.log(`[Square] Location resolved: ${cachedLocationId} (${cachedCurrency})`);
    return { locationId: cachedLocationId, currency: cachedCurrency };
  } catch (error) {
    console.error('[Square] Failed to resolve location:', error.response?.data || error.message);
    throw error;
  }
}

async function callSquareCreatePayment(body) {
  const response = await axios.post(`${SQUARE_BASE_URL}/v2/payments`, body, {
    headers: squareHeaders(),
  });
  return response.data;
}

async function callSquareRefund(body) {
  const response = await axios.post(`${SQUARE_BASE_URL}/v2/refunds`, body, {
    headers: squareHeaders(),
  });
  return response.data;
}

// ============================================
// 0. SQUARE PUBLIC CONFIG (for Web Payments SDK)
// ============================================
exports.getSquareConfig = async (req, res) => {
  try {
    const applicationId = (process.env.SQUARE_APPLICATION_ID || '').trim();
    if (!applicationId) {
      return res.status(500).json({
        success: false,
        message: 'Square application ID is not configured',
      });
    }

    const { locationId, currency } = await resolveLocation();

    return res.json({
      success: true,
      applicationId,
      locationId,
      currency,
      environment: IS_PRODUCTION ? 'production' : 'sandbox',
    });
  } catch (error) {
    const detail = error.response?.data?.errors
      ? translateSquareErrors(error.response.data.errors)
      : error.message;
    return res.status(500).json({
      success: false,
      message: detail || 'Unable to load Square payment configuration',
    });
  }
};

// ============================================
// 1. CREATE PAYMENT (Square source / card token)
// ============================================
exports.createPayment = async (req, res) => {
  let payment;
  try {
    const {
      amount,
      email,
      name,
      phone,
      sourceId,
      currency: requestedCurrency,
      userId,
      description,
      courseName,
      // Legacy eWay fields — reject raw cards (PCI)
      cardNumber,
      cvv,
    } = req.body;

    if (cardNumber || cvv) {
      return res.status(400).json({
        success: false,
        message: 'Card details must be tokenized via Square. Please refresh and try again.',
      });
    }

    if (!sourceId) {
      return res.status(400).json({
        success: false,
        message: 'Payment token is missing. Please enter your card details and try again.',
      });
    }

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount.',
      });
    }

    const { locationId, currency: locationCurrency } = await resolveLocation();
    const currency = (requestedCurrency || locationCurrency || 'AUD').toUpperCase();

    payment = new Payment({
      transactionId: `sq_${Date.now()}`,
      userId: userId || phone || email || 'guest',
      amount: numericAmount,
      currency,
      paymentMethod: 'square',
      description: description || `Payment by ${name || 'customer'} - ${email || ''}`,
      status: 'pending',
    });
    await payment.save();

    const idempotencyKey = crypto.randomUUID();
    const amountCents = Math.round(numericAmount * 100);

    const requestBody = {
      source_id: sourceId,
      idempotency_key: idempotencyKey,
      amount_money: {
        amount: amountCents,
        currency,
      },
      location_id: locationId,
      autocomplete: true,
      note: description || `Enrollment payment${courseName ? `: ${courseName}` : ''}`,
      buyer_email_address: email || undefined,
    };

    console.log('[Square] createPayment:', {
      amount: numericAmount,
      currency,
      locationId,
      email,
      name,
      sourceId: `${String(sourceId).slice(0, 8)}...`,
    });

    const squareResponse = await callSquareCreatePayment(requestBody);
    const sqPayment = squareResponse.payment;

    const status = (sqPayment?.status || '').toUpperCase();
    const isApproved = status === 'COMPLETED' || status === 'APPROVED';

    const gatewayTxId = sqPayment?.id || '';
    payment.gatewayTransactionId = gatewayTxId;
    payment.status = isApproved ? 'completed' : 'failed';
    payment.authorizationCode = sqPayment?.card_details?.auth_result_code || '';
    payment.cardType = sqPayment?.card_details?.card?.card_brand || '';
    payment.maskedCardNumber = sqPayment?.card_details?.card?.last_4
      ? `****${sqPayment.card_details.card.last_4}`
      : '';
    payment.gatewayResponse = {
      status: sqPayment?.status,
      receiptUrl: sqPayment?.receipt_url,
      orderId: sqPayment?.order_id,
    };
    await payment.save();

    console.log('[Square] Response:', {
      id: gatewayTxId,
      status: sqPayment?.status,
      approved: isApproved,
    });

    return res.json({
      success: isApproved,
      transactionId: payment.transactionId,
      gatewayTransactionId: gatewayTxId,
      status: payment.status,
      order: isApproved
        ? {
            transactionId: payment.transactionId,
            amount: numericAmount,
            currency,
            courseName: courseName || description || '',
            email,
            name,
          }
        : null,
      message: isApproved
        ? 'Payment successful'
        : `Payment ${status || 'failed'}. Please try again or use a different card.`,
    });
  } catch (error) {
    const squareErrors = error.response?.data?.errors;
    const statusCode = error.response?.status || 500;

    console.error(
      `Square Payment Error [${statusCode}]:`,
      JSON.stringify(squareErrors || error.message, null, 2)
    );

    if (payment) {
      payment.status = 'failed';
      payment.gatewayResponse = error.response?.data || { message: error.message };
      await payment.save();
    }

    return res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
      success: false,
      message: squareErrors
        ? translateSquareErrors(squareErrors)
        : error.message || 'Payment processing error',
      details: squareErrors || undefined,
    });
  }
};

// ============================================
// 2. CREATE PAYMENT WITH TOKEN (same as create — Square nonce)
// ============================================
exports.createPaymentWithToken = async (req, res) => {
  req.body.sourceId = req.body.sourceId || req.body.paymentToken;
  return exports.createPayment(req, res);
};

// ============================================
// 3. CREATE PAYMENT TOKEN — not used with Square Web Payments
// ============================================
exports.createPaymentToken = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Card tokenization is handled by Square Web Payments on the client.',
  });
};

// ============================================
// 4. REFUND PAYMENT
// ============================================
exports.refundPayment = async (req, res) => {
  try {
    const { transactionId, refundAmount } = req.body;
    const payment = await Payment.findOne({ transactionId });

    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'completed') {
      return res.status(400).json({ error: 'Cannot refund non-completed payment' });
    }
    if (!payment.gatewayTransactionId) {
      return res.status(400).json({ error: 'Missing Square payment id for refund' });
    }

    const amount = refundAmount || payment.amount;
    const body = {
      idempotency_key: crypto.randomUUID(),
      payment_id: payment.gatewayTransactionId,
      amount_money: {
        amount: Math.round(parseFloat(amount) * 100),
        currency: payment.currency || 'AUD',
      },
    };

    const refundResponse = await callSquareRefund(body);
    const refund = refundResponse.refund;
    const status = (refund?.status || '').toUpperCase();
    const isApproved = status === 'COMPLETED' || status === 'PENDING';

    if (isApproved) {
      payment.status = 'refunded';
      payment.updatedAt = new Date();
      await payment.save();

      return res.json({
        success: true,
        transactionId: payment.transactionId,
        refundTransactionId: refund?.id || '',
        refundAmount: amount,
      });
    }

    return res.status(400).json({
      success: false,
      error: `Refund ${status || 'failed'}`,
    });
  } catch (error) {
    console.error('Refund Error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.errors
        ? translateSquareErrors(error.response.data.errors)
        : error.message,
    });
  }
};

// ============================================
// 5. GET PAYMENT DETAILS
// ============================================
exports.getPaymentDetails = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const payment = await Payment.findOne({ transactionId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// 6. GET PAYMENT HISTORY
// ============================================
exports.getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
