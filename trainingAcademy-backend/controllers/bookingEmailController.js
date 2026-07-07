const sendEmail = require("../config/sendEmail");
const adminBookingTemplate = require("../templates/adminBookingTemplate");
const studentBookingTemplate = require("../templates/studentBookingTemplate");

const formatBookingId = (dateInput) => {
    if (!dateInput) return "0000000000";
    
    // 1. Idempotency: If already a 10-digit numeric string, return it
    if (typeof dateInput === "string" && /^\d{10}$/.test(dateInput)) {
        return dateInput;
    }

    let date;

    // 2. Handle Mongoose ObjectId (object with .getTimestamp() or 24-char hex string)
    if (dateInput && typeof dateInput === "object" && typeof dateInput.getTimestamp === "function") {
        date = dateInput.getTimestamp();
    } else if (dateInput && typeof dateInput === "object" && dateInput._id) {
        // Handle case where the whole document is passed
        return formatBookingId(dateInput._id);
    } else if (typeof dateInput === "string" && dateInput.length === 24) {
        // Hex string ObjectId
        date = new Date(parseInt(dateInput.substring(0, 8), 16) * 1000);
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        date = new Date(dateInput);
    }

    // Fallback to current date if invalid
    if (!date || isNaN(date.getTime())) date = new Date();

    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    
    return `${mm}${dd}${hh}${min}${ss}`;
};

const commonStyles = `
    body { margin: 0; padding: 24px; background: #f0f2f5; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .eb-body { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden; font-size: 13px; color: #1a1a1a; }
    .eb-hdr { background: #0d2240; padding: 16px 24px; }
    .eb-hdr-title { font-size: 16px; font-weight: 700; color: #ffffff; margin: 0; }
    .eb-hdr-sub { font-size: 10px; color: #29b6e8; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600; margin: 0; }
    .eb-badge-sky { background: #29b6e8; color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 3px 10px; border-radius: 2px; display: inline-block; line-height: 1; }
    .eb-booking-id-text { margin: 4px 0 0; font-size: 20px; font-weight: 700; color: #ffffff; text-align: right; }
    .eb-confirm-banner { background: #0d2240; border-top: 1px solid rgba(255,255,255,0.1); padding: 10px 24px; font-size: 12px; color: #ffffff; font-weight: 700; text-align: center; }
    .eb-content { padding: 20px 24px; }
    .eb-section { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 15px; }
    .eb-section-head { background: #0d2240; padding: 7px 14px; }
    .eb-section-head span { font-size: 10px; font-weight: 700; color: #ffffff; letter-spacing: 1px; text-transform: uppercase; }
    .eb-table { width: 100%; border-collapse: collapse; }
    .eb-table td { padding: 10px 14px; border-bottom: 1px solid #f0f0f0; font-size: 12px; color: #1a1a1a; vertical-align: middle; }
    .eb-table td.lbl { width: 35%; background: #fafafa; border-right: 1px solid #f0f0f0; color: #666; font-size: 11px; font-weight: 600; }
    .eb-table td.val-bold { font-weight: 700; color: #0d2240; }
    .eb-footer { background: #f5f7fa; border-top: 1px solid #e0e0e0; padding: 15px 24px; font-size: 10px; color: #999; text-align: center; line-height: 1.6; }
    .status-badge { padding: 2px 9px; border-radius: 2px; font-size: 10px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; display: inline-block; }
    .status-verify { background: #fee2e2; color: #c0392b; }
    .status-confirmed { background: #dcfce7; color: #1e7e34; }
    .status-pending { background: #fef9c3; color: #ca8a04; }
`;

