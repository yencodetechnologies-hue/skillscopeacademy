const cron = require("node-cron");

const EmailTemplate = require("../models/EmailTemplate");
const StudentMain = require("../models/student_main");
const sendEmail = require("../config/sendEmail");

console.log("✅ Festival Cron Loaded");

// Run every minute (Testing)
// Later change to "0 9 * * *"
cron.schedule("0 9 * * *", async () => {

    console.log("🎉 Festival Cron Running...");

    try {

        // Check Festival Template
        const festivalTemplate = await EmailTemplate.findOne({
            type: "Festival Wishes"
        });

        if (!festivalTemplate) {
            console.log("Festival Template Not Found");
            return;
        }

        if (festivalTemplate.status !== "Active") {
            console.log("Festival Template Inactive");
            return;
        }

        console.log("Festival Template Active");

        // Today's Date
        const today = new Date().toISOString().split("T")[0];

        console.log("Today's Date :", today);

        // Festival List
        const festivals = [
            {
                name: "Friendship Day",
                date: "2026-08-05"
            },
            {
                name: "Christmas",
                date: "2026-12-25"
            },
            {
                name: "New Year",
                date: "2027-01-01"
            }
        ];

        const festival = festivals.find(f => f.date === today);

        if (!festival) {
            console.log("No Festival Today");
            return;
        }

        console.log("Festival :", festival.name);

        // Read Students
        const students = await StudentMain.find();

        console.log("Students :", students.length);

        for (const student of students) {

            await sendEmail({

                // Testing
                to: "abinayaj142001@gmail.com",

                // Production
                // to: student.email,

                subject: `🎉 Happy ${festival.name}`,

            html: `
<div style="
    font-family: Arial, sans-serif;
    background:#f5f7fb;
    padding:30px;
">

    <div style="
        max-width:600px;
        margin:auto;
        background:#ffffff;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 4px 15px rgba(0,0,0,0.1);
    ">

        <!-- Header -->
        <div style="
            background:linear-gradient(135deg,#2563eb,#1e40af);
            padding:30px;
            text-align:center;
            color:white;
        ">
            <h1 style="margin:0;font-size:28px;">
                🎉 Happy ${festival.name}
            </h1>

            <p style="
                margin-top:10px;
                font-size:16px;
            ">
                Warm wishes from Safety Training Academy
            </p>
        </div>


        <!-- Body -->
        <div style="
            padding:30px;
            color:#333;
            line-height:1.8;
        ">

            <p style="font-size:17px;">
                Dear <strong>${student.name}</strong>,
            </p>


            <p>
                We would like to extend our heartfelt wishes to you 
                and your family on this beautiful occasion of 
                <strong>${festival.name}</strong>.
            </p>


            <div style="
                background:#f0f9ff;
                border-left:5px solid #2563eb;
                padding:15px;
                margin:20px 0;
                border-radius:6px;
            ">
                ✨ May this festival bring you
                <strong>happiness, peace, success and prosperity</strong>.
                May your celebrations be filled with joy and wonderful memories.
            </div>


            <p>
                Thank you for being a valuable part of 
                <strong>Safety Training Academy</strong>.
            </p>


            <br>


            <p>
                Best Regards,<br>
                <strong style="color:#2563eb;">
                    Safety Training Academy
                </strong>
            </p>

        </div>


        <!-- Footer -->
        <div style="
            background:#f1f5f9;
            padding:15px;
            text-align:center;
            font-size:13px;
            color:#64748b;
        ">
            © ${new Date().getFullYear()} Safety Training Academy.
            All Rights Reserved.
        </div>


    </div>

</div>
`

            });

            console.log(`Festival mail sent to ${student.name}`);

        }

    } catch (err) {

        console.error(err);

    }

});