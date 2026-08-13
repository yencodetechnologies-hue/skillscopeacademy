const express = require("express");

const {
  createMarquee,
  getMarquees,
  getMarqueeById,
  updateMarquee,
  deleteMarquee,
  getActiveMarquee,
} = require("../controllers/marqueeController");

const router = express.Router();


// Get active marquee
router.get("/active", getActiveMarquee);


// Get all marquees
router.get("/", getMarquees);


// Get single marquee
router.get("/:id", getMarqueeById);


// Create
router.post("/", createMarquee);


// Update
router.put("/:id", updateMarquee);


// Delete
router.delete("/:id", deleteMarquee);


module.exports = router;