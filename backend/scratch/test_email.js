const sendEmail = require("./config/sendEmail");
require("dotenv").config();

async function testEmail() {
  try {
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("BOOKINGS_EMAIL:", process.env.BOOKINGS_EMAIL);

    const result = await sendEmail({
      to: "abinaya.zerosoft@gmail.com", // your own email
      subject: "Test Email from Backend",
      html: `
        <h2>Email Test</h2>
        <p>If you received this email, SMTP is working correctly.</p>
      `,
    });

    console.log("Email sent successfully!");
    console.log(result);
  } catch (err) {
    console.error("Email failed:");
    console.error(err);
  }
}

testEmail();