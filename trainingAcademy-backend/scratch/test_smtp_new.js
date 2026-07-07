require("dotenv").config();
const sendEmail = require("../config/sendEmail");

async function test() {
  try {
    console.log("Starting SMTP test...");
    await sendEmail({
      to: "irina@example.com", // Placeholder
      subject: "SMTP Test",
      html: "<h1>Test</h1>"
    });
    console.log("Test finished.");
  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

test();
