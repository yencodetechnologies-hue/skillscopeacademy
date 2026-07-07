const express = require("express");
const router = express.Router();
const {
  getStudentDashboard,
  getStudentProfile
} = require("../controllers/studentDashboardController");

router.get("/dashboard/:id", getStudentDashboard);
router.get("/profile/:id", getStudentProfile);
module.exports = router;