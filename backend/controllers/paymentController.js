const axios = require('axios');
const Payment = require('../models/Payment');

const EWAY_ENV = (process.env.EWAY_ENVIRONMENT || 'Sandbox').trim();
const IS_PRODUCTION = EWAY_ENV.toLowerCase() === 'production';

const EWAY_BASE_URL = IS_PRODUCTION
  ? 'https://api.ewaypayments.com'
  : 'https://api.sandbox.ewaypayments.com';

console.log(`[eWAY] Initialize: Environment=${EWAY_ENV}, URL=${EWAY_BASE_URL}`);

function getEwayAuthHeader() {
  const apiKey = (process.env.EWAY_API_KEY || '').trim();
  const apiPassword = (process.env.EWAY_API_PASSWORD || '').trim();
  
  if (!apiKey || !apiPassword) {
    console.error('CRITICAL: eWAY API credentials missing in environment variables');
  } else {
    console.log(`[eWAY] Credentials loaded: Key(${apiKey.length} chars, starts with ${apiKey.slice(0, 5)}...), Pass(${apiPassword.length} chars)`);
  }

  const credentials = Buffer.from(`${apiKey}:${apiPassword}`).toString('base64');
  return `Basic ${credentials}`;
}

async function callEwayTransaction(requestData) {
  try {
    const response = await axios.post(
      `${EWAY_BASE_URL}/Transaction`,
      requestData,
      {
        headers: {
          Authorization: getEwayAuthHeader(),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    // Re-throw with more context
    if (error.response) {
      const ewayErr = new Error(`eWAY API Error: ${error.response.status}`);
      ewayErr.response = error.response;
      throw ewayErr;
    }
    throw error;
  }
}

function getFirstName(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(' ');
  return parts[0];
}

function getLastName(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(' ');
  return parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
}

function randomInvoiceNumber() {
  return String(Math.floor(Math.random() * 90000000) + 10000000);
}

function translateEwayErrors(errors) {
  if (!errors) return 'Payment processing error';
  
  const errorMap = {
    'V6000': 'Validation error. Please check your information.',
    'V6021': 'Invalid cardholder name. Please enter the name exactly as it appears on your card.',
    'V6022': 'Invalid card number. Please check your 16-digit card number.',
    'V6023': 'Invalid CVN (the 3 digits on the back of your card).',
    'V6040': 'Invalid expiry month. Please check your card.',
    'V6041': 'Invalid expiry year. Please check your card.',
    'V6042': 'Invalid expiry month. Please check your card.',
    'V6043': 'Invalid expiry year. Please check your card.',
    'V6044': 'Your card has expired. Please use a different card.',
    'V6045': 'Invalid CVN (the 3 digits on the back of your card).',
    'V6153': 'Invalid CVN (the 3 digits on the back of your card). Please check and try again.',
    'V6011': 'Invalid amount.',
    'V6012': 'Invalid amount.',
    'V6013': 'Invalid invoice number.',
    'V6014': 'Invalid invoice reference.',
    'V6081': 'Invalid CVN.',
    'V6082': 'Invalid CVN.',
  };

  const codes = String(errors).split(',').map(c => c.trim());
  const messages = codes.map(code => errorMap[code] || `Error ${code}: Please check your card details.`);
  
  // Return unique messages
  return [...new Set(messages)].join(' ');
}

// ============================================
// 1. CREATE PAYMENT (Direct Card)
exports.createPayment = async (req, res) => {
  let payment;
  try {
    const {
      amount, email, name, phone,
      cardName, cardNumber, expiryMonth, expiryYear, cvv,
      currency = 'AUD', userId, description,
      courseName, // ADDED: for GTM tracking
    } = req.body;

    // Log request (sanitize card)
    console.log('[eWAY] createPayment called:', {
      amount, email, name, phone, cardName, 
      cardNumber: cardNumber ? 'XXXX...' : 'missing',
      expiryMonth, expiryYear, cvv: cvv ? 'XXX' : 'missing',
      userId, description
    });

    const numericAmount = parseFloat(amount); // CHANGE 2: store as number

    payment = new Payment({
      transactionId: `eway_${Date.now()}`,
      userId: userId || phone,
      amount: numericAmount,
      currency,
      paymentMethod: 'eway',
      description: description || `Payment by ${name} - ${email}`,
      status: 'pending',
    });
    await payment.save();

    const invoiceNumber = randomInvoiceNumber();

    const requestData = {
      Customer: {
        Reference: email,
        Email: email,
        FirstName: getFirstName(name),
        LastName: getLastName(name),
        Phone: phone,
        CardDetails: {
          Name: cardName,
          Number: String(cardNumber).replace(/\s/g, ''),
          ExpiryMonth: String(expiryMonth).padStart(2, '0'),
          ExpiryYear: String(expiryYear).slice(-2),
          CVN: cvv,
        },
      },
      Payment: {
        TotalAmount: Math.round(numericAmount * 100),
        InvoiceNumber: invoiceNumber,
        InvoiceDescription: `Payment by ${name}`,
        InvoiceReference: `INV-${invoiceNumber}`,
        CurrencyCode: currency,
      },
      TransactionType: 'Purchase',
      Method: 'ProcessPayment',
    };

    // Sanitize request for logging
    const logRequest = { ...requestData, Customer: { ...requestData.Customer, CardDetails: { ...requestData.Customer.CardDetails, Number: 'XXXX-XXXX-XXXX-' + requestData.Customer.CardDetails.Number.slice(-4), CVN: 'XXX' } } };
    console.log('[eWAY] Request:', JSON.stringify(logRequest, null, 2));

    const ewayResponse = await callEwayTransaction(requestData);

    console.log('[eWAY] Response:', JSON.stringify({
      TransactionID: ewayResponse.TransactionID,
      TransactionStatus: ewayResponse.TransactionStatus,
      ResponseCode: ewayResponse.ResponseCode,
      ResponseMessage: ewayResponse.ResponseMessage,
      Errors: ewayResponse.Errors
    }, null, 2));

    if (ewayResponse.Errors) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({
        success: false,
        message: translateEwayErrors(ewayResponse.Errors),
      });
    }

    // STRICT CHECK: TransactionStatus must be true AND ResponseCode must be "00" (Approved)
    const isApproved = ewayResponse.TransactionStatus === true && ewayResponse.ResponseCode === '00';

    const gatewayTxId = ewayResponse.TransactionID != null
      ? String(ewayResponse.TransactionID)
      : '';
    payment.gatewayTransactionId = gatewayTxId;
    payment.status = isApproved ? 'completed' : 'failed';
    payment.authorizationCode = ewayResponse.AuthorisationCode || '';
    await payment.save();

    return res.json({
      success: isApproved,
      transactionId: payment.transactionId,
      gatewayTransactionId: gatewayTxId,
      status: payment.status,
      order: isApproved ? {
        transactionId: payment.transactionId,
        amount: numericAmount,
        currency,
        courseName: courseName || description || '',
        email,
        name,
      } : null,
      message: isApproved
        ? 'Payment successful'
        : `Payment declined: ${ewayResponse.ResponseCode} - ${ewayResponse.ResponseMessage || 'Declined by bank'}`,
    });
  } catch (error) {
    const ewayErrorResponse = error.response?.data;
    const statusCode = error.response?.status || 500;
    
    console.error(`eWAY Payment Error [${statusCode}]:`, JSON.stringify(ewayErrorResponse || error.message, null, 2));

    if (payment) {
      payment.status = 'failed';
      await payment.save();
    }

    const errorMsg = ewayErrorResponse?.Errors 
      ? `Payment gateway error: ${ewayErrorResponse.Errors}`
      : (error.message || 'Payment processing error');

    return res.status(statusCode).json({ 
      success: false, 
      message: errorMsg,
      details: ewayErrorResponse 
    });
  }
};

// ============================================
// 2. CREATE PAYMENT WITH TOKEN (Saved Card)
// ============================================
exports.createPaymentWithToken = async (req, res) => {
  let payment;
  try {
    const { amount, currency = 'AUD', userId, description, paymentToken } = req.body;

    payment = new Payment({
      transactionId: `eway_${Date.now()}`,
      userId,
      amount,
      currency,
      paymentMethod: 'eway',
      description,
      status: 'pending',
    });
    await payment.save();

    const requestData = {
      Customer: { TokenCustomerID: paymentToken },
      Payment: {
        TotalAmount: Math.round(parseFloat(amount) * 100),
        InvoiceDescription: description,
        CurrencyCode: currency,
      },
      Method: 'TokenPayment',
      TransactionType: 'Purchase',
    };

    // Sanitize request for logging
    console.log('[eWAY Token Payment] Request:', JSON.stringify({ ...requestData, Customer: { TokenCustomerID: 'XXXXXX' } }, null, 2));

    const ewayResponse = await callEwayTransaction(requestData);

    console.log('[eWAY Token Payment] Response:', JSON.stringify({
      TransactionID: ewayResponse.TransactionID,
      TransactionStatus: ewayResponse.TransactionStatus,
      ResponseCode: ewayResponse.ResponseCode,
      ResponseMessage: ewayResponse.ResponseMessage,
      Errors: ewayResponse.Errors
    }, null, 2));

    if (ewayResponse.Errors) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({
        success: false,
        transactionId: payment.transactionId,
        message: translateEwayErrors(ewayResponse.Errors),
      });
    }

    // STRICT CHECK
    const isApproved = ewayResponse.TransactionStatus === true && ewayResponse.ResponseCode === '00';

    payment.gatewayTransactionId = String(ewayResponse.TransactionID || '');
    payment.status = isApproved ? 'completed' : 'failed';
    payment.authorizationCode = ewayResponse.AuthorisationCode || '';
    await payment.save();

    return res.json({
      success: isApproved,
      transactionId: payment.transactionId,
      status: payment.status,
      message: isApproved ? 'Payment successful' : `Payment declined: ${ewayResponse.ResponseCode} - ${ewayResponse.ResponseMessage || 'Declined by bank'}`,
    });
  } catch (error) {
    console.error('Token Payment Error:', error.response?.data || error.message);
    if (payment) {
      payment.status = 'failed';
      await payment.save();
    }
    return res.status(500).json({
      success: false,
      message: error.response?.data?.Errors || error.message,
    });
  }
};

// ============================================
// 3. CREATE PAYMENT TOKEN (Save Card)
// ============================================
exports.createPaymentToken = async (req, res) => {
  try {
    const { cardNumber, cardExpiryMonth, cardExpiryYear, cvv, cardHolderName } = req.body;

    const requestData = {
      Customer: {
        CardDetails: {
          Name: cardHolderName,
          Number: String(cardNumber).replace(/\s/g, ''),
          ExpiryMonth: String(cardExpiryMonth).padStart(2, '0'),
          ExpiryYear: String(cardExpiryYear).slice(-2),
          CVN: cvv,
        },
      },
      Method: 'CreateTokenCustomer',
      TransactionType: 'Purchase',
    };

    console.log('[eWAY Create Token] Request: (Card details hidden)');

    const ewayResponse = await callEwayTransaction(requestData);

    console.log('[eWAY Create Token] Response:', JSON.stringify({
      TransactionStatus: ewayResponse.TransactionStatus,
      ResponseCode: ewayResponse.ResponseCode,
      ResponseMessage: ewayResponse.ResponseMessage,
      Errors: ewayResponse.Errors
    }, null, 2));

    if (ewayResponse.Errors) {
      return res.status(400).json({ success: false, error: translateEwayErrors(ewayResponse.Errors) });
    }

    const isSuccess = ewayResponse.TransactionStatus === true || ewayResponse.ResponseCode === '00';

    if (!isSuccess) {
      return res.status(400).json({ 
        success: false, 
        message: `Token creation failed: ${ewayResponse.ResponseCode} - ${ewayResponse.ResponseMessage}` 
      });
    }

    return res.json({
      success: true,
      paymentToken: ewayResponse.Customer?.TokenCustomerID,
      cardType: ewayResponse.CardType || '',
      maskedCardNumber: ewayResponse.Customer?.CardDetails?.Number || '',
    });
  } catch (error) {
    console.error('Token Creation Error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.Errors || error.message,
    });
  }
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

    const requestData = {
      Refund: {
        TotalAmount: Math.round((refundAmount || payment.amount) * 100),
        TransactionID: payment.gatewayTransactionId,
      },
    };

    const ewayResponse = await callEwayTransaction(requestData);

    if (ewayResponse.Errors) {
      return res.status(400).json({ success: false, error: ewayResponse.Errors });
    }

    const isApproved = ewayResponse.TransactionStatus === true;
    if (isApproved) {
      payment.status = 'refunded';
      payment.updatedAt = new Date();
      await payment.save();

      return res.json({
        success: true,
        transactionId: payment.transactionId,
        refundTransactionId: String(ewayResponse.TransactionID || ''),
        refundAmount: refundAmount || payment.amount,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: ewayResponse.ResponseMessage,
      });
    }
  } catch (error) {
    console.error('Refund Error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.Errors || error.message,
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