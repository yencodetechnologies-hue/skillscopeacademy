const express = require("express")
const router = express.Router()

const { getCourseEnrollmentCount } =
require("../controllers/enrollmentController")

router.get("/course/:courseId/count", getCourseEnrollmentCount)

module.exports = router