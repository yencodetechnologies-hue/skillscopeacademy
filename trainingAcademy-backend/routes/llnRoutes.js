const express = require("express");
const router = express.Router();
const { saveLLN, getAllLLN } = require("../controllers/llndController");

router.post("/:studentId/:courseId", saveLLN);
router.get("/", getAllLLN);

module.exports = router;