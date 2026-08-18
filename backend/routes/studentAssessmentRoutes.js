const express = require("express");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const AssessmentUser = require("../models/AssessmentUser");
const AssessmentStudent = require("../models/AssessmentStudent");
const Assessment = require("../models/Assessment");
const CommonAssessment = require("../models/CommonAssessment");
const AssessmentSubmission = require("../models/AssessmentSubmission");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// --- Auth Middleware (assessor-only, separate from the main site's login) ---
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role && decoded.role !== "assessor") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

const authenticateStudent = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "student") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.studentId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// --- Health Check ---
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Student assessment module is running" });
});

// --- Auth Routes ---

router.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await AssessmentUser.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });
    const user = new AssessmentUser({ email, password });
    await user.save();
    res.json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await AssessmentUser.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id, role: "assessor" }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { email: user.email, id: user._id, role: "assessor" } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/auth/me", authenticate, async (req, res) => {
  try {
    const user = await AssessmentUser.findById(req.userId).select("-password");
    res.json({ ...user.toObject(), role: "assessor" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Student Auth Routes ---

router.post("/auth/student/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await AssessmentStudent.findOne({ email });
    if (!student || !(await student.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: student._id, role: "student" }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: {
        id: student._id,
        email: student.email,
        name: student.name,
        student_id: student.student_id,
        role: "student",
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/auth/student/me", authenticateStudent, async (req, res) => {
  try {
    const student = await AssessmentStudent.findById(req.studentId).select("-password");
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({ ...student.toObject(), role: "student" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Assessment Routes ---

router.post("/assessments", authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    const templateName = name || "Question 1";
    const staticToken = templateName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let assessment = await Assessment.findOne({ token: staticToken });
    if (assessment) {
      return res.json(assessment);
    }

    assessment = new Assessment({
      token: staticToken,
      assessor_id: req.userId,
      name: templateName,
    });
    await assessment.save();
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/assessments", authenticate, async (req, res) => {
  try {
    const assessments = await Assessment.find({ assessor_id: req.userId }).sort({ created_at: -1 });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/assessments/validate/:token", async (req, res) => {
  try {
    const assessment = await Assessment.findOne({ token: req.params.token });
    if (!assessment) return res.status(404).json({ error: "Invalid or expired assessment link." });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Common Assessment Routes ---

router.post("/common-assessments", authenticate, async (req, res) => {
  try {
    const { question_ids } = req.body;
    if (!question_ids || !Array.isArray(question_ids) || question_ids.length === 0) {
      return res.status(400).json({ error: "At least one question must be selected." });
    }

    const token = uuidv4().slice(0, 8);

    const commonAssessment = new CommonAssessment({
      token,
      assessor_id: req.userId,
      question_ids,
    });

    await commonAssessment.save();
    res.json(commonAssessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/common-assessments", authenticate, async (req, res) => {
  try {
    const assessments = await CommonAssessment.find({ assessor_id: req.userId }).sort({ created_at: -1 });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/common-assessments/validate/:token", async (req, res) => {
  try {
    const assessment = await CommonAssessment.findOne({ token: req.params.token });
    if (!assessment) return res.status(404).json({ error: "Invalid or expired common assessment link." });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/common-assessments/:id", authenticate, async (req, res) => {
  try {
    const result = await CommonAssessment.deleteOne({ _id: req.params.id, assessor_id: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Common assessment not found or unauthorized" });
    }
    res.json({ message: "Common assessment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Submission Routes ---

router.post("/submissions", async (req, res) => {
  try {
    const { assessment_id, student_name, student_id, answers, signature_url } = req.body;

    if (student_id) {
      const existingSubmission = await AssessmentSubmission.findOne({
        assessment_id,
        student_id,
      });
      if (existingSubmission) {
        return res.status(400).json({ error: "You have already submitted this assessment." });
      }
    }

    const submission = new AssessmentSubmission({
      assessment_id,
      student_name,
      student_id,
      answers,
      signature_url,
      status: "pending",
    });
    await submission.save();
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/submissions", authenticate, async (req, res) => {
  try {
    const assessments = await Assessment.find({ assessor_id: req.userId });
    const assessmentIds = assessments.map((a) => a._id);
    const submissions = await AssessmentSubmission.find({ assessment_id: { $in: assessmentIds } })
      .populate("assessment_id", "token name")
      .sort({ submitted_at: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/submissions/status/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const submissions = await AssessmentSubmission.find({ student_id: studentId }).populate(
      "assessment_id",
      "token"
    );

    const completedTokens = submissions
      .filter((s) => s.assessment_id)
      .map((s) => s.assessment_id.token);

    res.json({ completedTokens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/submissions/:id", authenticate, async (req, res) => {
  try {
    const submission = await AssessmentSubmission.findById(req.params.id).populate("assessment_id");
    if (!submission) return res.status(404).json({ error: "Submission not found" });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/submissions/:id", authenticate, async (req, res) => {
  try {
    const { grades, task_results, final_result, comp_record, status, answers } = req.body;

    const updateData = { grades, task_results, final_result, comp_record, status: status || "graded" };
    if (answers !== undefined) {
      updateData.answers = answers;
    }

    const submission = await AssessmentSubmission.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/submissions/:id", authenticate, async (req, res) => {
  try {
    const submission = await AssessmentSubmission.findById(req.params.id).populate("assessment_id");
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (submission.assessment_id && submission.assessment_id.assessor_id.toString() !== req.userId) {
      return res.status(403).json({ error: "Unauthorized to delete this submission" });
    }

    await AssessmentSubmission.deleteOne({ _id: req.params.id });
    res.json({ message: "Submission deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/submissions/student/:studentKey", authenticate, async (req, res) => {
  try {
    const { studentKey } = req.params;
    const assessments = await Assessment.find({ assessor_id: req.userId });
    const assessmentIds = assessments.map((a) => a._id);

    const result = await AssessmentSubmission.deleteMany({
      assessment_id: { $in: assessmentIds },
      $or: [{ student_id: studentKey }, { student_name: studentKey }],
    });

    res.json({ message: `Deleted ${result.deletedCount} submissions for this student` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
