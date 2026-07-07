const adminBookingTemplate = (data) => {

  const isAgentLink = data.isAgent === true || String(data.isAgent).toLowerCase() === 'true';
  // Extract number only e.g. "BK-10042" → "10042"
  const digits = String(data.bookingId || '').replace(/[^0-9]/g, '');
  const orderNumber = digits !== '' ? digits : (data.bookingId || '—');

  // ── Payment Method Logic ──────────────────────────────────────────
  const rawPm = (data.paymentMethod || 'card').toLowerCase();
  const pm = rawPm.replace(/[-_ ]/g, ''); 

  let paymentMethodLabel = 'Credit Card';
  let paymentStatusLabel = 'Confirmed';
  let paymentStatusColor = '#1e7e34';
  let paymentStatusBg    = '#dcfce7';
  let gatewayIdValue     = '-';
  let bankTransferValue  = '-';

  // Function to remove hyphens from IDs as per user request
  const cleanId = (id) => String(id || '').replace(/-/g, '');

  if (pm === 'banktransfer') {
    paymentMethodLabel = 'Bank Transfer';
    paymentStatusLabel = 'PLZ VERIFY';
    paymentStatusColor = '#c0392b';
    paymentStatusBg    = '#fee2e2';
    bankTransferValue  = cleanId(data.bankTransferId || data.transactionId || '-');
    gatewayIdValue     = '-';
  }
  else if (pm === 'paylater') {
    paymentMethodLabel = 'Pay Later';
    paymentStatusLabel = 'PLZ VERIFY';
    paymentStatusColor = '#c0392b';
    paymentStatusBg    = '#fee2e2';
    bankTransferValue  = '-';
    gatewayIdValue     = '-';
  }
  else {
    // Default to Card
    paymentMethodLabel = 'Card Payment';
    const hasGateway = (data.gatewayId && data.gatewayId !== '-') || (data.gatewayTransactionId && data.gatewayTransactionId !== '-');
    paymentStatusLabel = hasGateway ? 'Confirmed' : 'PLZ VERIFY';
    paymentStatusColor = hasGateway ? '#1e7e34' : '#c0392b';
    paymentStatusBg    = hasGateway ? '#dcfce7' : '#fee2e2';
    gatewayIdValue     = cleanId(data.gatewayId || data.gatewayTransactionId || '-');
    bankTransferValue  = '-';
  }

  // Row for Gateway ID
  const gatewayRow = gatewayIdValue !== '-' ? `
    <tr>
      <td class="lbl">Gateway Transaction ID</td>
      <td class="val" style="color: #cc0000;"><strong>${gatewayIdValue}</strong></td>
    </tr>` : '';

  // Row for Bank Transfer / Transaction ID
  const transactionRow = bankTransferValue !== '-' ? `
    <tr>
      <td class="lbl">Transaction ID</td>
      <td class="val"><strong>${bankTransferValue}</strong></td>
    </tr>` : '';

  // ✅ Pay Later-kku rendu rows-um hide pannuvom
  const extraPaymentRows = (pm === 'paylater') ? '' : (gatewayRow + transactionRow);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>STA Admin Booking Notification</title>
  <style>
    body { margin: 0; padding: 24px; background: #f0f2f5; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .eb-body { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden; font-size: 13px; color: #1a1a1a; }

    /* ── Header ── */
    .eb-hdr { background: #0d2240; padding: 16px 24px; }
    .eb-hdr-title { font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 2px; }
    .eb-hdr-sub { font-size: 10px; color: #cc0000; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600; margin: 0; }
    .eb-badge { background: #cc0000; color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 3px 10px; border-radius: 2px; white-space: nowrap; display: inline-block; line-height: 1; }

    /* ── Alert bar ── */
    .eb-alert { background: #0a1c33; padding: 9px 24px; font-size: 12px; color: #89c8e8; font-weight: 500; }

    /* ── Content ── */
    .eb-content { padding: 18px 24px; }

    /* ── Sections ── */
    .eb-section { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
    .eb-section-head { background: #0d2240; padding: 7px 14px; }
    .eb-section-head span { font-size: 10px; font-weight: 700; color: #ffffff; letter-spacing: 1px; text-transform: uppercase; }
    
    .eb-table { width: 100%; border-collapse: collapse; }
    .eb-table td { padding: 8px 14px; border-bottom: 1px solid #f0f0f0; font-size: 12px; color: #1a1a1a; vertical-align: middle; word-break: break-word; }
    .eb-table tr:last-child td { border-bottom: none; }
    .eb-table td.lbl { width: 38%; padding: 8px 14px; font-size: 11px; font-weight: 600; color: #666; background: #fafafa; border-right: 1px solid #f0f0f0; }
    .eb-table td a { color: #cc0000; text-decoration: none; }

    /* ── Total row ── */
    .eb-total-row td { background: #f0f6ff !important; border-top: 2px solid #cc0000; }
    .eb-total-row .lbl { font-size: 13px; font-weight: 700; color: #0d2240; }
    .eb-total-row .val { font-size: 14px; font-weight: 700; color: #0d2240; }

    /* ── Notes/Alert ── */
    .eb-alert-box { background: #fffbea; border: 1px solid #f5e28a; border-radius: 4px; padding: 12px 14px; font-size: 12px; color: #7a6500; line-height: 1.5; margin-bottom: 12px; }

    /* ── Footer ── */
    .eb-footer { background: #f5f7fa; border-top: 1px solid #e0e0e0; padding: 12px 24px; font-size: 10px; color: #999; text-align: center; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="eb-body">

    <!-- ── Header ── -->
    <div class="eb-hdr">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <p class="eb-hdr-title">Safety Training Academy</p>
            <p class="eb-hdr-sub">RTO #45234 &nbsp;·&nbsp; Admin Notification</p>
          </td>
          <td align="right" valign="top">
            <div style="display:inline-block; text-align:right; min-width: 200px;">
              <span class="eb-badge" style="background:#cc0000; color:#ffffff; font-size:16px; font-weight:800; letter-spacing:1px; text-transform:uppercase; padding:6px 0; border-radius:3px; display:block; text-align:center; line-height:1; margin-bottom:8px;">New Booking</span>
              <p style="margin:0; font-size:24px; font-weight:700; color:#ffffff; line-height:1; white-space:nowrap;">
                Booking ID: ${orderNumber}
              </p>
              ${isAgentLink ? `
              <p style="margin:6px 0 0; font-size:13px; font-weight:800; color:#facc15; letter-spacing:0.8px; text-transform:uppercase; line-height:1; white-space:nowrap;">
                Agent Link
              </p>` : ''}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <div class="eb-alert">
      ⚠ ACTION REQUIRED: Confirm payment before scheduling student.
    </div>

    <div class="eb-content">

      <!-- ── 1. Student Details ── -->
      <div class="eb-section">
        <div class="eb-section-head"><span>Student Details</span></div>
        <table class="eb-table">
          <tr><td class="lbl">Name</td><td class="val">${data.contactName || '—'}</td></tr>
          <tr><td class="lbl">Email</td><td class="val"><a href="mailto:${data.contactEmail}">${data.contactEmail || '—'}</a></td></tr>
          <tr><td class="lbl">Phone</td><td class="val"><a href="tel:${data.contactPhone}">${data.contactPhone || '—'}</a></td></tr>
        </table>
      </div>

      <!-- ── 2. Booking Summary ── -->
      <div class="eb-section">
        <div class="eb-section-head"><span>Booking Summary</span></div>
        <table class="eb-table">
          <tr><td class="lbl">Booking ID</td><td class="val"><strong>${orderNumber}</strong></td></tr>
          <tr><td class="lbl">Submitted</td><td class="val">${data.submittedAt || new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</td></tr>
          <tr><td class="lbl">Payment Method</td><td class="val">${paymentMethodLabel}</td></tr>
          <tr><td class="lbl">Payment Status</td><td class="val">
            <span style="display:inline-block; font-size:10px; font-weight:700; letter-spacing:0.6px; text-transform:uppercase; padding:2px 9px; border-radius:2px; background:${paymentStatusBg}; color:${paymentStatusColor};">
              ${paymentStatusLabel}
            </span>
          </td></tr>
          ${extraPaymentRows}
          <tr class="eb-total-row">
            <td class="lbl">Total Amount</td>
            <td class="val">$${data.totalAmount || '0.00'}</td>
          </tr>
        </table>
      </div>

      <!-- ── 3. Course Details ── -->
      <div class="eb-section">
        <div class="eb-section-head"><span>Course Details</span></div>
        <table class="eb-table">
          <tr><td class="lbl">Course Name</td><td class="val"><strong>${data.courseName || '—'}</strong></td></tr>
          <tr><td class="lbl">Course Code</td><td class="val">${data.courseCode || '—'}</td></tr>
          <tr><td class="lbl">Date & Time</td><td class="val">${data.courseDate || '—'} @ ${data.courseTime || '—'}</td></tr>
          <tr><td class="lbl">Location</td><td class="val">${data.venue || '—'}</td></tr>
        </table>
      </div>

      ${data.notes ? `
      <!-- ── 4. Notes ── -->
      <div class="eb-alert-box">
        <strong>⚠ Special Requirements / Notes:</strong><br />${data.notes}
      </div>` : ''}

      <!-- ── Action Alert Bottom ── -->
      <div class="eb-alert-box">
        <strong>⚠ ACTION REQUIRED</strong><br />
        Please confirm payment before scheduling this student into the course.
      </div>

    </div><!-- /eb-content -->

    <!-- ── Footer ── -->
    <div class="eb-footer">
      This is an automated admin notification from <strong>Safety Training Academy</strong> (RTO #45234).<br />
      2 Marjorie St, Sefton NSW 2162 &nbsp;·&nbsp; 1300 976 097 &nbsp;·&nbsp; info@safetytrainingacademy.edu.au
    </div>

  </div>
</body>
</html>
  `;
};

module.exports = adminBookingTemplate;
