require("dns").setServers(["8.8.8.8"]);
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const { login } = require("../controllers/authController");

async function runTest() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not defined");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB!");

    // Mock Express Request
    const req = {
      body: {
        email: "Info@safetytrainingacademy.edu.au",
        password: "Safety45234@"
      }
    };

    // Mock Express Response
    const res = {
      statusCode: 200,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        console.log(`\nResponse Code: ${this.statusCode}`);
        console.log("Response Data:", JSON.stringify(data, null, 2));
        mongoose.connection.close();
        process.exit(0);
      }
    };

    console.log("Running login controller with email:", req.body.email);
    await login(req, res);

  } catch (err) {
    console.error("Test Error:", err);
    process.exit(1);
  }
}

runTest();
