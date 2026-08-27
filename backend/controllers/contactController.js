const sendEmail = require("../config/sendEmail");

// ============================================================
// Submit Contact Form
// ============================================================
const submitContactForm = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
    } = req.body;

    console.log("======================================");
    console.log("📩 NEW CONTACT FORM REQUEST");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Phone:", phone);
    console.log("======================================");

    // ----------------------------------------------------------
    // Validate required fields
    // ----------------------------------------------------------
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // ----------------------------------------------------------
    // Clean input
    // ----------------------------------------------------------
    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim();
    const cleanPhone = String(phone).trim();
    const cleanMessage = String(message).trim();

    // ----------------------------------------------------------
    // Validate email
    // ----------------------------------------------------------
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // ----------------------------------------------------------
    // Validate after trimming
    // ----------------------------------------------------------
    if (
      !cleanName ||
      !cleanEmail ||
      !cleanPhone ||
      !cleanMessage
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // ----------------------------------------------------------
    // Escape HTML
    // Prevent HTML injection inside email
    // ----------------------------------------------------------
    const escapeHtml = (value) => {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const safeName = escapeHtml(cleanName);
    const safeEmail = escapeHtml(cleanEmail);
    const safePhone = escapeHtml(cleanPhone);

    const safeMessage = escapeHtml(cleanMessage)
      .replace(/\r\n/g, "<br />")
      .replace(/\n/g, "<br />")
      .replace(/\r/g, "<br />");

    // ----------------------------------------------------------
    // Email subject
    // ----------------------------------------------------------
    const subject = `New Contact Enquiry - ${cleanName}`;

    // ----------------------------------------------------------
    // Email HTML
    // ----------------------------------------------------------
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>New Contact Enquiry</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f4f7fb;
    font-family:Arial,Helvetica,sans-serif;
  "
>

  <div
    style="
      max-width:650px;
      margin:30px auto;
      background:#ffffff;
      border-radius:12px;
      overflow:hidden;
      box-shadow:0 4px 18px rgba(0,0,0,0.08);
    "
  >

    <!-- ========================================= -->
    <!-- HEADER -->
    <!-- ========================================= -->

    <div
      style="
        background:#0b1727;
        padding:28px 24px;
        text-align:center;
      "
    >

      <h1
        style="
          margin:0;
          color:#ffffff;
          font-size:24px;
          font-weight:700;
        "
      >
        New Contact Enquiry
      </h1>

      <p
        style="
          margin:8px 0 0;
          color:#cbd5e1;
          font-size:14px;
        "
      >
        Safeticks
      </p>

    </div>


    <!-- ========================================= -->
    <!-- CONTENT -->
    <!-- ========================================= -->

    <div style="padding:30px;">

      <p
        style="
          margin:0 0 20px;
          color:#334155;
          font-size:15px;
          line-height:1.6;
        "
      >
        A new enquiry has been submitted through the
        website contact form.
      </p>


      <!-- ========================================= -->
      <!-- CONTACT DETAILS -->
      <!-- ========================================= -->

      <table
        style="
          width:100%;
          border-collapse:collapse;
          margin-top:20px;
        "
      >

        <!-- Name -->

        <tr>

          <td
            style="
              padding:12px;
              background:#f8fafc;
              border:1px solid #e2e8f0;
              font-weight:bold;
              width:130px;
              color:#0f172a;
            "
          >
            Name
          </td>

          <td
            style="
              padding:12px;
              border:1px solid #e2e8f0;
              color:#334155;
            "
          >
            ${safeName}
          </td>

        </tr>


        <!-- Email -->

        <tr>

          <td
            style="
              padding:12px;
              background:#f8fafc;
              border:1px solid #e2e8f0;
              font-weight:bold;
              color:#0f172a;
            "
          >
            Email
          </td>

          <td
            style="
              padding:12px;
              border:1px solid #e2e8f0;
            "
          >

            <a
              href="mailto:${safeEmail}"
              style="
                color:#2563eb;
                text-decoration:none;
              "
            >
              ${safeEmail}
            </a>

          </td>

        </tr>


        <!-- Phone -->

        <tr>

          <td
            style="
              padding:12px;
              background:#f8fafc;
              border:1px solid #e2e8f0;
              font-weight:bold;
              color:#0f172a;
            "
          >
            Phone
          </td>

          <td
            style="
              padding:12px;
              border:1px solid #e2e8f0;
              color:#334155;
            "
          >
            ${safePhone}
          </td>

        </tr>

      </table>


      <!-- ========================================= -->
      <!-- MESSAGE -->
      <!-- ========================================= -->

      <div style="margin-top:28px;">

        <h2
          style="
            margin:0 0 12px;
            color:#0b1727;
            font-size:17px;
          "
        >
          Message
        </h2>

        <div
          style="
            padding:18px;
            background:#f8fafc;
            border:1px solid #e2e8f0;
            border-radius:8px;
            color:#334155;
            line-height:1.7;
            font-size:14px;
          "
        >
          ${safeMessage}
        </div>

      </div>

    </div>


    <!-- ========================================= -->
    <!-- FOOTER -->
    <!-- ========================================= -->

    <div
      style="
        padding:18px 24px;
        background:#f8fafc;
        border-top:1px solid #e2e8f0;
        text-align:center;
      "
    >

      <p
        style="
          margin:0;
          color:#64748b;
          font-size:12px;
        "
      >
        This email was generated from the
        website contact form.
      </p>

    </div>

  </div>

</body>
</html>
`;

    // ----------------------------------------------------------
    // ADMIN EMAIL
    // ----------------------------------------------------------
    const adminEmail =
      process.env.BOOKINGS_EMAIL ||
      process.env.NOTIFY_EMAIL ||
      "abinayaj142001@gmail.com";

    console.log("📤 Sending contact enquiry...");
    console.log("Admin email:", adminEmail);

    // ----------------------------------------------------------
    // Send email
    //
    // IMPORTANT:
    // replyTo is the customer's email.
    // When admin clicks Reply, it will reply to customer.
    // ----------------------------------------------------------
    const emailInfo = await sendEmail({
      to:process.env.BOOKINGS_EMAIL,
      subject,
      html,
      replyTo: cleanEmail,
    });

   
    // ----------------------------------------------------------
    // Success response
    // ----------------------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Your enquiry has been submitted successfully.",
    });

  } catch (error) {

    console.error("======================================");
    console.error("❌ CONTACT FORM ERROR");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("======================================");

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit your enquiry. Please try again later.",
    });
  }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  submitContactForm,
};