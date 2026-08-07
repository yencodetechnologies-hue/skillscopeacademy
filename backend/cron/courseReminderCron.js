const cron = require("node-cron");

const StudentMain = require("../models/student_main");
const Course = require("../models/Course");
const EmailTemplate = require("../models/EmailTemplate");
const sendEmail = require("../config/sendEmail");

console.log("✅ Course Reminder Cron Loaded");

// Every 5 minutes (Testing)
cron.schedule("*/5 * * * *", async () => {

    console.log("📚 Course Reminder Cron Running");

    try {

        // Check Email Template
        const template = await EmailTemplate.findOne({
            type: "Course Reminder"
        });

        if (!template) {
            console.log("Course Reminder Template Not Found");
            return;
        }

        if (template.status !== "Active") {
            console.log("Course Reminder Template Inactive");
            return;
        }

        console.log("Course Reminder Template Active");

        // Get all active students
        const students = await StudentMain.find({
            status: "Active"
        }).populate("courseId");

        const today = new Date();

        for (const student of students) {

            if (!student.courseId) continue;

            if (!student.courseStartDate) continue;

            const course = student.courseId;

            //---------------------------------------------------
            // duration = "2 Days"
            //---------------------------------------------------

            let durationDays = 0;

            if (course.duration) {

                durationDays = parseInt(course.duration);

                if (isNaN(durationDays)) durationDays = 0;
            }

            if (durationDays === 0) continue;

            //---------------------------------------------------
            // Course End Date
            //---------------------------------------------------

            const startDate = new Date(student.courseStartDate);

            const endDate = new Date(startDate);

            endDate.setDate(endDate.getDate() + durationDays);

            //---------------------------------------------------
            // Reminder One Day Before
            //---------------------------------------------------

            const reminderDate = new Date(endDate);

            reminderDate.setDate(reminderDate.getDate() - 1);

            const todayOnly = today.toISOString().split("T")[0];

            const reminderOnly = reminderDate.toISOString().split("T")[0];

            if (todayOnly !== reminderOnly) continue;

            console.log("Sending Reminder:", student.name);

            await sendEmail({

                to: student.email,

                subject: `Course Reminder - ${course.title}`,

                html: `
<!DOCTYPE html>
<html>

<body style="font-family:Arial;background:#f5f7fa;padding:20px;">

<div style="max-width:650px;margin:auto;background:#fff;border-radius:10px;padding:35px;">

<h2 style="color:#2563eb;">
Course Reminder
</h2>

<p>
Dear <b>${student.name}</b>,
</p>

<p>
This is a friendly reminder that your course is nearing completion.
</p>

<table style="width:100%;border-collapse:collapse;margin-top:20px;">

<tr>
<td style="padding:10px;border:1px solid #ddd;"><b>Course</b></td>
<td style="padding:10px;border:1px solid #ddd;">${course.title}</td>
</tr>

<tr>
<td style="padding:10px;border:1px solid #ddd;"><b>Course Code</b></td>
<td style="padding:10px;border:1px solid #ddd;">${course.courseCode}</td>
</tr>

<tr>
<td style="padding:10px;border:1px solid #ddd;"><b>Duration</b></td>
<td style="padding:10px;border:1px solid #ddd;">${course.duration}</td>
</tr>

<tr>
<td style="padding:10px;border:1px solid #ddd;"><b>Training Method</b></td>
<td style="padding:10px;border:1px solid #ddd;">${course.deliveryMethod}</td>
</tr>

<tr>
<td style="padding:10px;border:1px solid #ddd;"><b>Location</b></td>
<td style="padding:10px;border:1px solid #ddd;">${course.location}</td>
</tr>

</table>

<p style="margin-top:25px;">
Please complete all pending requirements before your course ends.
</p>

<p>
Regards,<br>
<b>Safety Training Academy</b>
</p>

</div>

</body>
</html>
`
            });

            console.log("Reminder Sent:", student.email);

        }

    }
    catch (err) {

        console.log(err);

    }

});