const buildAdminBookingHtml = (data) => {
    const { orderId, name, email, phone, courseName, courseCode, courseDate, courseTime, paymentMethod, paymentStatus, gatewayId, bankRefId, totalAmount, submittedDate } = data;
    let statusClass = paymentStatus === "PLZ VERIFY" ? "status-verify" : (paymentStatus === "PENDING" ? "status-pending" : "status-confirmed");
    const finalGatewayId = (paymentMethod === "Bank Transfer" || paymentMethod === "Pay Later" || !gatewayId) ? "-" : gatewayId;
    const finalBankRefId = (paymentMethod === "Card Payments" || paymentMethod === "Pay Later" || !bankRefId) ? "-" : bankRefId;

    return `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><style>${commonStyles}</style></head><body><div class="eb-body">
    <div class="eb-hdr">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td><p class="eb-hdr-title">Safety Training Academy</p><p class="eb-hdr-sub">RTO #45234 &nbsp;·&nbsp; ADMIN NOTIFICATION</p></td>
                <td align="right"><div class="eb-badge-sky">NEW BOOKING</div></td>
            </tr>
        </table>
        <p class="eb-booking-id-text">Booking ID: ${orderId}</p>
    </div>
    <div class="eb-confirm-banner" style="background:#162c4b;">⚠ ACTION REQUIRED: Confirm payment before scheduling student.</div>
    <div class="eb-content">
        <div class="eb-section"><div class="eb-section-head"><span>STUDENT DETAILS</span></div><table class="eb-table">
            <tr><td class="lbl">Name</td><td class="val-bold">${name}</td></tr>
            <tr><td class="lbl">Email</td><td class="val" style="color:#2563eb;">${email}</td></tr>
            <tr><td class="lbl">Phone</td><td class="val">${phone}</td></tr>
        </table></div>
        <div class="eb-section"><div class="eb-section-head"><span>BOOKING SUMMARY</span></div><table class="eb-table">
            <tr><td class="lbl">Booking ID</td><td class="val-bold">${orderId}</td></tr>
            <tr><td class="lbl">Submitted</td><td class="val">${submittedDate}</td></tr>
            <tr><td class="lbl">Payment Method</td><td class="val">${paymentMethod}</td></tr>
            <tr><td class="lbl">Payment Status</td><td class="val"><span class="status-badge ${statusClass}">${paymentStatus}</span></td></tr>
            <tr><td class="lbl">Gateway Transaction ID</td><td class="val">${finalGatewayId}</td></tr>
            <tr><td class="lbl">Transaction ID</td><td class="val-bold">${finalBankRefId}</td></tr>
            <tr style="background:#f0f9ff;"><td class="lbl" style="background:#f0f9ff; color:#0d2240; font-weight:700;">Total Amount</td><td class="val-bold" style="color:#0d2240; font-size:16px;">$${Number(totalAmount).toFixed(2)}</td></tr>
        </table></div>
        <div class="eb-section"><div class="eb-section-head"><span>COURSE DETAILS</span></div><table class="eb-table">
            <tr><td class="lbl">Course Name</td><td class="val-bold">${courseName}</td></tr>
            <tr><td class="lbl">Course Code</td><td class="val">${courseCode}</td></tr>
            <tr><td class="lbl">Date & Time</td><td class="val">${courseDate} @ ${courseTime}</td></tr>
            <tr><td class="lbl">Location</td><td class="val">3/14-16 Marjorie Street, Sefton NSW 2162</td></tr>
        </table></div>
        <div class="eb-important-box" style="background:#fffbeb; border-color:#fef3c7;"><span class="eb-important-title" style="color:#92400e;">⚠ ACTION REQUIRED</span><p class="eb-important-text" style="color:#b45309;">Please confirm payment before scheduling this student into the course.</p></div>
    </div>
    <div class="eb-footer">This is an automated admin notification from <strong>Safety Training Academy</strong> (RTO #45234).<br/>2 Marjorie St, Sefton NSW 2162 &nbsp;·&nbsp; 1300 976 097 &nbsp;·&nbsp; info@safetytrainingacademy.edu.au</div>
</div></body></html>`;
};

