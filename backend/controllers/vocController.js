const VocSubmission = require("../models/VocSubmission")
const sendEmail = require("../config/sendEmail")
const { logAdminActivity } = require("../utils/logAdminActivity")

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const parseCourses = (raw) => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

const sanitizeCard = (cardRaw) => {
    if (!cardRaw) return { name: "", last4: "", expiryMonth: "", expiryYear: "" }
    const c = typeof cardRaw === "string" ? safeJson(cardRaw) : cardRaw
    return {
        name: String(c.name || "").trim(),
        last4: String(c.last4 || "").replace(/\D/g, "").slice(-4),
        expiryMonth: String(c.expiryMonth || "").trim().slice(0, 2),
        expiryYear: String(c.expiryYear || "").trim().slice(0, 4),
    }
}

const safeJson = (str) => {
    try { return JSON.parse(str) } catch { return {} }
}

// ─────────────────────────────────────────────────────────────
// Email Templates
// ─────────────────────────────────────────────────────────────
const buildVocStudentHtml = (data) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    dob,
    usi,
    referenceId,
    submittedAt,
    unitOfCompetency,
    unitCode,
    previousTraining,
    evidenceProvided,
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VOC Submission Received – Safety Training Academy</title>
  <style>
    body { margin: 0; padding: 24px; background: #f0f2f5; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #333; }

    /* ── Wrapper ── */
    .eb-body { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; }

    /* ── Header ── */
    .eb-hdr { background: #0d2240; padding: 24px 30px; text-align: center; }
    .eb-hdr h1 { margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; }
    .eb-hdr-sub { margin: 6px 0 0; font-size: 11px; color: #F57C00; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600; }
    .eb-divider { height: 3px; background: #F57C00; }

    /* ── Body ── */
    .eb-content { padding: 28px 30px; }
    .eb-greeting { margin: 0 0 16px; font-size: 14px; color: #555; }
    .eb-intro { margin: 0 0 24px; font-size: 14px; color: #555; }

    /* ── Sections ── */
    .eb-section { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 16px; }
    .eb-section-head { background: #0d2240; padding: 7px 14px; }
    .eb-section-head span { font-size: 10px; font-weight: 700; color: #ffffff; letter-spacing: 1px; text-transform: uppercase; }

    .eb-table { width: 100%; border-collapse: collapse; }
    .eb-table td { padding: 9px 14px; border-bottom: 1px solid #f0f0f0; font-size: 12px; color: #1a1a1a; vertical-align: middle; word-break: break-word; }
    .eb-table tr:last-child td { border-bottom: none; }
    .eb-table td.lbl { width: 40%; background: #fafafa; border-right: 1px solid #f0f0f0; color: #666; font-size: 12px; font-weight: 700; }

    /* ── Status badge ── */
    .eb-status { display: inline-block; background: #fff8e1; color: #b8860b; font-size: 10px; font-weight: 700; padding: 2px 9px; border-radius: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

    /* ── Info box ── */
    .eb-info-box { background: #e8f4fb; border: 1px solid #b3d9f0; border-radius: 4px; padding: 12px 14px; font-size: 13px; color: #0d2240; line-height: 1.6; margin-bottom: 16px; }
    .eb-info-box strong { display: block; margin-bottom: 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #0a5a8a; }

    /* ── Next Steps ── */
    .eb-steps { margin: 0; padding: 0; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
    .eb-step-item { padding: 10px 14px; border-bottom: 1px solid #f0f0f0; font-size: 12px; color: #333; display: table; width: 100%; box-sizing: border-box; }
    .eb-step-item:last-child { border-bottom: none; }
    .eb-step-num { display: table-cell; vertical-align: top; width: 18px; }
    .eb-step-num-inner { background: #0d2240; color: #fff; font-size: 9px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; text-align: center; line-height: 18px; }
    .eb-step-text { display: table-cell; vertical-align: top; padding-left: 10px; line-height: 1.5; }

    /* ── Footer ── */
    .eb-footer { background: #f5f7fa; border-top: 1px solid #e0e0e0; padding: 14px 30px; font-size: 10px; color: #999; text-align: center; line-height: 1.7; }
    .eb-footer a { color: #F57C00; text-decoration: none; }
    .eb-footer strong { color: #555; }
  </style>
</head>
<body>
  <div class="eb-body">

    <!-- ── Header ── -->
    <div class="eb-hdr">
      <h1>VOC Submission Received</h1>
      <p class="eb-hdr-sub">Safety Training Academy &nbsp;·&nbsp; RTO #45234</p>
    </div>
    <div class="eb-divider"></div>

    <div class="eb-content">

      <p class="eb-greeting">Dear <strong>${firstName} ${lastName}</strong>,</p>
      <p class="eb-intro">Thank you for your VOC submission to Safety Training Academy. We have received your request and our team will review it shortly.</p>

      <!-- ── Submission Details ── -->
      <div class="eb-section">
        <div class="eb-section-head"><span>Submission Details</span></div>
        <table class="eb-table">
          <tr><td class="lbl">Booking ID</td><td class="val"><strong>#${referenceId || '—'}</strong></td></tr>
          <tr><td class="lbl">Submitted</td><td class="val">${submittedAt || new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</td></tr>
          <tr><td class="lbl">Status</td><td class="val"><span class="eb-status">Under Review</span></td></tr>
        </table>
      </div>

      <!-- ── Applicant Details ── -->
      <div class="eb-section">
        <div class="eb-section-head"><span>Applicant Details</span></div>
        <table class="eb-table">
          <tr><td class="lbl">Full Name</td><td class="val">${firstName} ${lastName}</td></tr>
          <tr><td class="lbl">Email</td><td class="val">${email || '—'}</td></tr>
          <tr><td class="lbl">Phone</td><td class="val">${phone || '—'}</td></tr>
          <tr><td class="lbl">USI</td><td class="val">${usi || '—'}</td></tr>
          <tr><td class="lbl">Date of Birth</td><td class="val">${dob || '—'}</td></tr>
        </table>
      </div>

      <!-- ── Competency Details ── -->
      <div class="eb-section">
        <div class="eb-section-head"><span>Competency Details</span></div>
        <table class="eb-table">
          <tr><td class="lbl">Unit of Competency</td><td class="val"><strong>${unitCode ? `${unitCode} – ` : ''}${unitOfCompetency || '—'}</strong></td></tr>
          <tr><td class="lbl">Previous Training</td><td class="val">${previousTraining || '—'}</td></tr>
          <tr><td class="lbl">Evidence Provided</td><td class="val">${evidenceProvided || '—'}</td></tr>
        </table>
      </div>

      <!-- ── What Happens Next — "soon" only ── -->
      <div class="eb-info-box">
        <strong>What happens next?</strong>
        Our assessors will review your submitted evidence soon. You will be contacted via email with the outcome or if additional information is required.
      </div>

      <!-- ── Next Steps ── -->
      <div class="eb-section">
        <div class="eb-section-head"><span>Next Steps</span></div>
        <div class="eb-steps">
          <div class="eb-step-item">
            <div class="eb-step-num"><div class="eb-step-num-inner">1</div></div>
            <div class="eb-step-text">Our team will review your evidence and qualifications.</div>
          </div>
          <div class="eb-step-item">
            <div class="eb-step-num"><div class="eb-step-num-inner">2</div></div>
            <div class="eb-step-text">You may be contacted if additional documents or a practical assessment is required.</div>
          </div>
          <div class="eb-step-item">
            <div class="eb-step-num"><div class="eb-step-num-inner">3</div></div>
            <div class="eb-step-text">Once approved, your Statement of Attainment will be issued.</div>
          </div>
        </div>
      </div>

    </div><!-- /eb-content -->

    <!-- ── Footer ── -->
    <div class="eb-footer">
      Questions? Contact us at
      <a href="mailto:admin@safetytrainingacademy.com.au">admin@safetytrainingacademy.com.au</a>
      or call <a href="tel:1300976097">1300 976 097</a>.<br />
      <strong>Safety Training Academy</strong> &nbsp;|&nbsp; RTO #45234<br /><br />
      &copy; ${new Date().getFullYear()} Safety Training Academy. All rights reserved.<br />
      <span style="font-size:9px;">This is an automated confirmation. Please do not reply directly to this email.</span>
    </div>

  </div>
</body>
</html>
`;
};

// Reuses the VOC confirmation HTML body from bookingEmailController so we have
// one source of truth for the brand template.
const sendVocConfirmationEmail = async ({ toEmail, firstName, lastName, submissionId, amountPaid, paymentMethod, courses }) => {
    const shortId = String(submissionId).slice(-8).toUpperCase()
    const priceStr = `$${Number(amountPaid).toFixed(2)}`
    
    // Format courses for the template
    const unitOfCompetency = courses && courses.length > 0 ? courses.map(c => c.name).join(", ") : "—"

    const studentHtml = buildVocStudentHtml({
        firstName,
        lastName,
        email: toEmail,
        phone: "", // Will be populated if needed, or fetched from DB
        usi: "—",
        dob: "—",
        referenceId: shortId,
        submittedAt: new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' }),
        unitOfCompetency,
        unitCode: "", 
        previousTraining: "Yes",
        evidenceProvided: paymentMethod === "Bank Transfer" ? "Bank Receipt Uploaded" : "Credit Card Payment"
    });

    const academyHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#333;background:#f4f4f4;padding:20px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:8px;overflow:hidden;margin:auto;">
<tr><td style="background:#0d2240;color:#fff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:20px;">NEW VOC SUBMISSION</h1>
</td></tr>
<tr><td style="padding:30px;">
    <p>A new VOC submission has been received.</p>
    <table width="100%" cellpadding="10" cellspacing="0" style="background-color:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;">
        <tr><td style="color:#64748b;width:130px;">Name</td><td><strong>${firstName} ${lastName}</strong></td></tr>
        <tr><td style="color:#64748b;">Email</td><td>${toEmail}</td></tr>
        <tr><td style="color:#64748b;">Amount</td><td><strong>${priceStr}</strong></td></tr>
        <tr><td style="color:#64748b;">Payment</td><td>${paymentMethod}</td></tr>
        <tr><td style="color:#64748b;">Booking ID</td><td><code>${submissionId}</code></td></tr>
    </table>
    <p style="margin-top:20px;">Please log in to the admin portal to review this submission.</p>
</td></tr>
</table></body></html>`

    try {
        await sendEmail({ to: toEmail, subject: `VOC Submission Received - #${shortId}`, html: studentHtml })
        if (process.env.BOOKINGS_EMAIL) {
            await sendEmail({ to: process.env.BOOKINGS_EMAIL, subject: `ACTION REQUIRED: New VOC Submission - ${firstName} ${lastName}`, html: academyHtml })
        }
    } catch (err) {
        console.error("VOC confirmation email failed:", err.message)
    }
}

// ─────────────────────────────────────────────────────────────
// POST /api/voc
//   multipart/form-data:
//     - all Step 1 text fields
//     - courses (JSON string)
//     - paymentMethod ("card" | "bank")
//     - card  (JSON string of safe metadata) when card
//     - bank  (JSON string with refId)        when bank
//     - proof (file)                          when bank
// ─────────────────────────────────────────────────────────────
exports.createSubmission = async (req, res) => {
    try {
        const b = req.body || {}

        const courses = parseCourses(b.courses)
        if (courses.length === 0) {
            return res.status(400).json({ error: "At least one course is required." })
        }

        const paymentMethod = (b.paymentMethod || "").toLowerCase()
        if (!["card", "bank"].includes(paymentMethod)) {
            return res.status(400).json({ error: "Invalid payment method." })
        }

        const requiredText = ["firstName", "lastName", "email", "phone", "streetAddress", "city", "state", "postcode"]
        for (const f of requiredText) {
            if (!b[f] || !String(b[f]).trim()) {
                return res.status(400).json({ error: `${f} is required.` })
            }
        }

        const phone = b.phone || b.mobile || b.mobileNumber || b.mobilePhone || ""

        const doc = {
            firstName: b.firstName,
            lastName: b.lastName,
            email: b.email,
            phone: phone,
            studentId: b.studentId || "",
            streetAddress: b.streetAddress,
            city: b.city,
            state: b.state,
            postcode: b.postcode,
            courses,
            amount: courses.reduce((sum, c) => sum + (Number(c.price) || VocSubmission.PRICE_PER_COURSE), 0),
            paymentMethod,
        }

        if (paymentMethod === "card") {
            // Payment was already charged via /api/payment/pay on the frontend.
            // We store the returned transaction ID + safe card metadata only.
            const ewayTxId = String(b.ewayTransactionId || "").replace(/-/g, "").trim()
            if (!ewayTxId) {
                return res.status(400).json({ error: "Payment transaction ID is required." })
            }
            doc.card = sanitizeCard(b.card)
            doc.card.transactionId    = ewayTxId
            doc.ewayTransactionId     = ewayTxId
            doc.gatewayTransactionId  = ewayTxId
            doc.bank = { refId: "", proofUrl: "" }
        } else {
            const bank = typeof b.bank === "string" ? safeJson(b.bank) : (b.bank || {})
            const refId = String(bank.refId || b.bankRefId || "").replace(/-/g, "").trim()
            if (!refId) {
                return res.status(400).json({ error: "Transaction / Reference ID is required for bank transfer." })
            }
            const proofUrl = req.file?.path || req.file?.secure_url || ""
            if (!proofUrl) {
                return res.status(400).json({ error: "Payment receipt is required for bank transfer." })
            }
            doc.bank = { refId, proofUrl }
            doc.card = { name: "", last4: "", expiryMonth: "", expiryYear: "" }
        }

        const submission = await VocSubmission.create(doc)

        // Fire confirmation email (non-blocking failure)
        await sendVocConfirmationEmail({
            toEmail: submission.email,
            firstName: submission.firstName,
            lastName: submission.lastName,
            submissionId: submission._id.toString(),
            amountPaid: submission.amount,
            paymentMethod: paymentMethod === "card" ? "Credit / Debit Card" : "Bank Transfer",
            courses: submission.courses
        })

        logAdminActivity(req, {
            action: "create",
            module: "voc",
            summary: `VOC submission from ${submission.firstName} ${submission.lastName}`,
            targetId: submission._id,
            statusCode: 201,
        })
        res.status(201).json(submission)
    } catch (err) {
        console.error("VOC createSubmission error:", err)
        res.status(500).json({ error: err.message })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/voc — admin list
// ─────────────────────────────────────────────────────────────
exports.listSubmissions = async (_req, res) => {
    try {
        const items = await VocSubmission.find().sort({ createdAt: -1 }).lean()
        res.json(items)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// ─────────────────────────────────────────────────────────────
// GET /api/voc/stats — dashboard counts
// ─────────────────────────────────────────────────────────────
exports.getStats = async (_req, res) => {
    try {
        const [pending, verified, rejected, total] = await Promise.all([
            VocSubmission.countDocuments({ status: "Pending" }),
            VocSubmission.countDocuments({ status: "Verified" }),
            VocSubmission.countDocuments({ status: "Rejected" }),
            VocSubmission.countDocuments({}),
        ])
        res.json({ pending, verified, rejected, total })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/voc/:id/status  { status }
// ─────────────────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body || {}
        if (!["Pending", "Verified", "Rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status." })
        }
        const updated = await VocSubmission.findByIdAndUpdate(
            req.params.id,
            { status, reviewedAt: new Date() },
            { returnDocument: 'after' }
        )
        if (!updated) return res.status(404).json({ error: "Submission not found." })
        logAdminActivity(req, {
            action: "status_change",
            module: "voc",
            summary: `VOC submission status set to ${status}`,
            targetId: updated._id,
        })
        res.json(updated)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/voc/:id
// ─────────────────────────────────────────────────────────────
exports.deleteSubmission = async (req, res) => {
    try {
        const removed = await VocSubmission.findByIdAndDelete(req.params.id)
        if (!removed) return res.status(404).json({ error: "Submission not found." })
        logAdminActivity(req, {
            action: "delete",
            module: "voc",
            summary: `Deleted VOC submission from ${removed.firstName} ${removed.lastName}`,
            targetId: removed._id,
        })
        res.json({ message: "Deleted successfully." })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
