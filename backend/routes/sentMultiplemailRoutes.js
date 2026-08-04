const express = require("express");
const router = express.Router();

const {
  sendMultipleMails,
} = require("../controllers/sendMultiplemailController");

// Send mail to multiple students
router.post("/", sendMultipleMails);

module.exports = router;