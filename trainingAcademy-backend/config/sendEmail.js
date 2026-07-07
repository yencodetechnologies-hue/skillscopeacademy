require("dotenv").config();

const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  pool: true, // Enable connection pooling
  maxConnections: 1, // Ensure only 1 connection is open at a time to be safe
  maxMessages: 2, // Limit messages per connection if needed
  rateDelta: 5000, // Wait 5 seconds between batches if pooling manages it
  rateLimit: 1, // Only 1 email per rateDelta
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

const sendEmail = async ({ to, subject, html, bcc }) => {
  if (!to) {
    console.error("❌ sendEmail error: No recipient defined (to is empty)");
    return;
  }

  try {
    const mailOptions = {
      from: `"Safety Training Academy No-Reply" <${process.env.SMTP_USER}>`,
      to: to,
      bcc: bcc || [process.env.BOOKINGS_EMAIL, process.env.NOTIFY_EMAIL].filter(Boolean).join(','),
      replyTo: process.env.BOOKINGS_EMAIL || process.env.SMTP_USER,
      envelope: {
        from: process.env.SMTP_USER, // Use authenticated user for envelope to satisfy SMTP restrictions
        to: to
      },
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", to);
    if (mailOptions.bcc) console.log("   BCC list:", mailOptions.bcc);
    console.log("   MessageId:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ SMTP Error for", to, ":", err.message);
    throw err;
  }
};

module.exports = sendEmail;
