const express = require("express")
const router = express.Router()
const { verifyAdmin } = require("../middleware/authMiddleware")
const { uploadCodeOfPractice } = require("../middleware/upload")

const handleUpload = (req, res, next) => {
  uploadCodeOfPractice.fields([
    { name: "file", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Upload failed.",
      })
    }
    next()
  })
}

const {
  getPublic,
  getBySlug,
  getAll,
  create,
  update,
  toggleActive,
  remove,
  reorder,
} = require("../controllers/codeOfPracticeController")

router.get("/public", getPublic)
router.get("/public/:slug", getBySlug)
router.get("/", verifyAdmin, getAll)
router.put("/reorder/all", verifyAdmin, reorder)
router.post("/", verifyAdmin, handleUpload, create)
router.put("/:id", verifyAdmin, handleUpload, update)
router.patch("/:id/toggle-active", verifyAdmin, toggleActive)
router.delete("/:id", verifyAdmin, remove)

module.exports = router