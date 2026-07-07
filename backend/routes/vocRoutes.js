const express = require("express")
const router = express.Router()
const controller = require("../controllers/vocController")
const { uploadPayment } = require("../middleware/upload")

// Public — submit a VOC application (with optional bank-receipt file).
router.post("/", uploadPayment.single("proof"), controller.createSubmission)

// Admin
router.get("/",         controller.listSubmissions)
router.get("/stats",    controller.getStats)
router.patch("/:id/status", controller.updateStatus)
router.delete("/:id",   controller.deleteSubmission)

module.exports = router
