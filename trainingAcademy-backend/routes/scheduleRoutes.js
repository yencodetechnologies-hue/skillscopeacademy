const express = require("express")
const router = express.Router()
const { verifyAdmin } = require("../middleware/authMiddleware")

const {
 createSchedule,
 getCourseSchedules,
 deleteSchedule,
 toggleSession,
 deleteSession,
 addSession,
 editSession,
 getUpcomingSessions,
 getActiveCoursIds
} = require("../controllers/scheduleController")


router.post("/", verifyAdmin, createSchedule)
router.get("/upcoming", getUpcomingSessions)
router.get("/active-course-ids", getActiveCoursIds)
router.post("/session", verifyAdmin, addSession)
router.get("/course/:courseId", getCourseSchedules)
router.patch("/session/:id", verifyAdmin, toggleSession)
router.delete("/session/:id", verifyAdmin, deleteSession)
router.delete("/:id", verifyAdmin, deleteSchedule)
router.patch("/session/:id/edit", verifyAdmin, editSession)


module.exports = router
