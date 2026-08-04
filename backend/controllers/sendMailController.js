const StudentMain = require("../models/student_main");
const sendEmail = require("../config/sendEmail");

exports.sendManualLink = async (req, res) => {
  try {
    const { studentId, courseLink } = req.body;

    if (!studentId || !courseLink) {
      return res.status(400).json({
        success: false,
        message: "studentId and courseLink are required",
      });
    }

    const student = await StudentMain.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await sendEmail({
      to: student.email,
      subject: "Your Course Link",
      html: `
        <h2>Hello ${student.name},</h2>
        <p>Your course link is below:</p>

        <p>
          <a href="${courseLink}" target="_blank">
            ${courseLink}
          </a>
        </p>

        <p>Thank you.</p>
      `,
    });

    return res.json({
      success: true,
      message: "Mail sent successfully12",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};