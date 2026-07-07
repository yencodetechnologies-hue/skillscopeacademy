const express = require("express")
const router  = express.Router()

const { uploadPartner } = require("../middleware/upload")
const {
  getAll,
  getOne,
  create,
  update,
  toggleActive,
  remove,
  reorder,
} = require("../controllers/partnerController")

router.get("/",                    getAll)
// /reorder/all MUST be registered BEFORE /:id, otherwise Express treats
// "reorder" as an ObjectId param and the wrong handler runs.
router.put("/reorder/all",         reorder)
router.get("/:id",                 getOne)
router.post("/",                   uploadPartner.single("image"), create)
router.put("/:id",                 uploadPartner.single("image"), update)
router.patch("/:id/toggle-active", toggleActive)
router.delete("/:id",              remove)

module.exports = router
