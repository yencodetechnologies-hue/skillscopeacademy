const express = require("express");
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  getCompanyDetails,
  createCompany,
  updateCompany,
  toggleCompanyStatus,
  togglePayLater,
  deleteCompany,
  companyLogin,
  checkCompanyEmail,
} = require("../controllers/companyController");
const { verifyAdmin, verifyToken } = require("../middleware/authMiddleware");
router.post("/login", companyLogin);
router.post("/check-email", checkCompanyEmail);
router.get("/", verifyAdmin, getAllCompanies);
router.get("/:id/details", verifyAdmin, getCompanyDetails);
router.get("/:id", getCompanyById)
router.post("/", verifyAdmin, createCompany);
router.put("/:id", verifyAdmin, updateCompany);
router.patch("/:id/toggle-status", verifyAdmin, toggleCompanyStatus);
router.patch("/:id/toggle-pay-later", verifyAdmin, togglePayLater);
router.delete("/:id", verifyAdmin, deleteCompany);
router.post("/register", createCompany);

module.exports = router;