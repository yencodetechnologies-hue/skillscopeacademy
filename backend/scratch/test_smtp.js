const nodemailer = require("nodemailer");
require("dotenv").config();

async function testSMTP() {
  console.log("Testing SMTP with:");
  console.log("Host:", process.env.SMTP_HOST);
  console.log("Port:", process.env.SMTP_PORT);
  console.log("User:", process.env.SMTP_USER);
  console.log("Pass:", process.env.SMTP_PASS ? "****" : "MISSING");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log("Verifying connection...");
    await transporter.verify();
    console.log("✅ Connection successful!");
    
    console.log("Sending test mail...");
    await transporter.sendMail({
      from: `"SMTP Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // send to self
      subject: "SMTP Connection Test",
      text: "If you receive this, your SMTP settings are correct."
    });
    console.log("✅ Test email sent successfully!");
  } catch (error) {
    console.error("❌ SMTP Test Failed:");
    console.error(error);
  }
}

testSMTP();
