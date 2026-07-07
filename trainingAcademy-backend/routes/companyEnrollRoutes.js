const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Company = require("../models/Company");
const Course = require("../models/Course");

// 🔥 CHECK ROLE API
router.get("/check-role", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "ID required" });
    }
    let user = await User.findById(id);
    if (!user) {
      user = await Company.findById(id);
    }
     if (!user) {
      user = await Course.findById(id);
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      role: user.role,
      name: user.name || user.companyName || "",
      user :user
    });

  } catch (err) {
    console.log("CHECK ROLE ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;