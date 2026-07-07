require('dotenv').config();
const sendEmail = require('../config/sendEmail');

async function test() {
    console.log("NOTIFY_EMAIL:", process.env.NOTIFY_EMAIL);
    console.log("BOOKINGS_EMAIL:", process.env.BOOKINGS_EMAIL);
    try {
        await sendEmail({ 
            to: process.env.NOTIFY_EMAIL, 
            subject: "Test Email from System", 
            html: "<h1>System Test</h1><p>Testing direct send to NOTIFY_EMAIL.</p>" 
        });
        console.log("SUCCESS");
    } catch (err) {
        console.error("FAILED:", err.message);
    }
}
test();
