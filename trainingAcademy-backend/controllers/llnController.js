const LLND = require("../models/LLNDAssessment");
const StudentMain = require("../models/student_main");

exports.saveLLN = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // 🔥 create LLN
    const llnRecord = await LLND.create({
      student: studentId,
      course: courseId,
      answers: req.body.answers,
      result: req.body.result,
      status: req.body.result.status
    });

    // 🔥 link to studentMain
    await StudentMain.findOneAndUpdate(
      {
        _id: studentId,
        "courses.courseId": courseId
      },
      {
        $set: {
          "courses.$.assessmentId": llnRecord._id,
          "courses.$.step": 3
        }
      }
    );

    res.json(llnRecord);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getAllLLN = async (req, res) => {
  try {
    const data = await LLND.find()
      .populate("student", "name email phone")
      .populate("course", "title")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};