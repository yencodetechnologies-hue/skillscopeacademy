const fs = require('fs');
const path = 'c:/Users/irina/OneDrive/Desktop/safetytrainingacademy/safetytrainingacademy/trainingAcademy-backend/controllers/bookingEmailController.js';
let content = fs.readFileSync(path, 'utf8');

// The messy block in sendBookingConfirmation
const target = `    try {
        console.log("Student Recipient:", email);
        console.log("Order ID:", orderId);

                    html: adminBookingTemplate(adminMailData)
                });
                console.log(\`âœ… Academy notification sent to \${process.env.BOOKINGS_EMAIL}\`);
            } catch (academyErr) {
                console.error(\`â Œ Academy notification failed for \${process.env.BOOKINGS_EMAIL}:\`, academyErr.message);
            }
        }, 10000);`;

const replacement = `    try {
        console.log("--- Email Sending Diagnostics ---");
        console.log("Academy Recipient (BOOKINGS_EMAIL):", process.env.BOOKINGS_EMAIL);
        console.log("Student Recipient:", email);
        console.log("Order ID:", orderId);

        // 1. Send Academy Notification (Immediate)
        try {
            await sendEmail({
                to: process.env.BOOKINGS_EMAIL,
                subject: \`New Booking #\${orderId} - \${name} - \${courseName}\`,
                html: adminBookingTemplate(adminMailData)
            });
            console.log(\`✅ Academy notification sent to \${process.env.BOOKINGS_EMAIL}\`);
        } catch (academyErr) {
            console.error(\`❌ Academy notification failed for \${process.env.BOOKINGS_EMAIL}:\`, academyErr.message);
        }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully fixed the file.");
} else {
    console.error("Target content not found. File might have different encoding or characters.");
}