const buildStudentBookingHtml = (data) => {
    const { orderId, name, courseName, courseCode, courseDate, courseTime, paymentMethod, paymentStatus, totalAmount } = data;
    return `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><style>${commonStyles}</style></head><body><div class="eb-body">
    <div class="eb-hdr">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td><p class="eb-hdr-title">Safety Training Academy</p><p class="eb-hdr-sub">RTO #45234 &nbsp;·&nbsp; BOOKING CONFIRMATION</p></td>
                <td align="right"><div class="eb-badge-sky">CONFIRMED</div></td>
            </tr>
        </table>
        <p class="eb-booking-id-text">Booking ID: ${orderId}</p>
    </div>
    <div class="eb-confirm-banner">✓ Booking Confirmed</div>
    <div class="eb-content">
        <p style="color: #1e293b; font-size: 15px; margin: 0 0 20px;">Hi <strong>${name.split(" ")[0]}</strong>,</p>
        <p style="color: #475569; font-size: 14px; margin: 0 0 24px; line-height: 1.5;">Thank you for booking with Safety Training Academy. Your booking is confirmed — please review the details below and make sure all pre-course steps are completed before your training date.</p>
        
        <div class="eb-section"><div class="eb-section-head"><span>COURSE DETAILS</span></div><table class="eb-table">
            <tr><td class="lbl">Booking ID</td><td class="val-bold">${orderId}</td></tr>
            <tr><td class="lbl">Course</td><td class="val-bold">${courseName}</td></tr>
            <tr><td class="lbl">Course Code</td><td class="val">${courseCode}</td></tr>
            <tr><td class="lbl">Delivery Mode</td><td class="val">Face-to-Face</td></tr>
            <tr><td class="lbl">Date</td><td class="val">${courseDate}</td></tr>
            <tr><td class="lbl">Time</td><td class="val">${courseTime}</td></tr>
            <tr><td class="lbl">Location</td><td class="val">3/14-16 Marjorie Street, Sefton NSW 2162</td></tr>
            <tr><td class="lbl">Trainer</td><td class="val">To be assigned</td></tr>
        </table></div>

        <div class="eb-section"><div class="eb-section-head"><span>PAYMENT DETAILS</span></div><table class="eb-table">
            <tr><td class="lbl">Total Paid</td><td class="val-bold">$${Number(totalAmount).toFixed(2)}</td></tr>
            <tr><td class="lbl">Method</td><td class="val">${paymentMethod}</td></tr>
            <tr><td class="lbl">Status</td><td class="val-bold">${paymentStatus}</td></tr>
        </table></div>

        <div class="eb-important-box">
            <span class="eb-important-title">⚠ IMPORTANT — ACTION REQUIRED</span>
            <p class="eb-important-text">Please finish your LLN & Enrolment in the Student Portal before attending the course. Your spot will not be confirmed until this is completed.</p>
        </div>

        <div class="eb-section"><div class="eb-section-head"><span>NEXT STEPS</span></div><div style="padding:20px;">
            <div class="eb-step"><div class="eb-step-num">1</div><div class="eb-step-text">Log in to the <a href="https://www.safetytrainingacademy.edu.au/login" style="color:#29b6e8; font-weight:700; text-decoration:none;">Student Portal</a> and complete your <strong>LLN Assessment</strong> and <strong>Enrolment Form</strong>.</div></div>
            <div class="eb-step"><div class="eb-step-num">2</div><div class="eb-step-text">Ensure you have a valid <strong>USI</strong>. Visit <a href="https://www.usi.gov.au" style="color:#29b6e8; text-decoration:none;">usi.gov.au</a> if needed.</div></div>
            <div class="eb-step"><div class="eb-step-num">3</div><div class="eb-step-text">Arrive at the venue at least <strong>15 minutes early</strong> with photo ID.</div></div>
            <div class="eb-step"><div class="eb-step-num">4</div><div class="eb-step-text">Check your email for any updates regarding your session.</div></div>
        </div></div>

        <div class="eb-section"><div class="eb-section-head"><span>WHAT TO BRING</span></div><div style="padding:15px 20px;">
            <div class="eb-check-item"><span class="eb-check-icon">✓</span> Photo ID (driver's licence or passport)</div>
            <div class="eb-check-item"><span class="eb-check-icon">✓</span> Confirmation of your USI</div>
            <div class="eb-check-item"><span class="eb-check-icon">✓</span> Appropriate PPE for the course (if advised)</div>
            <div class="eb-check-item"><span class="eb-check-icon">✓</span> Sturdy, enclosed footwear — no thongs or open-toed shoes</div>
            <div class="eb-check-item"><span class="eb-check-icon">✓</span> Water bottle and snacks — a break will be provided</div>
        </div></div>
    </div>
    <div class="eb-footer">
        Questions? <a href="mailto:admin@safetytrainingacademy.com.au" style="color:#29b6e8; text-decoration:none;">admin@safetytrainingacademy.com.au</a> | 1300 976 097<br/>
        <strong>Safety Training Academy</strong> | RTO #45234 | <a href="https://www.safetytrainingacademy.edu.au" style="color:#29b6e8; text-decoration:none;">Student Portal</a><br/><br/>
        &copy; ${new Date().getFullYear()} Safety Training Academy. All rights reserved.<br/>
        This is an automated confirmation. Please do not reply directly to this email.
    </div>
</div></body></html>`;
};

