const cron = require("node-cron");

const EmailTemplate = require("../models/EmailTemplate");
const StudentMain = require("../models/student_main");
const sendEmail = require("../config/sendEmail");

console.log("✅ Birthday Cron Loaded");

// Every minute (Testing)
// Later change to "0 9 * * *"
cron.schedule("0 9 * * *", async () => {

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

<h1>🎂 Happy Birthday!</h1>

<p>Safeticks</p>

</div>

<div class="content">

<p class="greeting">

Dear ${student.name},

</p>

<div class="wish-box">

<h2>🎉 Wishing You a Wonderful Birthday!</h2>

<p>

On behalf of everyone at <strong>Safeticks</strong>,
we would like to wish you a very Happy Birthday!

</p>

<p>

May this special day bring you happiness, good health,
success, and many exciting opportunities in the year ahead.

</p>

<p>

Thank you for being a valued member of our academy.
We truly appreciate your trust and support.

</p>

</div>

<p>

Have a fantastic celebration with your family and friends.
We wish you continued success in both your personal and professional journey.

</p>

<center>

<a href="https://safetytrainingacademy.com"
class="button">

Visit Our Academy

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

console.log("✅ Birthday mail sent to abinayaj142001@gmail.com");
            }

        }

    } catch (err) {

        console.error(err);

    }

});