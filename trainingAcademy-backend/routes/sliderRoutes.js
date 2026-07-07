const express = require("express")
const router  = express.Router()

const { uploadSlider } = require("../middleware/upload")
const {
  getAll,
  getOne,
  create,
  update,
  toggleActive,
  remove,
  reorder,
} = require("../controllers/sliderController")

router.get("/",                    getAll)
// /reorder/all MUST be before /:id
router.put("/reorder/all",         reorder)
router.get("/:id",                 getOne)
router.post("/",                   uploadSlider.single("image"), create)
router.put("/:id",                 uploadSlider.single("image"), update)
router.patch("/:id/toggle-active", toggleActive)
router.delete("/:id",              remove)

module.exports = router
