// jobs/courseReminderCron.js
const mongoose = require("mongoose");
const cron = require("node-cron");

const EnrollmentFlow = require("../models/EnrollmentFlows");
const Course = require("../models/Course");
const sendEmail = require("../config/sendEmail");

console.log("✅ Course Reminder Cron Loaded — v8 (3-day-before reminder)");

// Runs every day at 9:00 AM.
// For testing, swap to "* * * * *" (every minute).
cron.schedule("0 9 * * * ", async () => {

    console.log("========================================");
    console.log("📚 Course Reminder Cron Running...", new Date().toISOString());

    try {

        const flowQuery = { status: "active", studentId: { $ne: null } };

        const data = await EnrollmentFlow.find(flowQuery)
            .populate("studentId", "name email")
            .lean();

        console.log(`🔍 Active enrollments found: ${data.length}`);

        if (data.length === 0) return;

        const courseIds = new Set();

        data.forEach((flow) => {
            const item = flow.items?.[0] || {};
            const courseId = item.course?.courseId;
            if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
                courseIds.add(courseId.toString());
            }
        });

        const [courses] = await Promise.all([
            Course.find({ _id: { $in: [...courseIds] } })
                .select("title courseValidity")
                .lean(),
        ]);

        console.log(`🔍 Courses loaded: ${courses.length}`);

        const courseMap = Object.fromEntries(
            courses.map((c) => [c._id.toString(), c])
        );

        const todayOnly = new Date().toISOString().split("T")[0];
        console.log("🔍 todayOnly:", todayOnly);

        // How many days before expiry to send the reminder.
        const REMINDER_DAYS_BEFORE = 3;

        let sentCount = 0;
        let skippedCount = 0;

        for (const flow of data) {

            try {

                const student = flow.studentId || {};
                const item = flow.items?.[0] || {};
                const sessionDate = flow.sessionDate;

                if (!student.email) {
                    console.log(`⏭️ [${flow._id}] skip — no student email`);
                    skippedCount++;
                    continue;
                }

                if (!sessionDate) {
                    console.log(`⏭️ [${flow._id}] skip — no sessionDate`);
                    skippedCount++;
                    continue;
                }

                const courseId = item.course?.courseId?.toString();
                const course = courseId ? courseMap[courseId] : null;

                if (!course) {
                    console.log(`⏭️ [${flow._id}] skip — course not found for id ${courseId}`);
                    skippedCount++;
                    continue;
                }

                if (!course.courseValidity) {
                    console.log(`⏭️ [${flow._id}] skip — courseValidity missing on course "${course.title}"`);
                    skippedCount++;
                    continue;
                }

                const years = parseInt(course.courseValidity, 10);
                if (isNaN(years)) {
                    console.log(`⏭️ [${flow._id}] skip — unparseable courseValidity: "${course.courseValidity}"`);
                    skippedCount++;
                    continue;
                }

                const expiryDate = new Date(sessionDate);
                expiryDate.setFullYear(expiryDate.getFullYear() + years);

                // ── Reminder = N days BEFORE expiry ──
                const reminderDate = new Date(expiryDate);
                reminderDate.setDate(reminderDate.getDate() - REMINDER_DAYS_BEFORE);
               const reminderOnly = reminderDate.toISOString().split("T")[0];
             // const reminderOnly = new Date().toISOString().split("T")[0];

                console.log(`🔍 [${flow._id}] expiryDate: ${expiryDate.toISOString()} | reminderOnly (${REMINDER_DAYS_BEFORE}d before): ${reminderOnly}`);

                if (todayOnly !== reminderOnly) {
                    console.log(`⏭️ [${flow._id}] skip — not reminder day`);
                    skippedCount++;
                    continue;
                }

                const courseName = item.course?.courseName || course.title || "";
                const expiryDateFormatted = expiryDate.toDateString();

                await sendEmail({
                    to: student.email,
                    subject: `⏰ Your ${courseName} Certificate Expires in ${REMINDER_DAYS_BEFORE} Days`,
                    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<style>

body{
    margin:0;
    padding:0;
    background:#f4f7fb;
    font-family:Arial, Helvetica, sans-serif;
}

.wrapper{
    width:100%;
    padding:30px 0;
}

.container{
    max-width:650px;
    margin:auto;
    background:#ffffff;
    border-radius:12px;
    overflow:hidden;
    box-shadow:0 5px 18px rgba(0,0,0,.08);
}

.header{
    background:linear-gradient(135deg,#2563eb,#0f766e);
    padding:35px;
    text-align:center;
    color:#fff;
}

.header h1{
    margin:0;
    font-size:32px;
}

.header p{
    margin-top:10px;
    font-size:15px;
    opacity:.95;
}

.content{
    padding:35px;
    color:#374151;
    line-height:1.8;
    font-size:15px;
}

.greeting{
    font-size:20px;
    font-weight:bold;
    color:#111827;
}

.wish-box{
    margin:25px 0;
    padding:25px;
    background:#f8fafc;
    border-left:5px solid #2563eb;
    border-radius:10px;
}

.wish-box h2{
    margin-top:0;
    color:#2563eb;
}

.expiry-date{
    font-size:18px;
    font-weight:bold;
    color:#0f766e;
}

.button{
    display:inline-block;
    background:#2563eb;
    color:#ffffff !important;
    text-decoration:none;
    padding:14px 28px;
    border-radius:8px;
    margin-top:20px;
    font-weight:bold;
}

.footer{
    background:#f1f5f9;
    padding:25px;
    text-align:center;
    font-size:13px;
    color:#64748b;
}

.footer strong{
    color:#0f172a;
}

</style>

</head>

<body>

<div class="wrapper">

<div class="container">

<div class="header">

<h1>⏰ Certificate Expiring in ${REMINDER_DAYS_BEFORE} Days</h1>

<p>Safeticks</p>

</div>

<div class="content">

<p class="greeting">

Dear ${student.name || "Student"},

</p>

<div class="wish-box">

<h2>Your Certification is About to Expire</h2>

<p>

This is a reminder that your certification for
<strong>${courseName}</strong> is due to expire in
<strong>${REMINDER_DAYS_BEFORE} days</strong>, on
<span class="expiry-date">${expiryDateFormatted}</span>.

</p>

<p>

To avoid any interruption to your qualification and remain
compliant, we strongly recommend booking your renewal
training before this date.

</p>

</div>

<p>

If you have already completed your renewal, please disregard
this message. Otherwise, our team is ready to help you book
your next session at a time that suits you.

</p>

<center>

<a href="https://safetytrainingacademy.com"
class="button">

Renew Now

</a>

</center>

<br>

<p>

Warm Regards,

<br><br>

<strong>

Safeticks Team

</strong>

</p>

</div>

<div class="footer">

<p>

© 2026 Safeticks

</p>

<p>

Professional Safety Training • Workplace Compliance • Certification

</p>

</div>

</div>

</div>

</body>
</html>
`
                });

                console.log(`✅ [${flow._id}] Reminder sent to ${student.email}`);
                sentCount++;

            } catch (innerErr) {
                console.error(`❌ [${flow._id}] failed:`, innerErr.message);
                skippedCount++;
            }
        }

        console.log(`📚 Run complete — sent: ${sentCount}, skipped: ${skippedCount}`);

    } catch (err) {
        console.error("❌ Course Reminder Cron Error:", err);
    }

});

module.exports = {}; // exported for require() side-effect registration