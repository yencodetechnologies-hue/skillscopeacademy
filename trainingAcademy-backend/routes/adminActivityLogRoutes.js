const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const { getLogs } = require("../controllers/adminActivityLogController");

router.get("/", verifyAdmin, getLogs);

module.exports = router;
