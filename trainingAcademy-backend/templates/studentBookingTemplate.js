const studentBookingTemplate = (data) => {
  // Clean IDs: remove hyphens and non-numeric chars for Booking ID
  const digits = String(data.bookingId || '').replace(/[^0-9]/g, '');
  const orderNumber = digits !== '' ? digits : (data.bookingId || '—');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmation - Safety Training Academy</title>
  <style>
    body { margin: 0; padding: 24px; background: #f0f2f5; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .eb-body { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden; font-size: 13px; color: #1a1a1a; }
    
    /* ── Header ── */
    .eb-hdr { background: #0d2240; padding: 16px 24px; }
    .eb-hdr-title { font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 2px; }
    .eb-hdr-sub { font-size: 10px; color: #29b6e8; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600; margin: 0; }
    .eb-badge { background: #29b6e8; color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 3px 10px; border-radius: 2px; white-space: nowrap; display: inline-block; line-height: 1; }

    /* ── Success bar ── */
    .eb-alert { background: #0d2240; border-top: 1px solid rgba(255,255,255,0.1); padding: 12px 24px; font-size: 14px; color: #ffffff; font-weight: 700; text-align: center; }

    /* ── Content ── */
    .eb-content { padding: 20px 24px; }
    .eb-welcome { font-size: 15px; color: #1e293b; margin-bottom: 20px; }

    /* ── Sections ── */
    .eb-section { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 15px; }
    .eb-section-head { background: #0d2240; padding: 7px 14px; }
    .eb-section-head span { font-size: 10px; font-weight: 700; color: #ffffff; letter-spacing: 1px; text-transform: uppercase; }
    
    .eb-table { width: 100%; border-collapse: collapse; }
    .eb-table td { padding: 10px 14px; border-bottom: 1px solid #f0f0f0; font-size: 12px; color: #1a1a1a; vertical-align: middle; }
    .eb-table tr:last-child td { border-bottom: none; }
    .eb-table td.lbl { width: 35%; background: #fafafa; border-right: 1px solid #f0f0f0; color: #666; font-size: 11px; font-weight: 600; }
    .eb-table td.val-bold { font-weight: 700; color: #0d2240; }

    /* ── Important Box ── */
    .eb-important-box { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; padding: 16px 20px; margin-bottom: 20px; }
    .eb-important-title { color: #9f1239; font-size: 13px; font-weight: 700; margin-bottom: 4px; display: block; }
    .eb-important-text { color: #be123c; font-size: 13px; margin: 0; line-height: 1.5; }

    /* ── Steps ── */
    .eb-steps-container { margin-bottom: 20px; }
    .eb-step { display: table; margin-bottom: 12px; }
    .eb-step-num { background: #0d2240; color: #fff; width: 22px; height: 22px; border-radius: 50%; text-align: center; line-height: 22px; font-size: 11px; font-weight: 700; display: table-cell; vertical-align: top; }
    .eb-step-text { font-size: 13px; color: #475569; line-height: 1.5; padding-left: 12px; display: table-cell; vertical-align: top; }
    .eb-step-text a { color: #29b6e8; text-decoration: none; font-weight: 700; }

    /* ── Checklist ── */
    .eb-check-item { margin-bottom: 8px; font-size: 13px; color: #475569; }
    .eb-check-icon { color: #29b6e8; margin-right: 10px; font-weight: bold; font-size: 16px; }

    /* ── Footer ── */
    .eb-footer { background: #f5f7fa; border-top: 1px solid #e0e0e0; padding: 15px 24px; font-size: 10px; color: #999; text-align: center; line-height: 1.6; }
    .eb-footer a { color: #29b6e8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="eb-body">
    <div class="eb-hdr">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <p class="eb-hdr-title">Safety Training Academy</p>
            <p class="eb-hdr-sub">RTO #45234 &nbsp;·&nbsp; BOOKING CONFIRMATION</p>
          </td>
          <td align="right" valign="top">
            <div style="display:inline-block; text-align:right; min-width: 200px;">
              <span class="eb-badge" style="background:#29b6e8; color:#ffffff; font-size:16px; font-weight:800; letter-spacing:1px; text-transform:uppercase; padding:6px 0; border-radius:3px; display:block; text-align:center; line-height:1; margin-bottom:8px;">Confirmed</span>
              <p style="margin:0; font-size:24px; font-weight:700; color:#ffffff; line-height:1; white-space:nowrap;">
                Booking ID: ${orderNumber}
              </p>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <div class="eb-alert">✓ Your booking has been confirmed!</div>

    <div class="eb-content">
      <p class="eb-welcome">Hi <strong>${(data.name || '').split(' ')[0]}</strong>,</p>
      <p style="color: #475569; font-size: 13px; margin: 0 0 20px; line-height: 1.6;">
        Thank you for booking with Safety Training Academy. Your spot is secured. Please review your details below and complete the required pre-course assessments.
      </p>

      <div class="eb-section">
        <div class="eb-section-head"><span>Student Details</span></div>
        <table class="eb-table">
          <tr><td class="lbl">Name</td><td class="val">${data.name || '—'}</td></tr>
          <tr><td class="lbl">Email</td><td class="val">${data.email || '—'}</td></tr>
          <tr><td class="lbl">Phone</td><td class="val">${data.phone || '—'}</td></tr>
        </table>
      </div>

      <div class="eb-section">
        <div class="eb-section-head"><span>Course Details</span></div>
        <table class="eb-table">
          <tr><td class="lbl">Course</td><td class="val"><strong style="color:#0d2240;">${data.courseName}</strong></td></tr>
          <tr><td class="lbl">Date & Time</td><td class="val">${data.courseDate} @ ${data.courseTime}</td></tr>
          <tr><td class="lbl">Location</td><td class="val">3/14-16 Marjorie Street, Sefton NSW 2162</td></tr>
        </table>
      </div>

      <div class="eb-section">
        <div class="eb-section-head"><span>Booking Summary</span></div>
        <table class="eb-table">
          ${data.hideAmount ? '' : `<tr><td class="lbl">Total Amount</td><td class="val val-bold">$${Number(data.totalAmount).toFixed(2)}</td></tr>`}
          <tr><td class="lbl">Method</td><td class="val">${data.paymentMethod}</td></tr>
          <tr><td class="lbl">Status</td><td class="val">${data.paymentStatus}</td></tr>
        </table>
      </div>

      <div class="eb-important-box">
        <span class="eb-important-title">⚠ ACTION REQUIRED</span>
        <p class="eb-important-text">
          Please log in to the student portal to complete your <strong>LLN Assessment</strong> and <strong>Enrolment Form</strong> before attending the course.
        </p>
      </div>

      <div class="eb-section">
        <div class="eb-section-head"><span>Next Steps</span></div>
        <div style="padding: 16px;">
          <div class="eb-step"><div class="eb-step-num">1</div><div class="eb-step-text">Log in to the <a href="https://www.safetytrainingacademy.edu.au/login">Student Portal</a> and complete your forms.</div></div>
          <div class="eb-step"><div class="eb-step-num">2</div><div class="eb-step-text">Ensure you have a valid <strong>USI</strong>. Visit <a href="https://www.usi.gov.au">usi.gov.au</a> if needed.</div></div>
          <div class="eb-step"><div class="eb-step-num">3</div><div class="eb-step-text">Arrive 15 minutes early with <strong>Photo ID</strong>.</div></div>
        </div>
      </div>

      <div class="eb-section">
        <div class="eb-section-head"><span>What to Bring</span></div>
        <div style="padding: 14px;">
          <div class="eb-check-item">✓ Photo ID (Driver's License or Passport)</div>
          <div class="eb-check-item">✓ Steel cap boots or safety shoes with closed, hard-topped toe protection</div>
          <div class="eb-check-item">✓ Water bottle and snacks</div>
        </div>
      </div>
    </div>

    <div class="eb-footer">
      Questions? <a href="mailto:info@safetytrainingacademy.edu.au">info@safetytrainingacademy.edu.au</a> | 1300 976 097<br/>
      <strong>Safety Training Academy</strong> | RTO #45234<br/><br/>
      &copy; ${new Date().getFullYear()} Safety Training Academy. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = studentBookingTemplate;
