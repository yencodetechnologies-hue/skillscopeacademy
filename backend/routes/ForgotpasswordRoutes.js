const express = require("express");
const router = express.Router();
const { forgotPassword } = require("../controllers/authController"); // adjust path

router.post("/forgot-password", forgotPassword);

module.exports = router;