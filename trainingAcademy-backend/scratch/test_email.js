const sendEmail = require("../config/sendEmail");
require("dotenv").config({ path: "../.env" });

async function testEmail() {
    try {
        console.log("Testing email to BOOKINGS_EMAIL:", process.env.BOOKINGS_EMAIL);
        await sendEmail({
            to: process.env.BOOKINGS_EMAIL,
            subject: "Test Email from Backend",
            html: "<h1>Test</h1><p>This is a test email to verify the BOOKINGS_EMAIL recipient.</p>"
        });
        console.log("Test email sent successfully.");
    } catch (err) {
        console.error("Test email failed:", err.message);
    }
}

testEmail();
