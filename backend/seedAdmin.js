const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Company = require("./models/Company");
require("dotenv").config();

const seedUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding...");

    const email = "info@safetytrainingacademy.edu.au";
    const password = "Safety45234@";
    const name = "Safety Training Academy Admin";

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if user already exists in User model
    let user = await User.findOne({ email });

    if (user) {
      console.log("User exists, updating password and role to Admin...");
      user.password = hashedPassword;
      user.role = "Admin";
      user.name = name;
      await user.save();
    } else {
      console.log("Creating new Admin user...");
      await User.create({
        name,
        email,
        password: hashedPassword,
        role: "Admin"
      });
    }

    console.log("Seed successful!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding user:", err);
    process.exit(1);
  }
};

seedUser();
