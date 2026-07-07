const express = require("express");
const router = express.Router();
const {
    sendBookingConfirmation,
    sendCompanyOrderConfirmation,
    sendEnrollmentLinkConfirmation,
    sendCompanyPortalWelcome,
    sendVOCConfirmation,
    sendEmailOTP,
    sendCompanyBankTransfer,
    sendCompanyCardPayment,
} = require("../controllers/bookingEmailController");

router.post("/send-confirmation",     sendBookingConfirmation);       // Individual booking
router.post("/company-order",         sendCompanyOrderConfirmation);  // Company bulk booking
router.post("/enrollment-link",       sendEnrollmentLinkConfirmation);// Company link student
router.post("/company-welcome",       sendCompanyPortalWelcome);      // Company portal welcome
router.post("/voc-confirmation",      sendVOCConfirmation);           // VOC submission
router.post("/send-otp",              sendEmailOTP);                  // OTP verify
router.post("/company-bank-transfer", sendCompanyBankTransfer);       // Bank transfer notice
router.post("/company-card-payment",  sendCompanyCardPayment);        // Card payment notice

module.exports = router;