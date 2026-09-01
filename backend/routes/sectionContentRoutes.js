// routes/sectionContentRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllQuickFacts,
  getQuickFactById,
  updateQuickFact,
} = require("../controllers/SectionContentController");

router.get("/quick-facts/all", getAllQuickFacts);
router.get("/quick-facts/:id", getQuickFactById);
router.put("/quick-facts/:id", updateQuickFact);

module.exports = router;