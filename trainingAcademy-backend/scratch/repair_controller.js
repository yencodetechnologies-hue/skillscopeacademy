const fs = require('fs');
const p = 'c:/Users/irina/OneDrive/Desktop/safetytrainingacademy/safetytrainingacademy/trainingAcademy-backend/controllers/bookingEmailController.js';
let c = fs.readFileSync(p, 'utf8');

const start = c.indexOf('const sendBookingConfirmation = async');
const end = c.indexOf('const sendCompanyOrderConfirmation = async');

if (start > -1 && end > -1) {
    const fix = `const sendBookingConfirmation = async (req, res) => {
    const { name, email, phone, mobile, mobileNumber, mobilePhone, courseName, courseCode, courseDate, startTime, endTime, coursePrice, paymentMethod, gatewayTransactionId, bankTransferId } = req.body;

    const finalPhone = phone || mobile || mobileNumber || mobilePhone || "";
    const orderId = formatBookingId(Date.now().toString());
    const orderDateStr = new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Australia/Sydney" });

    const studentHtml = buildStudentHtml({
        orderId, student: { firstName: name.split(" ")[0] },
        course: { name: courseName, code: courseCode, deliveryMode: "Face to Face", date: new Date(courseDate).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Sydney" }), time: \`\${startTime} - \${endTime}\`, venue: "3/14-16 Marjorie Street, Sefton NSW 2162" },
        payment: { items: [{ label: courseName, amount: Number(coursePrice).toFixed(2) }], total: Number(coursePrice).toFixed(2), method: paymentMethod },
        portal: { url: "https://www.safetytrainingacademy.edu.au/login" }
    });

    const adminMailData = { bookingId: orderId, paymentMethod, bankTransferId: bankTransferId || "—", gatewayId: gatewayTransactionId || null, contactName: name, contactEmail: email, contactPhone: finalPhone || "—", totalAmount: Number(coursePrice).toFixed(2), submittedAt: orderDateStr, courseName, courseCode, deliveryMode: "Face to Face", courseDate: courseDate ? new Date(courseDate).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Sydney" }) : "To be confirmed", courseTime: \`\${startTime} - \${endTime}\`, venue: "3/14-16 Marjorie Street, Sefton NSW 2162", notes: null, studentPortalUrl: "https://www.safetytrainingacademy.edu.au/login", adminUrl: "https://admin.safetytrainingacademy.edu.au" };

    try {
        try { 
            await sendEmail({ 
                to: process.env.BOOKINGS_EMAIL, 
                subject: \`New Booking #\${orderId} - \${name} - \${courseName}\`, 
                html: adminBookingTemplate(adminMailData) 
            }); 
            console.log("✅ Admin email sent"); 
        } catch (e) { 
            console.error("❌ Admin email failed", e.message); 
        }
        await sendEmail({ 
            to: email, 
            subject: \`Booking Confirmed - \${courseName} (Order #\${orderId})\`, 
            html: studentHtml 
        }); 
        console.log("✅ Student email sent");
        res.status(200).json({ success: true });
    } catch (err) { 
        console.error("❌ Process error", err.message); 
        res.status(500).json({ success: false }); 
    }
};\n\n`;
    c = c.substring(0, start) + fix + c.substring(end);
    fs.writeFileSync(p, c, 'utf8');
    console.log('Successfully repaired');
} else {
    console.log('Patterns not found');
}
