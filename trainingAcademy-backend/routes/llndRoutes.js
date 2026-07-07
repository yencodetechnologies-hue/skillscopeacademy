const express = require("express");
const router = express.Router();
const { saveLLND ,getAllLLND} = require("../controllers/llndController");

router.post("/:studentId/:courseId", saveLLND);
router.get("/", getAllLLND);

module.exports = router;