const sendBookingConfirmation = async (req, res) => {
    const { name, email, phone, courseName, courseCode, courseDate, startTime, endTime, coursePrice, paymentMethod, gatewayTransactionId, bankTransferId, bookingId } = req.body;
    const orderId = formatBookingId(bookingId || Date.now().toString());
    const submittedDate = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const formattedDate = courseDate ? new Date(courseDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "TBC";
    const timeRange = `${startTime} - ${endTime}`;

    let adminStatus = "PAID";
    let studentStatus = "Paid";
    if (paymentMethod === "Bank Transfer") { adminStatus = "PLZ VERIFY"; studentStatus = "Awaiting Verification"; }
    else if (paymentMethod === "Pay Later") { adminStatus = "PENDING"; studentStatus = "Pending"; }
    else if (paymentMethod === "Card Payment" && !gatewayTransactionId) { adminStatus = "PLZ VERIFY"; studentStatus = "Awaiting Verification"; }

    const adminHtml = adminBookingTemplate({ 
        bookingId: orderId,
        contactName: name,
        contactEmail: email,
        contactPhone: phone,
        courseName, 
        courseCode, 
        courseDate: formattedDate, 
        courseTime: timeRange, 
        paymentMethod, 
        paymentStatus: adminStatus,
        totalAmount: Number(coursePrice).toFixed(2), 
        submittedAt: submittedDate,
        gatewayId: gatewayTransactionId,
        bankTransferId: bankTransferId,
        venue: "3/14-16 Marjorie Street, Sefton NSW 2162"
    });
    
    const studentHtml = studentBookingTemplate({ 
        bookingId: orderId, 
        name, 
        email,
        phone,
        courseName, 
        courseCode, 
        courseDate: formattedDate, 
        courseTime: timeRange, 
        paymentMethod, 
        paymentStatus: studentStatus, 
        totalAmount: coursePrice 
    });

    try {
        await sendEmail({ to: email, subject: `Booking Confirmed - ${courseName} (Order #${orderId})`, html: studentHtml });
        
        // Admin Notifications (Send to both Academy and Tech Team)
        const adminRecipients = [process.env.BOOKINGS_EMAIL, process.env.NOTIFY_EMAIL].filter(Boolean);
        for (const recipient of adminRecipients) {
            setTimeout(async () => {
                try { 
                    await sendEmail({ to: recipient, subject: `NEW BOOKING: ${name} - ${courseName} (#${orderId})`, html: adminHtml }); 
                } catch (e) {}
            }, 10000);
        }
        if (res) res.status(200).json({ success: true });
    } catch (err) { if (res) res.status(500).json({ success: false }); }
};

const buildCommonHeader = (title, subTitle, badgeText, bookingId, isAdmin = false) => {
  const digits = formatBookingId(bookingId);
  return `
    <div class="eb-hdr" style="background:#0d2240; padding:24px 30px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="top">
            <p class="eb-hdr-title" style="font-size:18px; font-weight:700; color:#ffffff; margin:0;">Safety Training Academy</p>
            <p class="eb-hdr-sub" style="font-size:10px; color:#29b6e8; letter-spacing:0.8px; text-transform:uppercase; font-weight:600; margin:4px 0 0;">RTO #45234 &nbsp;·&nbsp; ${subTitle}</p>
          </td>
          <td align="right" valign="top">
            <div style="display:inline-block; text-align:right; min-width: 200px;">
              <div class="eb-badge-sky" style="background:#29b6e8; color:#ffffff; font-size:16px; font-weight:800; letter-spacing:1px; text-transform:uppercase; padding:6px 0; border-radius:3px; display:block; text-align:center; line-height:1; margin-bottom:8px;">${badgeText}</div>
              <p class="eb-booking-id-text" style="margin:0; font-size:24px; font-weight:700; color:#ffffff; line-height:1; white-space:nowrap;">Booking ID: ${digits}</p>
            </div>
          </td>
        </tr>
      </table>
    </div>
    ${isAdmin ? `<div class="eb-confirm-banner" style="background:#0a1c33; padding:10px 24px; font-size:12px; color:#89c8e8; font-weight:700; text-align:center; border-bottom:3px solid #29b6e8;">Action Required</div>` : ''}
  `;
};

const buildLLNNotificationHtml = (data, isAdmin = false) => {
  const { bookingId, studentName, studentEmail, studentPhone, score, status, gatewayTransactionId } = data;
  const statusColor = status === "Passed" ? "#16a34a" : "#ca8a04";
  const cleanGatewayId = String(gatewayTransactionId || '').replace(/-/g, '');
  const subTitle = isAdmin ? "LLN NOTIFICATION" : "ASSESSMENT CONFIRMATION";
  
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><style>${commonStyles}</style></head><body><div class="eb-body">${buildCommonHeader("Safety Training Academy", subTitle, "LLN SUBMITTED", bookingId, isAdmin)}<div class="eb-content"><div class="eb-section"><div class="eb-section-head"><span>STUDENT DETAILS</span></div><table class="eb-table"><tr><td class="lbl">Name</td><td class="val-bold">${studentName}</td></tr><tr><td class="lbl">Email</td><td class="val">${studentEmail}</td></tr><tr><td class="lbl">Phone Number</td><td class="val">${studentPhone}</td></tr></table></div><div class="eb-section"><div class="eb-section-head"><span>ASSESSMENT RESULT</span></div><table class="eb-table"><tr><td class="lbl">Booking ID</td><td class="val-bold">${formatBookingId(bookingId)}</td></tr><tr><td class="lbl">Score</td><td class="val-bold" style="font-size:18px;">${Number(score).toFixed(1)}%</td></tr><tr><td class="lbl">Status</td><td class="val-bold" style="color:${statusColor};">${status}</td></tr>${cleanGatewayId && cleanGatewayId !== '—' && cleanGatewayId !== '-' ? `<tr><td class="lbl">Transaction ID</td><td class="val">${cleanGatewayId}</td></tr>` : ''}</table></div></div><div class="eb-footer">&copy; ${new Date().getFullYear()} Safety Training Academy. All rights reserved.</div></div></body></html>`;
};

const buildEnrollmentNotificationHtml = (data, isAdmin = false) => {
  const { bookingId, studentName, studentEmail, studentPhone, gatewayTransactionId } = data;
  const cleanGatewayId = String(gatewayTransactionId || '').replace(/-/g, '');
  const subTitle = isAdmin ? "ENROLLMENT NOTIFICATION" : "ENROLLMENT CONFIRMATION";
  const introText = isAdmin 
    ? "A student has submitted their enrollment form and is awaiting review." 
    : "Thank you for submitting your enrollment form. Our team will review your documents shortly.";
  
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><style>${commonStyles}</style></head><body><div class="eb-body">${buildCommonHeader("Safety Training Academy", subTitle, "ENROLLMENT SUBMITTED", bookingId, isAdmin)}<div class="eb-content"><p style="color: #475569; font-size: 14px; margin: 0 0 24px;">${introText}</p><div class="eb-section"><div class="eb-section-head"><span>STUDENT DETAILS</span></div><table class="eb-table"><tr><td class="lbl">Student Name</td><td class="val-bold">${studentName}</td></tr><tr><td class="lbl">Email</td><td class="val" style="color:#2563eb;">${studentEmail}</td></tr><tr><td class="lbl">Phone Number</td><td class="val">${studentPhone}</td></tr><tr><td class="lbl">Booking ID</td><td class="val-bold">${formatBookingId(bookingId)}</td></tr><tr><td class="lbl">Transaction ID</td><td class="val">${cleanGatewayId && cleanGatewayId !== '-' ? cleanGatewayId : '—'}</td></tr></table></div>${isAdmin ? `<p style="margin-top:24px; color:#475569; font-size:14px;">Please log in to the admin portal to review the form and documents.</p>` : ''}</div><div class="eb-footer">&copy; ${new Date().getFullYear()} Safety Training Academy. All rights reserved.</div></div></body></html>`;
};

const sendEnrollmentLinkConfirmation = async (req, res) => {
    const { toEmail, studentName, courseName, courseCode, courseDate, startTime, endTime, bookingId, phone, totalAmount, paymentMethod, isAgent } = req.body;
    
    const orderId = formatBookingId(bookingId || Date.now().toString());
    const dateStr = courseDate ? new Date(courseDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "TBC";
    const timeStr = (startTime && endTime) ? `${startTime} - ${endTime}` : "TBC";

    const studentHtml = studentBookingTemplate({ 
        bookingId: orderId, 
        name: studentName, 
        email: toEmail,
        phone: phone || "—",
        courseName, 
        courseCode: courseCode || "—", 
        courseDate: dateStr, 
        courseTime: timeStr, 
        paymentMethod: paymentMethod || "Pay Later", 
        paymentStatus: "Pending", 
        totalAmount: totalAmount || 0,
        hideAmount: isAgent ? true : false
    });

    const submittedDate = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const adminHtml = adminBookingTemplate({
        bookingId: orderId,
        contactName: studentName,
        contactEmail: toEmail,
        contactPhone: phone || "—",
        courseName,
        courseCode: courseCode || "—",
        courseDate: dateStr,
        courseTime: timeStr,
        paymentMethod: paymentMethod || "Pay Later",
        paymentStatus: "PENDING",
        totalAmount: Number(totalAmount || 0).toFixed(2),
        submittedAt: submittedDate,
        gatewayId: "-",
        bankTransferId: "-",
        venue: "3/14-16 Marjorie Street, Sefton NSW 2162",
        isAgent: isAgent ? true : false
    });

    try { 
        await sendEmail({ to: toEmail, subject: `Registration Confirmed - ${courseName}`, html: studentHtml }); 

        // Admin Notifications (Send to both Academy and Tech Team)
        const adminRecipients = [process.env.BOOKINGS_EMAIL, process.env.NOTIFY_EMAIL].filter(Boolean);
        for (const recipient of adminRecipients) {
            setTimeout(async () => {
                try { 
                    await sendEmail({ to: recipient, subject: `NEW BOOKING: ${studentName} - ${courseName} (#${orderId})`, html: adminHtml }); 
                } catch (e) {}
            }, 10000);
        }

        res.status(200).json({ success: true }); 
    } catch (err) { 
        res.status(500).json({ success: false }); 
    }
};

const sendCompanyOrderConfirmation = async (req, res) => {
    const { toEmail, companyName, orderId: rawOrderId, totalAmount, links = [] } = req.body;
    const orderId = formatBookingId(rawOrderId || Date.now().toString());
    const priceStr = `$${Number(totalAmount).toFixed(2)}`;
    const linksHtml = links.map(l => `
        <tr><td style="padding:15px; border-bottom:1px solid #f1f5f9; background:#ffffff;">
            <p style="margin:0; font-size:14px; font-weight:700; color:#0d2240;">${l.courseName}</p>
            <p style="margin:6px 0 0; font-size:12px;"><a href="${l.fullUrl}" style="color:#29b6e8; text-decoration:none; font-weight:600;">Click to Register &rarr;</a></p>
            <p style="margin:4px 0 0; font-size:10px; color:#94a3b8; word-break:break-all;">${l.fullUrl}</p>
        </td></tr>`).join("");
    
    const html = `
<!DOCTYPE html><html><head><style>body{margin:0;padding:24px;background:#f0f2f5;font-family:sans-serif;}.card{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;}.hdr{background:#0d2240;padding:20px 30px;color:#fff;}.hdr h2{margin:0;font-size:18px;text-transform:uppercase;letter-spacing:1px;}.content{padding:30px;}.footer{background:#f8fafc;padding:20px;text-align:center;font-size:11px;color:#999;border-top:1px solid #e0e0e0;}</style></head><body>
<div class="card"><div class="hdr"><h2>Company Booking Confirmed</h2><p style="margin:4px 0 0; font-size:10px; color:#29b6e8;">Booking ID: ${orderId}</p></div><div class="content"><p style="font-size:15px; color:#1e293b;">Dear <strong>${companyName}</strong>,</p><p style="font-size:14px; color:#475569; line-height:1.6;">Thank you for your booking. Below are the registration links for your employees. Each link allows for the specific quantity purchased.</p><table width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0; border:1px solid #e0e0e0; border-radius:4px; overflow:hidden;">${linksHtml}</table><div style="background:#f0f9ff; padding:15px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;"><span style="font-size:13px; font-weight:700; color:#0d2240;">Total Amount Paid</span><span style="font-size:16px; font-weight:700; color:#0d2240;">${priceStr}</span></div></div><div class="footer">&copy; ${new Date().getFullYear()} Safety Training Academy | RTO #45234</div></div></body></html>`;
    try { await sendEmail({ to: toEmail, subject: `Company Booking Confirmed - Order #${orderId}`, html, bcc: process.env.BOOKINGS_EMAIL }); res.status(200).json({ success: true }); } catch (err) { res.status(500).json({ success: false }); }
};

const sendCompanyPortalWelcome = async (req, res) => {
    const { toEmail, companyName, initialPassword, loginBaseUrl, portalEnrollmentUrl } = req.body;
    const html = `
<!DOCTYPE html><html><head><style>body{margin:0;padding:24px;background:#f0f2f5;font-family:sans-serif;}.card{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;}.hdr{background:#0d2240;padding:20px 30px;color:#fff;}.content{padding:30px;}.footer{background:#f8fafc;padding:20px;text-align:center;font-size:11px;color:#999;border-top:1px solid #e0e0e0;}</style></head><body>
<div class="card"><div class="hdr"><h2>Welcome to Safety Training Academy</h2><p style="margin:4px 0 0; font-size:10px; color:#29b6e8;">COMPANY PORTAL ACCESS</p></div><div class="content"><p style="font-size:15px; color:#1e293b;">Dear <strong>${companyName}</strong>,</p><p style="font-size:14px; color:#475569; line-height:1.6;">Your company portal has been activated. You can now manage your employees and track their progress through your dashboard.</p><div style="background:#f8fafc; border:1px solid #e0e0e0; border-radius:6px; padding:20px; margin:20px 0;"><table width="100%"><tr><td style="font-size:12px; color:#64748b; padding-bottom:8px;">Portal URL</td><td style="font-size:13px; font-weight:700; color:#0d2240; padding-bottom:8px;"><a href="${loginBaseUrl}" style="color:#29b6e8; text-decoration:none;">${loginBaseUrl}</a></td></tr><tr><td style="font-size:12px; color:#64748b;">Password</td><td style="font-size:13px; font-weight:700; color:#0d2240; font-family:monospace;">${initialPassword}</td></tr></table></div><div style="background:#f0f9ff; padding:15px; border-radius:6px;"><p style="margin:0 0 8px; font-size:11px; font-weight:700; color:#0d2240; text-transform:uppercase;">Quick Enrollment Link for Employees</p><p style="margin:0; font-size:12px; color:#29b6e8; word-break:break-all;">${portalEnrollmentUrl}</p></div></div><div class="footer">&copy; ${new Date().getFullYear()} Safety Training Academy | RTO #45234</div></div></body></html>`;
    try { await sendEmail({ to: toEmail, subject: "Welcome to Safety Training Academy Company Portal", html, bcc: process.env.BOOKINGS_EMAIL }); res.status(200).json({ success: true }); } catch (err) { res.status(500).json({ success: false }); }
};

const sendVOCConfirmation = async (req, res) => {
    const { toEmail, firstName, submissionId, amountPaid } = req.body;
    const html = `
<!DOCTYPE html><html><head><style>body{margin:0;padding:24px;background:#f0f2f5;font-family:sans-serif;}.card{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;}.hdr{background:#0d2240;padding:20px 30px;color:#fff;}.content{padding:30px;}.footer{background:#f8fafc;padding:20px;text-align:center;font-size:11px;color:#999;border-top:1px solid #e0e0e0;}</style></head><body>
<div class="card"><div class="hdr"><h2>VOC Submission Received</h2><p style="margin:4px 0 0; font-size:10px; color:#29b6e8;">Booking ID: ${submissionId}</p></div><div class="content"><p style="font-size:15px; color:#1e293b;">Hi <strong>${firstName}</strong>,</p><p style="font-size:14px; color:#475569; line-height:1.6;">Thank you for your VOC submission. We have received your application and the payment of <strong>$${Number(amountPaid).toFixed(2)}</strong>. Our team will review the documents and get back to you shortly.</p></div><div class="footer">&copy; ${new Date().getFullYear()} Safety Training Academy | RTO #45234</div></div></body></html>`;
    try { await sendEmail({ to: toEmail, subject: "VOC Submission Received", html, bcc: process.env.BOOKINGS_EMAIL }); res.status(200).json({ success: true }); } catch (err) { res.status(500).json({ success: false }); }
};

const sendEmailOTP = async (req, res) => {
    const { toEmail, otp } = req.body;
    const html = `
<!DOCTYPE html><html><head><style>body{margin:0;padding:24px;background:#f0f2f5;font-family:sans-serif;}.card{max-width:400px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;box-shadow:0 4px 12px rgba(0,0,0,0.05);}.hdr{background:#0d2240;padding:24px;color:#fff;text-align:center;}.hdr h2{margin:0;font-size:16px;text-transform:uppercase;letter-spacing:1px;}.content{padding:40px 30px;text-align:center;}.otp-box{font-size:36px;font-weight:700;color:#0d2240;background:#f0f9ff;padding:20px;border-radius:8px;border:2px dashed #29b6e8;letter-spacing:8px;margin:20px 0;}.footer{background:#f8fafc;padding:15px;text-align:center;font-size:10px;color:#999;border-top:1px solid #e0e0e0;}</style></head><body>
<div class="card"><div class="hdr"><h2>Verification Code</h2></div><div class="content"><p style="margin:0; font-size:14px; color:#475569;">Use the code below to complete your verification:</p><div class="otp-box">${otp}</div><p style="margin:0; font-size:12px; color:#94a3b8;">This code will expire in 10 minutes.</p></div><div class="footer">Safety Training Academy | RTO #45234</div></div></body></html>`;
    try { await sendEmail({ to: toEmail, subject: `${otp} is your verification code`, html }); res.status(200).json({ success: true }); } catch (err) { res.status(500).json({ success: false }); }
};

const sendCompanyBankTransfer = async (req, res) => {
    const { companyEmail, amount, submissionId } = req.body;
    const html = `<html><body><h2>Bank Transfer Notice</h2><p>Amount: $${amount}, Ref: ${submissionId}</p></body></html>`;
    try { await sendEmail({ to: companyEmail, subject: "Bank Transfer Notice Received", html, bcc: process.env.BOOKINGS_EMAIL }); res.status(200).json({ success: true }); } catch (err) { res.status(500).json({ success: false }); }
};

const sendCompanyCardPayment = async (req, res) => {
    const { companyEmail, amount } = req.body;
    const html = `<html><body><h2>Card Payment Received</h2><p>Amount: $${amount}</p></body></html>`;
    try { await sendEmail({ to: companyEmail, subject: "Payment Received", html, bcc: process.env.BOOKINGS_EMAIL }); res.status(200).json({ success: true }); } catch (err) { res.status(500).json({ success: false }); }
};

const sendLLNCompletionNotification = async (req, res) => {
    const { studentEmail, studentName, score, isPassed, bookingId, studentPhone, gatewayTransactionId } = req.body;
    const status = isPassed ? "Passed" : "Under Review";
    
    const studentHtml = buildLLNNotificationHtml({ bookingId, studentName, studentEmail, studentPhone, score, status, gatewayTransactionId }, false);
    const adminHtml = buildLLNNotificationHtml({ bookingId, studentName, studentEmail, studentPhone, score, status, gatewayTransactionId }, true);

    try { 
        // Send to student
        await sendEmail({ to: studentEmail, subject: `LLN Assessment Completed - ${studentName}`, html: studentHtml }); 
        
        // Send to admin separately (Academy and Tech Team)
        const adminRecipients = [process.env.BOOKINGS_EMAIL, process.env.NOTIFY_EMAIL].filter(Boolean);
        for (const recipient of adminRecipients) {
          try {
            await sendEmail({ to: recipient, subject: `NEW LLN SUBMISSION: ${studentName}`, html: adminHtml });
          } catch (e) {}
        }

        if (res) res.status(200).json({ success: true }); 
    } catch (err) { 
        console.error("❌ sendLLNCompletionNotification Error:", err.message);
        if (res) res.status(500).json({ success: false, error: err.message }); 
    }
};

const sendEnrollmentFormCompletionNotification = async (req, res) => {
    const { studentEmail, studentName, bookingId, studentPhone, gatewayTransactionId } = req.body;
    
    const studentHtml = buildEnrollmentNotificationHtml({ bookingId, studentName, studentEmail, studentPhone, gatewayTransactionId }, false);
    const adminHtml = buildEnrollmentNotificationHtml({ bookingId, studentName, studentEmail, studentPhone, gatewayTransactionId }, true);

    try { 
        // Send to student
        await sendEmail({ to: studentEmail, subject: `Enrollment Form Submitted - ${studentName}`, html: studentHtml }); 
        
        // Send to admin separately (Academy and Tech Team)
        const adminRecipients = [process.env.BOOKINGS_EMAIL, process.env.NOTIFY_EMAIL].filter(Boolean);
        for (const recipient of adminRecipients) {
          try {
            await sendEmail({ to: recipient, subject: `NEW ENROLLMENT SUBMISSION: ${studentName}`, html: adminHtml });
          } catch (e) {}
        }

        if (res) res.status(200).json({ success: true }); 
    } catch (err) { 
        console.error("❌ sendEnrollmentFormCompletionNotification Error:", err.message);
        if (res) res.status(500).json({ success: false, error: err.message }); 
    }
};

module.exports = {
    sendBookingConfirmation,
    sendCompanyOrderConfirmation,
    sendEnrollmentLinkConfirmation,
    sendCompanyPortalWelcome,
    sendVOCConfirmation,
    sendEmailOTP,
    sendCompanyBankTransfer,
    sendCompanyCardPayment,
    sendLLNCompletionNotification,
    sendEnrollmentFormCompletionNotification,
    formatBookingId,
};
