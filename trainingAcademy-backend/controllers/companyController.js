const Company = require("../models/Company");
const CompanyPayment = require("../models/CompanyPayment");
const CourseLink = require("../models/CourseLink");
const { dedupeCourseLinks } = require("../utils/dedupeCourseLinks");
const EnrollmentFlow = require("../models/EnrollmentFlows");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../config/sendEmail");
const { logAdminActivity } = require("../utils/logAdminActivity");

const PORTAL_URL = process.env.CLIENT_ORIGIN?.split(",")[0]?.trim() || "https://safetytrainingacademy.edu.au";

const buildCompanyWelcomeHtml = ({ companyName, email, password }) => {
  const portalUrl = `${PORTAL_URL}/login`;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>STA Company Portal Registration</title>
  <style>
    body { margin: 0; padding: 24px; background: #f0f2f5; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .cr-body { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden; font-size: 13px; color: #1a1a1a; }
    .cr-hdr { background: #0d2240; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .cr-hdr-title { font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 2px; }
    .cr-hdr-sub { font-size: 10px; color: #29b6e8; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600; margin: 0; }
    .cr-badge { background: #29b6e8; color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 11px; border-radius: 2px; white-space: nowrap; }
    .cr-divider { height: 3px; background: #29b6e8; }
    .cr-banner { background: #0a1c33; padding: 14px 24px; text-align: center; }
    .cr-banner-text { font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: 0.2px; }
    .cr-content { padding: 20px 24px; }
    .cr-greeting { font-size: 14px; color: #1a1a1a; margin: 0 0 10px; }
    .cr-intro { font-size: 13px; color: #555555; line-height: 1.7; margin: 0 0 16px; }
    .cr-section { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 14px; }
    .cr-section-head { background: #0d2240; padding: 7px 14px; }
    .cr-section-head span { font-size: 10px; font-weight: 700; color: #29b6e8; letter-spacing: 1px; text-transform: uppercase; }
    .cr-section-body { padding: 11px 14px; }
    .cr-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    .cr-table td { padding: 5px 0; vertical-align: top; }
    .cr-table .lbl { color: #666666; width: 38%; font-weight: 500; }
    .cr-table .val { color: #1a1a1a; font-weight: 700; }
    .cr-table .val-blue { color: #1a7fbf; font-weight: 600; }
    .cr-pw-box { background: #fff8e6; border: 1px solid #f0d080; border-radius: 3px; padding: 4px 10px; font-size: 13px; font-weight: 700; color: #7a5500; display: inline-block; letter-spacing: 1px; }
    .cr-notice { font-size: 11px; color: #888888; margin: 8px 0 0; font-style: italic; }
    .cr-cta-section { margin-bottom: 14px; }
    .cr-cta-label { font-size: 12px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px; }
    .cr-btn { display: inline-block; background: #0d2240; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 3px; font-size: 13px; font-weight: 700; letter-spacing: 0.3px; }
    .cr-help { font-size: 12px; color: #555555; margin-bottom: 14px; line-height: 1.7; }
    .cr-help a { color: #1a7fbf; }
    .cr-sign { font-size: 12.5px; color: #555555; border-top: 1px solid #e0e0e0; padding-top: 14px; line-height: 1.7; }
    .cr-sign strong { color: #1a1a1a; }
    .cr-footer { background: #0d2240; padding: 13px 24px; text-align: center; }
    .cr-footer-brand { font-size: 12px; font-weight: 700; color: #ffffff; margin-bottom: 3px; }
    .cr-footer-info { font-size: 11px; color: #6fa8c8; line-height: 1.9; margin: 0; }
  </style>
</head>
<body>
  <div class="cr-body">
    <div class="cr-hdr">
      <div>
        <p class="cr-hdr-title">Safety Training Academy</p>
        <p class="cr-hdr-sub">RTO #45234 &nbsp;·&nbsp; Company Portal</p>
      </div>
      <span class="cr-badge">Welcome</span>
    </div>
    <div class="cr-divider"></div>
    <div class="cr-banner">
      <p class="cr-banner-text">&#10003; &nbsp;Your company portal is ready</p>
    </div>
    <div class="cr-content">
      <p class="cr-greeting">Hello <strong>${companyName}</strong>,</p>
      <p class="cr-intro">Your company account has been created with Safety Training Academy. You can now log in to the company portal to manage employee enrolments.</p>
      <div class="cr-section">
        <div class="cr-section-head"><span>Your sign-in details</span></div>
        <div class="cr-section-body">
          <table class="cr-table">
            <tr>
              <td class="lbl">Company name</td>
              <td class="val">${companyName}</td>
            </tr>
            <tr>
              <td class="lbl">Email (login)</td>
              <td class="val-blue">${email}</td>
            </tr>
            <tr>
              <td class="lbl">Password</td>
              <td><span class="cr-pw-box">${password}</span></td>
            </tr>
          </table>
          <p class="cr-notice">&#128274; Keep these credentials confidential. We recommend changing your password after first login.</p>
        </div>
      </div>
      <div class="cr-cta-section">
        <p class="cr-cta-label">Company portal login</p>
        <a href="${portalUrl}" class="cr-btn">Log in to portal &rarr;</a>
      </div>
      <p class="cr-help">
        Questions? Contact us at <a href="mailto:info@safetytrainingacademy.edu.au">info@safetytrainingacademy.edu.au</a> or call <a href="tel:1300976097">1300 976 097</a>.
      </p>
      <div class="cr-sign">
        Kind regards,<br>
        <strong>Safety Training Academy</strong>
      </div>
    </div>
    <div class="cr-footer">
      <div class="cr-footer-brand">Safety Training Academy</div>
      <p class="cr-footer-info">
        2 Wellington St, Sefton NSW 2162 &nbsp;·&nbsp; RTO #45234<br>
        1300 976 097 &nbsp;·&nbsp; info@safetytrainingacademy.edu.au
      </p>
    </div>
  </div>
</body>
</html>`;
};

// ─── GET ALL COMPANIES ───────────────────────────────────────────
exports.getAllCompanies = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 1000 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "All Status") {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [companies, total] = await Promise.all([
      Company.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Company.countDocuments(query),
    ]);

    const companyIds = companies.map(c => c._id);

    // Get all course links for these companies
    const [linkAgg, allCompanyLinks] = await Promise.all([
      CourseLink.aggregate([
        { $match: { companyId: { $in: companyIds } } },
        { $group: { _id: "$companyId", count: { $sum: 1 } } }
      ]),
      CourseLink.find({ companyId: { $in: companyIds } }).select("token companyId").lean()
    ]);

    // Build token → companyId map for fallback enrollment count
    const tokenToCompanyId = {};
    allCompanyLinks.forEach(l => { tokenToCompanyId[l.token] = String(l.companyId); });
    const allTokens = allCompanyLinks.map(l => l.token);

    // Count enrollments: by companyId (new) + by sourceToken (existing null-companyId flows)
    const [enrollByCompanyId, enrollByToken] = await Promise.all([
      EnrollmentFlow.aggregate([
        { $match: { companyId: { $in: companyIds } } },
        { $group: { _id: "$companyId", count: { $sum: 1 } } }
      ]),
      allTokens.length > 0
        ? EnrollmentFlow.aggregate([
            { $match: { sourceToken: { $in: allTokens }, companyId: null } },
            { $group: { _id: "$sourceToken", count: { $sum: 1 } } }
          ])
        : Promise.resolve([])
    ]);

    const linkMap = Object.fromEntries(linkAgg.map(l => [String(l._id), l.count]));
    const enrollMap = Object.fromEntries(enrollByCompanyId.map(e => [String(e._id), e.count]));
    enrollByToken.forEach(e => {
      const cId = tokenToCompanyId[e._id];
      if (cId) enrollMap[cId] = (enrollMap[cId] || 0) + e.count;
    });

    const enriched = companies.map(c => ({
      ...c.toObject(),
      linkCount: linkMap[String(c._id)] || 0,
      enrollmentCount: enrollMap[String(c._id)] || 0
    }));

    res.status(200).json({
      success: true,
      data: enriched,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE COMPANY ──────────────────────────────────────────
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).select("-password");
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CHECK COMPANY EMAIL (public, Book Now) ─────────────────────
exports.checkCompanyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const existing = await Company.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.json({
        exists: true,
        message: "Company already registered. Please login to continue.",
      });
    }

    res.json({ exists: false, message: "Email available" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE COMPANY ──────────────────────────────────────────────
exports.createCompany = async (req, res) => {
  try {
    const { companyName, email, password, mobileNumber, contactPerson, payLater } = req.body;

    if (!companyName || !email || !password) {
      return res.status(400).json({ success: false, message: "Company name, email and password are required" });
    }

    const existing = await Company.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await Company.create({
      companyName: companyName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      mobileNumber: mobileNumber || null,
      contactPerson: typeof contactPerson === "string" ? contactPerson.trim() : "",
      payLater: !!payLater,
      status: "Active",
      role: "Company"
    });

    // Send welcome email — fire and forget (don't block response on failure)
    sendEmail({
      to: company.email,
      subject: "Welcome — your company portal is ready | Safety Training Academy",
      html: buildCompanyWelcomeHtml({ companyName: company.companyName, email: company.email, password })
    }).catch(err => console.error("Company welcome email failed:", err.message));

    const { password: _, ...companyData } = company.toObject();

    logAdminActivity(req, {
      action: "create",
      module: "company",
      summary: `Added company: ${company.companyName}`,
      targetId: company._id,
      statusCode: 201,
    });
    res.status(201).json({ success: true, data: companyData, message: "Company created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE COMPANY ──────────────────────────────────────────────
exports.updateCompany = async (req, res) => {
  try {
    const { companyName, email, mobileNumber, password, contactPerson, payLater } = req.body;

    const updateData = {};
    if (companyName) updateData.companyName = companyName.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber || null;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (contactPerson !== undefined) {
      updateData.contactPerson = typeof contactPerson === "string" ? contactPerson.trim() : "";
    }
    if (payLater !== undefined) updateData.payLater = !!payLater;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after", runValidators: true }
    ).select("-password");

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    logAdminActivity(req, {
      action: "update",
      module: "company",
      summary: `Updated company: ${company.companyName}`,
      targetId: company._id,
    });
    res.status(200).json({ success: true, data: company, message: "Company updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── TOGGLE PAY LATER ────────────────────────────────────────────
exports.togglePayLater = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    company.payLater = !company.payLater;
    await company.save();

    logAdminActivity(req, {
      action: "toggle",
      module: "company",
      summary: `Pay Later ${company.payLater ? "enabled" : "disabled"} for ${company.companyName}`,
      targetId: company._id,
    });
    res.status(200).json({
      success: true,
      data: { payLater: company.payLater },
      message: `Pay Later ${company.payLater ? "enabled" : "disabled"} for this company`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── TOGGLE STATUS (ACTIVATE / DEACTIVATE) ───────────────────────
exports.toggleCompanyStatus = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    company.status = company.status === "Active" ? "Inactive" : "Active";
    await company.save();

    logAdminActivity(req, {
      action: "toggle",
      module: "company",
      summary: `${company.status === "Active" ? "Activated" : "Deactivated"} company: ${company.companyName}`,
      targetId: company._id,
    });
    res.status(200).json({
      success: true,
      data: { status: company.status },
      message: `Company ${company.status === "Active" ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE COMPANY ──────────────────────────────────────────────
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    logAdminActivity(req, {
      action: "delete",
      module: "company",
      summary: `Deleted company: ${company.companyName}`,
      targetId: company._id,
    });
    res.status(200).json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── COMPANY DETAILS (admin) ─────────────────────────────────────
exports.getCompanyDetails = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).select("-password");
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const rawLinks = await CourseLink.find({ companyId: req.params.id }).sort({ createdAt: -1 }).lean();
    const links = dedupeCourseLinks(rawLinks);

    const linkTokens = links.map(l => l.token);
    const flows = await EnrollmentFlow.find({
      $or: [
        { companyId: req.params.id },
        ...(linkTokens.length > 0 ? [{ sourceToken: { $in: linkTokens } }] : [])
      ]
    })
      .populate("studentId", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    const students = flows.map(flow => {
      const student = flow.studentId;
      const item = flow.items?.[0];
      const payStatus = item?.payment?.status;
      const payLabel = payStatus === "success" ? "Paid" : payStatus === "failed" ? "Failed" : "Pending";
      const llndStatus = flow.llnd?.status === "completed" ? "Completed" : "Not Started";
      const formStatus = flow.enrollmentFormId ? "Submitted" : "Pending";
      const trainingStatus = flow.currentStep >= 4 ? "Completed" : flow.currentStep >= 2 ? "In Progress" : "Not Started";
      return {
        name: student?.name || "—",
        email: student?.email || "—",
        phone: student?.phone || "",
        course: item?.course?.courseName || "—",
        amount: item?.payment?.amount ? `$${item.payment.amount}` : "N/A",
        payment: payLabel,
        llnd: llndStatus,
        form: formStatus,
        training: trainingStatus,
        enrolled: new Date(flow.createdAt).toLocaleDateString("en-GB"),
        bill: "N/A",
        sourceToken: flow.sourceToken || ""
      };
    });

    const orders = await CompanyPayment.find({ companyId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    const purchases = orders.map((p) => ({
      _id: p._id,
      orderId: p.orderId || "",
      createdAt: p.createdAt,
      amount: p.amount || 0,
      status: p.status || "pending",
      confirmed: !!p.confirmed,
      paymentMethod: p.paymentMethod || "",
      gatewayTransactionId: p.gatewayTransactionId || "",
      courses: (p.courses || []).map((c) => ({
        courseName: c.courseName || "",
        courseCode: c.courseCode || "",
        quantity: c.quantity || 1,
        pricePerPerson: c.pricePerPerson || 0,
        sessionDate: c.sessionDate || null,
        startTime: c.startTime || "",
        endTime: c.endTime || "",
      })),
    }));

    res.json({
      success: true,
      data: {
        ...company.toObject(),
        courseLinks: links,
        courseLinksCount: links.length,
        enrolmentsCount: flows.length,
        students,
        purchases,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── COMPANY LOGIN ───────────────────────────────────────────────
exports.companyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const company = await Company.findOne({ email: email.toLowerCase() });
    if (!company) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (company.status === "Inactive") {
      return res.status(403).json({ success: false, message: "Account is deactivated. Contact admin." });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Update last login
    company.lastLogin = new Date();
    await company.save();

    const token = jwt.sign(
      { id: company._id, email: company.email, role: "company" },
      process.env.JWT_SECRET
    );

    const { password: _, ...companyData } = company.toObject();

    res.status(200).json({ success: true, token, data: companyData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};