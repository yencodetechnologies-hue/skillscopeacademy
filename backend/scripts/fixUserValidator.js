/**
 * Run once: node scripts/fixUserValidator.js
 *
 * This removes the stale MongoDB JSON schema validator from the "users"
 * collection that was set when the role enum was smaller (e.g. only
 * ["student","admin"] or similar). After running this, all role values
 * that Mongoose allows ("Student","Teacher","Admin","Company") will work.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  try {
    const result = await mongoose.connection.db.command({
      collMod: "users",
      validator: {},          // empty validator = no DB-level validation
      validationLevel: "off", // turn off DB-level validation entirely
      validationAction: "warn"
    });
    console.log("✅ users collection validator cleared:", result.ok === 1 ? "success" : result);
  } catch (err) {
    if (err.codeName === "NamespaceNotFound") {
      console.log("ℹ️  users collection does not exist yet — no fix needed");
    } else {
      console.error("❌ Error:", err.message);
    }
  }

  await mongoose.disconnect();
  console.log("Done. Restart your backend server.");
}

fix();