const express = require("express")
const router  = express.Router()

// உங்கள் existing upload middleware-ல் இருந்து uploadGallery import பண்ணுங்க
const { uploadGallery } = require("../middleware/upload")

const {
  getAll,
  getOne,
  create,
  update,
  toggleActive,
  remove,
} = require("../controllers/galleryController")

router.get("/",                    getAll)
router.get("/:id",                 getOne)
router.post("/",                   uploadGallery.single("image"), create)
router.put("/:id",                 uploadGallery.single("image"), update)
router.patch("/:id/toggle-active", toggleActive)
router.delete("/:id",              remove)

module.exports = router