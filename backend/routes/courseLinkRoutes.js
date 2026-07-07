// routes/courseLinkRoutes.js

const express = require("express")
const router = express.Router()
const {
    generateLinks,
    validateLink,
    useLink,
    getLinksByPayment,
    getLinksByCompany,
} = require("../controllers/courseLinkController")

// ✅ Public — link validate (user clicks link)
router.get("/validate/:token", validateLink)

// ✅ Public — generate links after payment
router.post("/generate", generateLinks)

// ✅ Public — use a link after enrollment
router.patch("/use/:token", useLink)

// courseLinkRoutes.js-ல் add பண்ணு
router.get("/company/:companyId", getLinksByCompany)
router.get("/payment/:paymentId", getLinksByPayment)

module.exports = router

