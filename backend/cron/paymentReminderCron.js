const cron = require("node-cron");

const EnrollmentFlow = require("../models/EnrollmentFlows");
const EmailTemplate = require("../models/EmailTemplate");
const sendEmail = require("../config/sendEmail");

console.log("💰 Payment Reminder Cron Loaded");

// Every 5 seconds (Testing)
//cron.schedule("*/5 * * * * *", async () => {

cron.schedule("0 9 * * *", async () => {

    console.log("==================================");
    console.log("💰 Payment Reminder Cron Running");
    console.log("==================================");

    try {

        // Check Email Template
        const template = await EmailTemplate.findOne({
            type: "Payment Reminder"
        });

        if (!template) {
            console.log("❌ Payment Reminder Template Not Found");
            return;
        }

        if (template.status !== "Active") {
            console.log("❌ Payment Reminder Template Inactive");
            return;
        }

        console.log("✅ Payment Reminder Template Active");

        // Fetch all students
        const flows = await EnrollmentFlow.find()
            .populate("studentId", "name email")
            .lean();

        console.log("Total Enrollment Records:", flows.length);

        let pendingCount = 0;

        for (const flow of flows) {

            if (!flow.studentId) continue;

            const payment = flow.items?.[0]?.payment;
            const course = flow.items?.[0]?.course;

            console.log("--------------------------------");
            console.log("Student :", flow.studentId.name);
            console.log("Method  :", payment?.method);
            console.log("Status  :", payment?.status);

            if (!payment) {
                console.log("No payment found");
                continue;
            }

            const shouldSend =
                payment.method === "Pay Later" ||
                payment.status === "pending" ||
                payment.status === "unpaid" ||
                payment.status === "failed";

            if (!shouldSend) {
                console.log("Payment completed. Skip.");
                continue;
            }

            pendingCount++;

            console.log("📧 Sending Reminder to:", flow.studentId.email);

            await sendEmail({

                to: flow.studentId.email,

                subject: "Payment Reminder",

                html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<style>

body{
font-family:Arial;
background:#f4f6f9;
padding:30px;
}

.container{
max-width:650px;
margin:auto;
background:#fff;
border-radius:10px;
overflow:hidden;
box-shadow:0 4px 15px rgba(0,0,0,.1);
}

.header{
background:#dc2626;
padding:25px;
text-align:center;
color:#fff;
}

.content{
padding:30px;
line-height:1.8;
color:#334155;
}

.box{
background:#fef2f2;
padding:18px;
border-left:5px solid #dc2626;
margin:20px 0;
}

.footer{
background:#f1f5f9;
padding:20px;
text-align:center;
font-size:13px;
}

</style>

</head>

<body>

<div class="container">

<div class="header">

<h2>Payment Reminder</h2>

</div>

<div class="content">

<p>Dear <b>${flow.studentId.name}</b>,</p>

<p>This is a friendly reminder that your payment is still pending.</p>

<div class="box">

<b>Course :</b> ${course?.courseName || "-"} <br>

<b>Payment Method :</b> ${payment.method || "-"} <br>

<b>Status :</b> ${payment.status || "-"} <br>

</div>

<p>
Kindly complete your payment to confirm your booking.
</p>

<p>

Regards,<br>

<b>SkillScope Academy</b>

</p>

</div>

<div class="footer">

© 2026 SkillScope Academy

</div>

</div>

</body>

</html>
`

            });

            console.log("✅ Reminder Sent:", flow.studentId.email);

        }

        console.log("----------------------------------");
        console.log("Pending Students:", pendingCount);
        console.log("----------------------------------");

    }

    catch (err) {

        console.log("Payment Reminder Cron Error");

        console.log(err);

    }

});