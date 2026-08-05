const cron = require("node-cron");

const EmailTemplate = require("../models/EmailTemplate");
const StudentMain = require("../models/student_main");
const sendEmail = require("../config/sendEmail");

console.log("✅ Birthday Cron Loaded");

// Every minute (Testing)
// Later change to "0 9 * * *"
cron.schedule("* * * * *", async () => {

    console.log("🎂 Birthday Cron Running...");

    try {

        // Check template
        const birthdayTemplate = await EmailTemplate.findOne({
            type: "Birthday Wishes"
        });

        if (!birthdayTemplate) {
            console.log("Birthday Template Not Found");
            return;
        }

        if (birthdayTemplate.status !== "Active") {
            console.log("Birthday Template Inactive");
            return;
        }

        console.log("Birthday Template Active");

        // Today's Month & Day
        const today = new Date();

        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        console.log("Today's Date :", `${month}-${day}`);

        // Read Students
        const students = await StudentMain.find();

        console.log("Total Students:", students.length);

students.forEach((student) => {
  console.log({
    name: student.name,
    email: student.email,
    dob: student.dob,
  });
});

        for (const student of students) {
             console.log("Checking:", student.name);
    console.log("DOB:", student.dob);

            if (!student.dob) continue;

            // DOB format : YYYY-MM-DD
            const dob = student.dob.split("-");
             console.log("DOB Array:", dob);

            if (dob.length !== 3) continue;

            const studentMonth = dob[1];
            const studentDay = dob[2];

            if (studentMonth === month && studentDay === day) {

                console.log("Birthday Student :", student.name);

               await sendEmail({
    to: "abinayaj142001@gmail.com",
    subject: "🎉 Happy Birthday!",
    html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6;">
            <h2>🎂 Happy Birthday ${student.name}!</h2>

            <p>Dear ${student.name},</p>

            <p>
                Wishing you a very Happy Birthday! 🎉
            </p>

            <p>
                May your day be filled with happiness, success and good health.
            </p>

            <p>
                Thank you for being a valued student of
                <strong>Safety Training Academy</strong>.
            </p>

            <br>

            <p>
                Best Regards,<br>
                <strong>Safety Training Academy</strong>
            </p>
        </div>
    `
});

console.log("✅ Birthday mail sent to abinayaj142001@gmail.com");
            }

        }

    } catch (err) {

        console.error(err);

    }

});