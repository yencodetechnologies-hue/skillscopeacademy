const express = require("express")
const router = express.Router()
const { verifyAdmin } = require("../middleware/authMiddleware")

const { uploadSiteBanner } = require("../middleware/upload")

const handleUpload = (req, res, next) => {
  uploadSiteBanner.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Image upload failed.",
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
} = require("../controllers/siteBannerController")

router.get("/public", getPublic)
router.get("/", verifyAdmin, getAll)
router.put("/reorder/all", verifyAdmin, reorder)
router.post("/", verifyAdmin, handleUpload, create)
router.put("/:id", verifyAdmin, handleUpload, update)
router.patch("/:id/toggle-active", verifyAdmin, toggleActive)
router.delete("/:id", verifyAdmin, remove)

module.exports = router
