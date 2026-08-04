const StudentMain = require("../models/student_main");
const sendEmail = require("../config/sendEmail");

exports.sendStudentMail = async (req, res) => {
  console.log("******** SEND MAIL CONTROLLER ********");

  try {
    const { studentId, courseLink } = req.body;

    // Validation
    if (!studentId || !courseLink) {
      return res.status(400).json({
        success: false,
        message: "studentId and courseLink are required",
      });
    }

    // Find student
    const student = await StudentMain.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!student.email) {
      return res.status(400).json({
        success: false,
        message: "Student email not found",
      });
    }

    // Send Email
    await sendEmail({
      to: "abinayaj142001@gmail.com",
      subject: "Your Course Link",
      html: `
      <div style="font-family:Arial,sans-serif;line-height:1.8">
          <h2>Hello ${student.name},</h2>

          <p>Your course access link is below.</p>

          <p>
              <a href="${courseLink}"
                 style="padding:12px 20px;
                        background:#007bff;
                        color:#fff;
                        text-decoration:none;
                        border-radius:5px;">
                  Open Course
              </a>
          </p>

          <p>
              Or copy this URL into your browser:
          </p>

          <p>
              <a href="${courseLink}">
                  ${courseLink}
              </a>
          </p>

          <br>

          <p>
              Regards,<br>
              <strong>Safety Training Academy</strong>
          </p>
      </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Mail sent successfullyyyyyyyyyy",
    });

  } catch (err) {
    console.error("Send Mail Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};