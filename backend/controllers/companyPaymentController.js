const CompanyPayment = require("../models/CompanyPayment");
const Company = require("../models/Company");
const { logAdminActivity } = require("../utils/logAdminActivity");
const cloudinary = require("../config/cloudinary");
const EnrollmentFlow = require("../models/EnrollmentFlows");
const sendEmail = require("../config/sendEmail");
const CourseLink = require("../models/CourseLink");
const crypto = require("crypto");

const fmtId = (id) => {
  const s = String(id).replace(/\D/g, "");
  return s.length >= 8 ? s.slice(0, 8) : String(id).slice(0, 8).toUpperCase().padStart(8, "0");
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("en-AU", { weekday: "short", year: "numeric", month: "short", day: "numeric", timeZone: "Australia/Sydney" })
  : "TBC";

const buildOrderEmails = (payment) => {
  const orderId = fmtId(payment._id.toString());
  const priceStr = `$${Number(payment.amount).toFixed(2)}`;
  const orderDate = new Date().toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Australia/Sydney" });

  const coursesHtml = (payment.courses || []).map(c => `
        <tr><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#334155;">${c.courseName || "Course"}</p>
            <p style="margin:0 0 2px;font-size:13px;color:#64748b;">Date: ${fmtDate(c.sessionDate)} ${c.startTime ? "· " + c.startTime : ""}</p>
            <p style="margin:0;font-size:13px;color:#64748b;">Qty: ${c.quantity || 1} · $${Number(c.pricePerPerson || 0).toFixed(2)} / person</p>
        </td></tr>`).join("");

  const companyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#02afef 0%,#02afef100%);color:#ffffff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-weight:700;">Order Received – #${orderId}</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p style="margin:0 0 16px;font-size:15px;color:#555;">Dear <strong>${payment.companyName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:15px;color:#555;">Thank you for your booking with Safety Training Academy. We have received your order and will confirm once payment is verified.</p>
    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:20px;">
        <tr><td style="color:#64748b;width:140px;">Order #</td><td><strong>${orderId}</strong></td></tr>
        <tr><td style="color:#64748b;">Order Date</td><td>${orderDate}</td></tr>
        <tr><td style="color:#64748b;">Payment Method</td><td>${payment.paymentMethod || "Bank Transfer"}</td></tr>
        <tr><td style="color:#64748b;">Total Amount</td><td><strong>${priceStr}</strong></td></tr>
    </table>
    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#334155;">Courses Booked</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">${coursesHtml}</table>
    <p style="margin:0 0 16px;font-size:14px;color:#334155;">Once payment is confirmed, employee enrolment links will be shared with you. Please ask your employees to complete the form and LLN assessment before the course date.</p>
    <p style="margin:0;font-size:14px;color:#64748b;">Questions? Contact us at <a href="mailto:info@safetytrainingacademy.edu.au" style="color:#3b82f6;">info@safetytrainingacademy.edu.au</a> or call 1300 976 097.</p>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Kind regards,<br/><strong>Safety Training Academy</strong><br/>Training Team | 1300 976 097</p>
</td></tr>
</table></td></tr></table></body></html>`;

  const internalHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#333;background-color:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#02afef 0%,#02afef100%);color:#ffffff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-weight:700;">NEW COMPANY ORDER #${orderId}</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p style="margin:0 0 16px;font-size:15px;color:#555;">New order from <strong>${payment.companyName}</strong> (${payment.email})</p>
    <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:20px;">
        <tr><td style="color:#64748b;width:140px;">Order #</td><td><strong>${orderId}</strong></td></tr>
        <tr><td style="color:#64748b;">Date</td><td>${orderDate}</td></tr>
        <tr><td style="color:#64748b;">Payment Method</td><td>${payment.paymentMethod || "Bank Transfer"}</td></tr>
        <tr><td style="color:#64748b;">Total</td><td><strong>${priceStr}</strong></td></tr>
    </table>
    <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#334155;">Courses</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">${coursesHtml}</table>
    <p style="margin:16px 0 0;font-size:14px;color:#334155;">Please confirm payment and generate employee enrolment links.</p>
</td></tr>
<tr><td style="padding:20px 30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:13px;color:#64748b;">Safety Training Academy System</p>
</td></tr>
</table></td></tr></table></body></html>`;

  return { orderId, companyHtml, internalHtml };
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET — Admin: all payments
// GET /api/company-payments
// ─────────────────────────────────────────────────────────────────────────────
exports.getAllPayments = async (req, res) => {
  try {
    const { status, confirmed, companyId, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (confirmed) query.confirmed = confirmed === "true";
    if (companyId) query.companyId = companyId;

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      CompanyPayment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      CompanyPayment.countDocuments(query),
    ]);

    res.json({ success: true, data: payments, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET — Company: own payments only
// GET /api/company-payments/my
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyPayments = async (req, res) => {
  try {
    const companyId = req.user?.id;
    if (!companyId) return res.status(401).json({ message: "Unauthorized" });

    const payments = await CompanyPayment.find({ companyId })
      .sort({ createdAt: -1 })
      .lean();

    // Stats
    const totalAmt = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const confirmed = payments.filter(p => p.confirmed).length;
    const pending = payments.filter(p => p.status === "pending").length;

    res.json({
      success: true,
      data: payments,
      stats: {
        total: payments.length,
        confirmed,
        pending,
        totalAmount: totalAmt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST — Company: create payment + upload receipt
// POST /api/company-payments
// body: companyId, amount, paymentMethod, transactionReference, courseCount, flowId
// file: receipt (optional — bank transfer)
// ─────────────────────────────────────────────────────────────────────────────
exports.createPayment = async (req, res) => {
  try {
    const {
      companyId,
      flowId,
      amount,
      paymentMethod,
      transactionReference,
      gatewayTransactionId,
      courseCount,
      notes,
      courses,
    } = req.body;

    if (!companyId || !amount) {
      return res.status(400).json({ message: "companyId and amount are required" });
    }

    // ── Get company snapshot ──────────────────────────────────
    const company = await Company.findById(companyId).lean();
    if (!company) return res.status(404).json({ message: "Company not found" });

    // ── Receipt upload (Cloudinary URL from multer) ───────────
    const receiptUrl = req.file?.path || "";

    const isCard = paymentMethod === "Card" || paymentMethod === "Card Payment";

    // Card payments must have a real eWAY transactionReference to be auto-confirmed.
    const isCardConfirmed = isCard && !!transactionReference;
    let status = isCardConfirmed ? "success" : "pending";
    let confirmed = isCardConfirmed;

    if (isCard && !transactionReference) {
      console.warn(`[CompanyPayment] Card payment created without transactionReference! Setting to pending. Company: ${companyId}`);
    }

    const payment = await CompanyPayment.create({
      companyId,
      flowId: flowId || null,
      companyName: company.companyName,
      email: company.email,
      mobile: company.mobileNumber || "",
      amount: Number(amount),
      paymentMethod: paymentMethod || "Bank Transfer",
      courseCount: Number(courseCount) || courses?.length || 1,  // ✅ AUTO
      courses: courses || [],
      receiptUrl,
      transactionReference: transactionReference || "",
      gatewayTransactionId: isCard ? (gatewayTransactionId || transactionReference || "") : "",
      notes: notes || "",
      status: status,
      confirmed: confirmed,
    });

    // ── AUTOMATIC LINK GENERATION for successful payments ──────
    if (status === "success" && Array.isArray(courses) && courses.length > 0) {
      await Promise.all(courses.map(async (course) => {
        const existing = await CourseLink.findOne({
          companyPaymentId: payment._id,
          courseId: course.courseId,
        });
        if (existing) return existing;

        const token = crypto.randomBytes(20).toString("hex");
        return CourseLink.create({
          companyPaymentId: payment._id,
          companyId: payment.companyId,
          courseId: course.courseId,
          courseName: course.courseName,
          courseCode: course.courseCode || "",
          sessionId: course.sessionId || null,
          sessionDate: course.sessionDate || null,
          startTime: course.startTime || "",
          endTime: course.endTime || "",
          maxUses: course.quantity || 1,
          usedCount: 0,
          token,
          isActive: true,
        });
      }));
      console.log(`[CompanyPayment] Generated links for payment: ${payment._id}`);
    }

    logAdminActivity(req, {
      action: "create",
      module: "company_payment",
      summary: `Company payment created for ${payment.companyName} ($${Number(payment.amount).toFixed(2)})`,
      targetId: payment._id,
      statusCode: 201,
    });
    res.status(201).json({ success: true, data: payment });

    // Send order confirmation emails — fire and forget
    try {
      const { orderId, companyHtml, internalHtml } = buildOrderEmails(payment);
      const promises = [
        sendEmail({ to: payment.email, subject: `Order Received – #${orderId} | Safety Training Academy`, html: companyHtml })
      ];
      if (process.env.BOOKINGS_EMAIL) {
        promises.push(sendEmail({ to: process.env.BOOKINGS_EMAIL, subject: `New Company Order #${orderId} – ${payment.companyName}`, html: internalHtml }));
      }
      await Promise.all(promises);
    } catch (emailErr) {
      console.error("Company order email failed:", emailErr.message);
    }

  } catch (err) {
    console.error("createPayment error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. PATCH — Company: upload / replace receipt
// PATCH /api/company-payments/:id/receipt
// file: receipt
// ─────────────────────────────────────────────────────────────────────────────
exports.uploadReceipt = async (req, res) => {
  try {
    const payment = await CompanyPayment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // ── Delete old receipt from Cloudinary ───────────────────
    if (payment.receiptUrl) {
      try {
        const parts = payment.receiptUrl.split("/");
        const filename = parts[parts.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(`company-receipts/${filename}`);
      } catch (e) {
        console.error("Old receipt delete failed:", e.message);
      }
    }

    payment.receiptUrl = req.file.path;
    await payment.save();

    logAdminActivity(req, {
      action: "update",
      module: "company_payment",
      summary: `Receipt uploaded for ${payment.companyName} payment`,
      targetId: payment._id,
    });
    res.json({ success: true, receiptUrl: payment.receiptUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. PATCH — Admin: confirm payment
// PATCH /api/company-payments/:id/confirm
// ─────────────────────────────────────────────────────────────────────────────
exports.confirmPayment = async (req, res) => {
  try {
    const payment = await CompanyPayment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // ✅ CompanyPayment confirm
    payment.confirmed = true;
    payment.status = "success";
    payment.confirmedAt = new Date();
    payment.confirmedBy = req.user?.id || "admin";
    await payment.save();

    // ✅ EnrollmentFlow-லயும் payment status update
    if (payment.companyId) {
      const EnrollmentFlow = require("../models/EnrollmentFlows");

      // Company-ஓட pending flows எல்லாத்தையும் success பண்ணு
      await EnrollmentFlow.updateMany(
        {
          companyId: payment.companyId,
          "items.0.payment.status": "pending"
        },
        {
          $set: {
            "items.0.payment.status": "success"
          }
        }
      );
    }

    logAdminActivity(req, {
      action: "confirm",
      module: "company_payment",
      summary: `Confirmed payment for ${payment.companyName} ($${Number(payment.amount).toFixed(2)})`,
      targetId: payment._id,
    });
    res.json({ success: true, data: payment });

    // ── GENERATE LINKS after admin confirmation ───────────────
    if (Array.isArray(payment.courses) && payment.courses.length > 0) {
      const CourseLink = require("../models/CourseLink");
      const crypto = require("crypto");
      
      const existingLinks = await CourseLink.countDocuments({ companyPaymentId: payment._id });
      if (existingLinks === 0) {
        await Promise.all(payment.courses.map(async (course) => {
          const token = crypto.randomBytes(20).toString("hex");
          return CourseLink.create({
            companyPaymentId: payment._id,
            companyId: payment.companyId,
            courseId: course.courseId,
            courseName: course.courseName,
            courseCode: course.courseCode || "",
            sessionId: course.sessionId || null,
            sessionDate: course.sessionDate || null,
            startTime: course.startTime || "",
            endTime: course.endTime || "",
            maxUses: course.quantity || 1,
            usedCount: 0,
            token,
            isActive: true,
          });
        }));
        console.log(`[CompanyPayment] Generated links after confirmation for: ${payment._id}`);
      }
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. PATCH — Admin: update status (pending / success / failed)
// PATCH /api/company-payments/:id/status
// body: { status }
// ─────────────────────────────────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "success", "failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const payment = await CompanyPayment.findByIdAndUpdate(
      req.params.id,
      { status, confirmed: status === "success" },
      { returnDocument: "after" }
    );

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    logAdminActivity(req, {
      action: "status_change",
      module: "company_payment",
      summary: `Company payment status set to ${status} for ${payment.companyName}`,
      targetId: payment._id,
    });
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7a. GET — Admin: courses purchased + enrolled students for a payment
// GET /api/company-payments/:id/details
// ─────────────────────────────────────────────────────────────────────────────
exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await CompanyPayment.findById(req.params.id).lean();
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const query = {
      companyId: payment.companyId,
      studentId: { $ne: null },
    };

    if (payment.flowId) {
      query._id = payment.flowId;
    } else if (Array.isArray(payment.courses) && payment.courses.length > 0) {
      const courseNames = payment.courses.map((c) => c.courseName).filter(Boolean);
      const courseCodes = payment.courses.map((c) => c.courseCode).filter(Boolean);
      const sessionDates = payment.courses
        .map((c) => c.sessionDate)
        .filter(Boolean)
        .map((d) => new Date(d));

      const orConditions = [];
      if (courseNames.length) orConditions.push({ "items.0.course.courseName": { $in: courseNames } });
      if (courseCodes.length) orConditions.push({ "items.0.course.courseCode": { $in: courseCodes } });
      if (sessionDates.length) orConditions.push({ sessionDate: { $in: sessionDates } });

      if (orConditions.length > 0) {
        query.$or = orConditions;
      }
    }

    const flows = await EnrollmentFlow.find(query)
      .populate("studentId", "name email phone")
      .lean();

    const enrolledStudents = flows.map((flow) => {
      const s = flow.studentId || {};
      const item = flow.items?.[0] || {};
      return {
        name: s.name || "—",
        email: s.email || "—",
        phone: s.phone || "—",
        course: item.course?.courseName || "—",
        payment: item.payment?.status || "pending",
      };
    });

    res.json({
      success: true,
      courses: payment.courses || [],
      enrolledStudents,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. DELETE — Admin: delete payment record
// DELETE /api/company-payments/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.deletePayment = async (req, res) => {
  try {
    const payment = await CompanyPayment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // Delete receipt from Cloudinary
    if (payment.receiptUrl) {
      try {
        const parts = payment.receiptUrl.split("/");
        const filename = parts[parts.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(`company-receipts/${filename}`);
      } catch (e) { }
    }

    logAdminActivity(req, {
      action: "delete",
      module: "company_payment",
      summary: `Deleted company payment for ${payment.companyName}`,
      targetId: payment._id,
    });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};