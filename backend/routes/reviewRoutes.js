const express = require("express");
const router = express.Router();
const { getPublic, sync } = require("../controllers/reviewController");

router.get("/public", getPublic);
router.post("/sync", sync);

module.exports = router;
