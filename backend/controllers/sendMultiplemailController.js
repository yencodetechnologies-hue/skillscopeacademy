const Student = require("../models/Student"); // Change if your model name is different
const sendEmail = require("../config/sendEmail");

exports.sendMultipleMails = async (req, res) => {
  try {
    const { students, courseLink } = req.body;

    if (!students || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No students selected."
      });
    }

    for (const student of students) {

      console.log("Sending mail to:", student.email);

      await sendEmail({
        to: student.email,
        subject: "Course Access Link",
        html: `
          <h2>Hello ${student.name},</h2>

          <p>Your course link is ready.</p>

          <a href="${courseLink}">
            Click Here
          </a>

          <br><br>

          <p>${courseLink}</p>
        `
      });
    }

    return res.status(200).json({
      success: true,
      message: "All emails sent successfully."
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
};