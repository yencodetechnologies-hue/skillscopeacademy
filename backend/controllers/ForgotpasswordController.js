const bcrypt = require("bcryptjs");
const StudentMain = require("../models/student_main"); // adjust path
const Company = require("../models/Company"); // adjust path
const sendEmail = require("../config/sendEmail"); // adjust path

const DEFAULT_PASSWORD = "123456";

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check in StudentMain
    let user = await StudentMain.findOne({ email: normalizedEmail });
    let role = "Student";

    // 2. If not found, check in Company
    if (!user) {
      user = await Company.findOne({ email: normalizedEmail });
      role = "Company";
    }

    // 3. If not found in either
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Enter your registered email address",
      });
    }

    // 4. Hash and reset password to default
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    user.password = hashedPassword;
    await user.save();

    // 5. Send email with account details + default password
    const displayName = user.name || user.companyName || "User";

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:30px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">

                <!-- HEADER -->
                <tr>
                  <td style="background-color:#0f172a; padding:36px 30px; text-align:center;">
                    <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">Password Reset</h1>
                    <p style="margin:8px 0 0; color:#c7cdd6; font-size:14px;">Safeticks</p>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:30px;">
                    <p style="margin:0 0 20px; color:#374151; font-size:15px; line-height:1.5;">
                      Hi ${displayName}, Please use the details below to log in to your account.
                    </p>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb; border-radius:6px; overflow:hidden; margin-bottom:28px;">
                      <tr>
                        <td style="background-color:#f9fafb; padding:14px 16px; font-weight:700; color:#111827; font-size:14px; width:35%; border-bottom:1px solid #e5e7eb;">Name</td>
                        <td style="padding:14px 16px; color:#374151; font-size:14px; border-bottom:1px solid #e5e7eb;">${displayName}</td>
                      </tr>
                      <tr>
                        <td style="background-color:#f9fafb; padding:14px 16px; font-weight:700; color:#111827; font-size:14px; border-bottom:1px solid #e5e7eb;">Email</td>
                        <td style="padding:14px 16px; border-bottom:1px solid #e5e7eb;">
                          <a href="mailto:${user.email}" style="color:#2563eb; font-size:14px; text-decoration:none;">${user.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color:#f9fafb; padding:14px 16px; font-weight:700; color:#111827; font-size:14px;">Role</td>
                        <td style="padding:14px 16px; color:#374151; font-size:14px;">${role}</td>
                      </tr>
                    </table>

                    <p style="margin:0 0 10px; font-weight:700; color:#111827; font-size:15px;">Your Password</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; margin-bottom:24px;">
                      <tr>
                        <td style="padding:16px; text-align:center;">
                          <span style="font-size:20px; font-weight:700; letter-spacing:2px; color:#0f172a;">${DEFAULT_PASSWORD}</span>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0; color:#6b7280; font-size:13px; line-height:1.5;">
                      For your security, please log in and change this password as soon as possible. If you didn't request this reset, please contact our support team immediately.
                    </p>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="padding:20px 30px; background-color:#f9fafb; text-align:center; border-top:1px solid #e5e7eb;">
                    <p style="margin:0; color:#9ca3af; font-size:12px;">&copy; ${new Date().getFullYear()} Safeticks. All rights reserved.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: "Your Account Details",
      html,
    });

    return res.status(200).json({
      success: true,
      message: "Your account details have been sent to your registered email address.",
    });
  } catch (err) {
    console.error("❌ forgotPassword error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

module.exports = { forgotPassword };