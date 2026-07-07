const express = require("express")
const router = express.Router()
const { uploadCourse } = require("../middleware/upload")
const parseFormData = require("../middleware/parseFormData")

const {
    createCourse,
    getCourses,
    deleteCourse,
    updateCourse,
    getCourseById,
    getCourseBySlug,
    checkSlugAvailability,
    reorderCourses,
} = require("../controllers/courseController")

router.get("/", getCourses)
router.put("/reorder/all", reorderCourses)
router.get("/slug-available/:slug", checkSlugAvailability)
router.get("/slug/:slug", getCourseBySlug)

router.post("/", uploadCourse.fields([
    { name: "image",            maxCount: 1 },
    { name: "handbookPdf",      maxCount: 1 },
    { name: "handbookCardImage",maxCount: 1 },
    { name: "syllabusPdf",      maxCount: 1 }
]), parseFormData, createCourse)

router.put("/:id", uploadCourse.fields([
    { name: "image",            maxCount: 1 },
    { name: "handbookPdf",      maxCount: 1 },
    { name: "handbookCardImage",maxCount: 1 },
    { name: "syllabusPdf",      maxCount: 1 }
]), parseFormData, updateCourse)

router.delete("/:id", deleteCourse)
router.get("/:id", getCourseById)

module.exports = router