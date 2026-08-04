const express = require("express");
const router = express.Router();

const {
  getTemplates,
  toggleStatus,
} = require("../controllers/emailTemplateController");

router.get("/", getTemplates);

router.put("/toggle/:id", toggleStatus);

module.exports = router;