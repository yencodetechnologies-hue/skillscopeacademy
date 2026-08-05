const cron = require("node-cron");

const EmailTemplate = require("../models/EmailTemplate");
const StudentMain = require("../models/student_main");
const sendEmail = require("../config/sendEmail");

console.log("✅ Festival Cron Loaded");

// Run every minute (Testing)
// Later change to "0 9 * * *"
cron.schedule("* * * * *", async () => {

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
                <div style="font-family:Arial;padding:20px;line-height:1.8;">

                    <h2>🎉 Happy ${festival.name}</h2>

                    <p>Dear <strong>${student.name}</strong>,</p>

                    <p>
                        Wishing you and your family a wonderful
                        <strong>${festival.name}</strong>.
                    </p>

                    <p>
                        May this festival bring happiness,
                        peace and prosperity.
                    </p>

                    <br>

                    <p>
                        Best Regards,<br>
                        <strong>Safety Training Academy</strong>
                    </p>

                </div>
                `

            });

            console.log(`Festival mail sent to ${student.name}`);

        }

    } catch (err) {

        console.error(err);

    }

});