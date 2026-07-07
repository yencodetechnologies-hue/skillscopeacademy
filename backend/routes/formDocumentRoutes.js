const express = require("express")
const router = express.Router()
const { verifyAdmin } = require("../middleware/authMiddleware")
const { uploadFormDocument } = require("../middleware/upload")

const handleUpload = (req, res, next) => {
  uploadFormDocument.fields([
    { name: "file", maxCount: 1 },   // the PDF
    { name: "bannerImage", maxCount: 1 }, // optional cover image, featured card only
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
  getAll,
  create,
  update,
  toggleActive,
  remove,
  reorder,
} = require("../controllers/formDocumentController")

router.get("/public", getPublic)
router.get("/", verifyAdmin, getAll)
router.put("/reorder/all", verifyAdmin, reorder)
router.post("/", verifyAdmin, handleUpload, create)
router.put("/:id", verifyAdmin, handleUpload, update)
router.patch("/:id/toggle-active", verifyAdmin, toggleActive)
router.delete("/:id", verifyAdmin, remove)

module.exports = router