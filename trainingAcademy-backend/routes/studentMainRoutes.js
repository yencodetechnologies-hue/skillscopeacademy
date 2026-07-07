const express = require("express");
const router = express.Router();
const { uploadPayment } = require("../middleware/upload"); // ✅ add

const {
  createStudent,
  updateStudent,
  getStudentById,
  updateStudentCourse,
  getAllStudents,
  updateStudentStatus,
  deleteStudent,
  getStudentsByCompany,
  getPaymentsByCompany,
  paySelected,
  getStudentsByLink
} = require("../controllers/studentMainController");
const { verifyCompany } = require("../middleware/authMiddleware");

router.get("/company/:companyId", verifyCompany, getStudentsByCompany);
router.get("/company/:companyId/payments", verifyCompany, getPaymentsByCompany);
router.get("/company/:companyId/link/:token", verifyCompany, getStudentsByLink);
router.post("/enrollment", uploadPayment.single("paymentSlip"), createStudent); // ✅ middleware add
router.put("/enrollment/:id", updateStudent);
router.get("/enrollment/:id", getStudentById);
router.put("/enrollment/:studentId/:courseId", updateStudentCourse);
router.get("/", getAllStudents);
router.post("/", uploadPayment.single("paymentSlip"), createStudent);
router.put("/:id", updateStudent);
router.patch("/:id/status", updateStudentStatus);
router.delete("/:id", deleteStudent);
router.post("/company/pay-selected", uploadPayment.single("receipt"), paySelected);

module.exports = router;