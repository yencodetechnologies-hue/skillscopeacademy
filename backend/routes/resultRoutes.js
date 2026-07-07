const express = require("express");
const router = express.Router();
const {
  getStudentResults,
  createResult,
  updateResult,
  deleteResult
} = require("../controllers/resultController");

router.get("/student/:studentId", getStudentResults);  // Student
router.post("/", createResult);                         // Admin create
router.patch("/:id", updateResult);                     // Admin update
router.delete("/:id", deleteResult);                    // Admin delete

module.exports = router;