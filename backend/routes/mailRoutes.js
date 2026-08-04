const express = require("express");
const router = express.Router();
const mailController = require("../controllers/mailController");

// If you have authentication middleware, attach it here
// const { verifyToken } = require("../middleware/auth");

router.post("/", mailController.sendStudentMail);

module.exports = router;

