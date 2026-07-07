import { useState, useEffect } from "react";
import { colors } from '../../constants/theme';
import "./CompanyPayments.css";
import { API_URL } from "../../data/service";

function fmt(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

// ── Pay Modal ────────────────────────────────────────────────────────────────
function PayModal({ selected, payments, grouped = [], company, onClose, onSuccess }) {
  const [method, setMethod] = useState("credit");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [mm, setMm] = useState("");
  const [yy, setYy] = useState("");
  const [cvv, setCvv] = useState("");
  const [txnRef, setTxnRef] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // ✅ user.id — localStorage-லிருந்து நேரடியா எடு
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const groupedSource = Array.isArray(grouped) && grouped.length ? grouped : payments;
  const selectedGroups = groupedSource.filter(g => selected.includes(g.id));
  const courseGroups = selectedGroups.filter(g => g.isCoursePayment);
  const studentGroups = selectedGroups.filter(g => !g.isCoursePayment);
  const total = selectedGroups.reduce((sum, g) => sum + (g.balance || 0), 0);

  const handlePay = async () => {
    setError("");

    if (method === "credit") {
      if (!cardName || !cardNumber || !mm || !yy || !cvv) {
        setError("Please fill in all card details.");
        return;
      }
    } else {
      if (!txnRef) {
        setError("Please enter transaction ID / reference.");
        return;
      }
    }

    setProcessing(true);
    try {
      // ── Credit Card — eWAY ─────────────────────────────────
      if (method === "credit") {
        const ewayRes = await fetch(`${API_URL}/api/payment/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount:      total,
            email:       company?.email       || user.email || "",
            name:        company?.companyName || user.name  || "",
            phone:       company?.mobileNumber || "",
            cardName,
            cardNumber,
            expiryMonth: mm,
            expiryYear:  yy,
            cvv,
            userId:      user.id || "",
            description: `Company payment - ${company?.companyName || user.name || ""}`,
          }),
        });

        const ewayData = await ewayRes.json();
        if (!ewayData.success) {
          throw new Error(ewayData.message || "Card payment failed");
        }

        // For course groups, create CompanyPayment
        if (courseGroups.length > 0) {
          const courses = courseGroups.flatMap(g => g.rows.map(r => ({
            courseId: r.id.split('_')[1],
            courseName: r.course,
            quantity: parseInt(r.student.split('/')[1]?.split(' ')[0]) || 1,
            pricePerPerson: r.total,
            sessionDate: null,
            startTime: null,
            endTime: null
          })));

          await fetch(`${API_URL}/api/company-payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyId: user.id,
              amount: courseGroups.reduce((sum, g) => sum + g.total, 0),
              paymentMethod: "Card",
              transactionReference: ewayData.transactionId,
              gatewayTransactionId: ewayData.gatewayTransactionId || "",
              courses,
              status: "success",
              confirmed: true,
            }),
          });
        }

        // For student groups, update flows
        if (studentGroups.length > 0) {
          const fd = new FormData();
          fd.append("flowIds",              JSON.stringify(studentGroups.flatMap(g => g.rows.map(r => r.id))));
          fd.append("amount",               studentGroups.reduce((sum, g) => sum + g.total, 0));
          fd.append("method",               "Card Payment");
          fd.append("companyId",            user.id);
          fd.append("transactionId",        ewayData.transactionId);
          fd.append("gatewayTransactionId", ewayData.gatewayTransactionId || "");

          await fetch(`${API_URL}/api/students/company/pay-selected`, {
            method: "POST",
            body: fd,
          });
        }

        onSuccess();
        onClose();
        return;
      }

      // ── Bank Transfer ──────────────────────────────────────
      // For student groups
      if (studentGroups.length > 0) {
        const fd = new FormData();
        fd.append("flowIds",       JSON.stringify(studentGroups.flatMap(g => g.rows.map(r => r.id))));
        fd.append("amount",        studentGroups.reduce((sum, g) => sum + g.total, 0));
        fd.append("method",        "Bank Transfer");
        fd.append("companyId",     user.id);
        fd.append("transactionId", txnRef);
        if (receiptFile) fd.append("receipt", receiptFile);

        const res = await fetch(`${API_URL}/api/students/company/pay-selected`, {
          method: "POST",
          body: fd,
        });

        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error("Server error — route not found");
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Payment failed");
      }

      // For course groups
      if (courseGroups.length > 0) {
        const courses = courseGroups.flatMap(g => g.rows.map(r => ({
          courseId: r.id.split('_')[1],
          courseName: r.course,
          quantity: parseInt(r.student.split('/')[1]?.split(' ')[0]) || 1,
          pricePerPerson: r.total,
          sessionDate: null,
          startTime: null,
          endTime: null
        })));

        const fd = new FormData();
        fd.append("companyId", user.id);
        fd.append("amount", courseGroups.reduce((sum, g) => sum + g.total, 0));
        fd.append("paymentMethod", "Bank Transfer");
        fd.append("transactionReference", txnRef);
        fd.append("courses", JSON.stringify(courses));
        if (receiptFile) fd.append("receipt", receiptFile);

        await fetch(`${API_URL}/api/company-payments`, {
          method: "POST",
          body: fd,
        });
      }

      onSuccess();
      onClose();

    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()}>

        <div className="pm-header">
          <div>
            <div className="pm-title">Pay selected lines</div>
            <div className="pm-subtitle">
              Total for selected lines: <strong>{fmt(total)}</strong> (full balance for each selected line).
              Billing details are saved before payment so card charges and receipts match your company profile.
            </div>
          </div>
          <button className="pm-close" onClick={onClose}>✕</button>
        </div>

        {/* Billing Contact */}
        <div className="pm-billing-box">
          <div className="pm-billing-label">BILLING CONTACT</div>
          <div className="pm-billing-row">
            <span className="pm-billing-key">Company name</span>
            <div className="pm-billing-val">{company?.companyName || "—"}</div>
          </div>
          <div className="pm-billing-row">
            <span className="pm-billing-key">Email</span>
            <div className="pm-billing-val">{company?.email || "—"}</div>
          </div>
          <div className="pm-billing-row">
            <span className="pm-billing-key">Mobile</span>
            <div className="pm-billing-val">{company?.mobileNumber || "—"}</div>
          </div>
        </div>

        {/* Method Toggle */}
        <div className="pm-method-row">
          <button
            className={`pm-method-btn ${method === "credit" ? "pm-method-active" : ""}`}
            onClick={() => setMethod("credit")}
          >
            💳 Credit card
          </button>
          <button
            className={`pm-method-btn ${method === "bank" ? "pm-method-active" : ""}`}
            onClick={() => setMethod("bank")}
          >
            🏦 Bank transfer
          </button>
        </div>

        {/* Credit Card Form */}
        {method === "credit" && (
          <div className="pm-form">
            <div className="pm-field">
              <label>Name on card</label>
              <input
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="pm-field">
              <label>Card number</label>
              <input
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                placeholder="1234 5678 9012 3456"
                maxLength={16}
              />
            </div>
            <div className="pm-field-row">
              <div className="pm-field">
                <label>MM</label>
                <input value={mm} onChange={e => setMm(e.target.value)} placeholder="MM" maxLength={2} />
              </div>
              <div className="pm-field">
                <label>YY</label>
                <input value={yy} onChange={e => setYy(e.target.value)} placeholder="YY" maxLength={2} />
              </div>
              <div className="pm-field">
                <label>CVV</label>
                <input value={cvv} onChange={e => setCvv(e.target.value)} placeholder="CVV" maxLength={4} type="password" />
              </div>
            </div>
            <div className="pm-card-note">
              🔒 Payments processed securely via eWAY
            </div>
          </div>
        )}

        {/* Bank Transfer Form */}
        {method === "bank" && (
          <div className="pm-form">
            <p className="pm-bank-desc">
              Transfer <strong>{fmt(total)}</strong> using your bank's app (exact amount), then upload
              your receipt. We will verify your deposit and mark these lines paid from
              the admin side; you will receive email confirmation.
            </p>
            <div className="pm-bank-details">
              <div className="pm-bank-title">Details for deposit</div>
              <div className="pm-bank-row"><span>Bank:</span><span>Commonwealth Bank</span></div>
              <div className="pm-bank-row"><span>Account name:</span><span>AIET College</span></div>
              <div className="pm-bank-row"><span>BSB:</span><span>062  141</span></div>
              <div className="pm-bank-row"><span>Account no.:</span><span>10490235</span></div>
            </div>
            <div className="pm-bank-ref-note">
              ⓘ Use <strong>{company?.companyName} {company?.email} {company?.mobileNumber}</strong> as part of your payment reference so we can match your transfer.
            </div>
            <div className="pm-field">
              <label>Transaction ID / reference</label>
              <input
                value={txnRef}
                onChange={e => setTxnRef(e.target.value)}
                placeholder="Enter your bank transaction ID or reference"
              />
            </div>
            <div className="pm-field">
              <label>Receipt file</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={e => setReceiptFile(e.target.files[0])}
              />
              {receiptFile && (
                <p style={{ fontSize: 12, color: colors.success, marginTop: 4 }}>✅ {receiptFile.name}</p>
              )}
            </div>
          </div>
        )}

        {error && <div className="pm-error">{error}</div>}

        <div className="pm-footer">
          <button className="pm-cancel" onClick={onClose} disabled={processing}>Cancel</button>
          <button className="pm-pay-btn" onClick={handlePay} disabled={processing}>
            {processing
              ? "Processing..."
              : method === "credit"
                ? `Pay ${fmt(total)}`
                : "Submit"
            }
          </button>
        </div>

      </div>
    </div>
  );
}

function PaymentDetailsModal({ group, onClose }) {
  const isCoursePayment = group.isCoursePayment;
  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="pm-header">
          <div>
            <div className="pm-title">{isCoursePayment ? "Courses purchased" : "Students enrolled"}</div>
            <div className="pm-subtitle" style={{ marginTop: 4 }}>
              {isCoursePayment
                ? "List of courses and quantities for this payment."
                : "List of students for this payment."
              }
            </div>
          </div>
          <button className="pm-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: "1rem 1.25rem 1.5rem" }}>
          {isCoursePayment ? (
            <div>
              {group.rows.map((row, i) => {
                const enrolled = row.student.split('/')[0];
                const max = row.student.split('/')[1]?.split(' ')[0] || enrolled;
                return (
                  <div key={i} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: i < group.rows.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                    <div style={{ fontWeight: 600 }}>{row.course}</div>
                    <div style={{ fontSize: 12, color: colors.textMuted }}>Quantity: {max} (Enrolled: {enrolled})</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              {group.rows.map((row, i) => (
                <div key={i} style={{ marginBottom: 12, paddingBottom: 8, borderBottom: i < group.rows.length - 1 ? "1px solid #e5e7eb" : "none" }}>
                  <div style={{ fontWeight: 600 }}>{row.name}</div>
                  <div style={{ fontSize: 12, color: colors.textMuted }}>{row.email}</div>
                  <div style={{ fontSize: 12, color: colors.textMuted }}>Course: {row.course}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="pm-footer" style={{ justifyContent: "flex-end" }}>
          <button className="pm-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Payments Table ────────────────────────────────────────────────────────────
export function PaymentsTable({ payments = [], company, onRefresh }) {
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [detailsGroup, setDetailsGroup] = useState(null);

  // Group payments by payment ID
  const groupedPayments = {};
  payments.forEach(row => {
    const paymentId = row.id.split('_')[0];
    if (!groupedPayments[paymentId]) {
      groupedPayments[paymentId] = {
        id: paymentId,
        date: row.date,
        rows: [],
        total: 0,
        paid: 0,
        balance: 0,
        isCoursePayment: row.student && row.student.includes('enrolled'),
        payment: row.payment,
        gatewayTransactionId: row.gatewayTransactionId || "",
      };
    }
    groupedPayments[paymentId].rows.push(row);
    groupedPayments[paymentId].total += row.total || 0;
    groupedPayments[paymentId].paid += row.paid || 0;
    groupedPayments[paymentId].balance += row.balance || 0;
  });
  const groupedArray = Object.values(groupedPayments);

  const outstanding = groupedArray.filter(g => g.payment === "pending" && g.balance > 0);

  const toggle = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );
  const selectAll = () => setSelected(outstanding.map(g => g.id));
  const clear = () => setSelected([]);

  return (
    <div className="py-card">
      <div className="py-card-top">
        <div className="py-card-info">
          <div className="py-card-heading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            Pay training fees
          </div>
          <p className="py-card-desc">
            Each pay-later company enrolment appears as a line here. Balance reflects payments
            already applied. Card settles immediately; bank transfer updates after we verify your
            receipt in admin.
          </p>
        </div>
        <div className="py-card-actions">
          <button className="py-btn-icon" title="Refresh" onClick={onRefresh}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
          <button className="py-btn-outline" onClick={selectAll}>Select all outstanding</button>
          <button className="py-btn-outline" onClick={clear}>Clear</button>
          <button
            className="py-btn-primary"
            disabled={selected.length === 0}
            onClick={() => setShowModal(true)}
          >
            Pay selected
          </button>
        </div>
      </div>

      <div className="py-table-wrap">
        <table className="py-table">
          <thead>
            <tr>
              <th className="py-col-check"></th>
              <th>Date</th>
              <th>Student / Course</th>
              <th>Transaction ID</th>
              <th>Payment</th>
              <th className="right">Total</th>
              <th className="right">Paid</th>
              <th className="right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {groupedArray.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>
                  No payments found
                </td>
              </tr>
            ) : groupedArray.map(group => {
              const subjectLabel = group.isCoursePayment ? "Course" : "Students";
              return (
                <tr key={group.id} className={group.payment === "paid" ? "py-row-paid" : ""}>
                  <td className="py-col-check">
                    {group.payment === "paid" ? (
                      <span style={{ color: "#d1d5db", fontSize: 16 }}>—</span>
                    ) : (
                      <input
                        type="checkbox"
                        className="py-checkbox"
                        checked={selected.includes(group.id)}
                        onChange={() => toggle(group.id)}
                      />
                    )}
                  </td>
                  <td>{group.date}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>{subjectLabel}</span>
                      <button
                        type="button"
                        onClick={() => setDetailsGroup(group)}
                        style={{ border: "none", background: "none", cursor: "pointer", padding: 0, color: colors.info, fontSize: 16, lineHeight: 1 }}
                        aria-label="View payment details"
                      >
                        👁
                      </button>
                    </div>
                    {/* <div style={{ marginTop: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{primaryInfo}</div>
                    </div> */}
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>
                    {group.gatewayTransactionId || "—"}
                  </td>
                  <td>
                    <span className={`py-badge ${group.payment === "paid" ? "py-badge-paid" : "py-badge-pending"}`}>
                      {group.payment === "paid" ? "Paid" : "Pending payment"}
                    </span>
                  </td>
                  <td className="right">{fmt(group.total)}</td>
                  <td className="right">{fmt(group.paid)}</td>
                  <td className={`right ${group.balance > 0 ? "py-balance-bold" : ""}`}>
                    {fmt(group.balance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {detailsGroup && (
        <PaymentDetailsModal group={detailsGroup} onClose={() => setDetailsGroup(null)} />
      )}

      {showModal && (
        <PayModal
          selected={selected}
          payments={payments}
          grouped={groupedArray}
          company={company}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setSelected([]);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// ── Source label helper ───────────────────────────────────────────────────────
function sourceLabel(source) {
  if (source === "Booking Link")  return { text: "Booking Link",  color: colors.brandPrimary };
  if (source === "Company Link")  return { text: "Company Link",  color: "#0891b2" };
  return                                 { text: source || "—",   color: colors.textMuted };
}

function payStatusBadge(status) {
  if (status === "paid")     return { text: "Paid",     cls: "py-badge-paid" };
  if (status === "pending")  return { text: "Pending",  cls: "py-badge-pending" };
  if (status === "failed")   return { text: "Failed",   cls: "py-badge-failed" };
  return                            { text: "Not Paid", cls: "py-badge-notpaid" };
}

// ── Students Table ────────────────────────────────────────────────────────────
function StudentsTable({ students, company, loading, onRefresh }) {
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Only non-course_link students with not_paid status can be selected
  const selectable = students.filter(
    s => s.source !== "Booking Link" && s.paymentStatus === "not_paid"
  );

  const toggle = (flowId) => setSelected(prev =>
    prev.includes(flowId) ? prev.filter(x => x !== flowId) : [...prev, flowId]
  );
  const selectAll = () => setSelected(selectable.map(s => s.flowId));
  const clear = () => setSelected([]);

  // Build payments-like array for PayModal (expects id + balance + total + rows)
  const paymentsForModal = students.map(s => ({
    id: s.flowId,
    balance: s.amountNum || 0,
    total: Number(s.amountNum || 0),
    isCoursePayment: false,
    rows: [{
      id: s.flowId,
      name: s.name,
      email: s.email,
      course: s.course,
      amount: s.amount,
      paymentMethod: s.paymentMethod,
      paymentStatus: s.paymentStatus,
      source: s.source,
      student: s.student || "",
    }],
  }));

  return (
    <div className="py-card" style={{ marginTop: "1.5rem" }}>
      <div className="py-card-top">
        <div className="py-card-info">
          <div className="py-card-heading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            Enrolled Students
          </div>
          <p className="py-card-desc">
            Students enrolled via your company — course link, company link, or direct booking.
            Select unpaid students to process payment.
          </p>
        </div>
        <div className="py-card-actions">
          <button className="py-btn-icon" title="Refresh" onClick={onRefresh}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
          <button className="py-btn-outline" onClick={selectAll}>Select all unpaid</button>
          <button className="py-btn-outline" onClick={clear}>Clear</button>
          <button
            className="py-btn-primary"
            disabled={selected.length === 0}
            onClick={() => setShowModal(true)}
          >
            Pay selected
          </button>
        </div>
      </div>

      <div className="py-table-wrap">
        {loading ? (
          <p style={{ padding: "1rem" }}>Loading...</p>
        ) : (
          <table className="py-table">
            <thead>
              <tr>
                <th className="py-col-check"></th>
                <th>Student</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Source</th>
                <th>LLN</th>
                <th>Form</th>
                <th>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2rem" }}>
                    No students enrolled yet
                  </td>
                </tr>
              ) : students.map(s => {
                const statusBadge = payStatusBadge(s.paymentStatus);
                const src = sourceLabel(s.source);
                const canSelect = s.source !== "Booking Link" && s.paymentStatus === "not_paid";
                return (
                  <tr key={s.id} className={s.paymentStatus === "paid" ? "py-row-paid" : ""}>
                    <td className="py-col-check">
                      {canSelect ? (
                        <input
                          type="checkbox"
                          className="py-checkbox"
                          checked={selected.includes(s.flowId)}
                          onChange={() => toggle(s.flowId)}
                        />
                      ) : (
                        <span style={{ color: "#d1d5db", fontSize: 16 }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: colors.textMuted }}>{s.email}</div>
                    </td>
                    <td>{s.course}</td>
                    <td>{s.amount}</td>
                    <td><span className={`py-badge ${statusBadge.cls}`}>{statusBadge.text}</span></td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: src.color, background: src.color + "18",
                        padding: "2px 8px", borderRadius: 10,
                      }}>{src.text}</span>
                    </td>
                    <td>
                      <span className={`py-badge ${s.llnd === "Completed" ? "py-badge-paid" : "py-badge-pending"}`}>
                        {s.llnd}
                      </span>
                    </td>
                    <td>
                      <span className={`py-badge ${s.form === "Submitted" ? "py-badge-paid" : "py-badge-pending"}`}>
                        {s.form}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>{s.enrolled}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <PayModal
          selected={selected}
          payments={paymentsForModal}
          grouped={paymentsForModal}
          company={company}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setSelected([]);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CompanyPayments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchStudents = () => {
    setStudentsLoading(true);
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/api/students/company/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setStudentsLoading(false));
  };

  const fetchPayments = () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/api/students/company/${user.id}/payments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPayments(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_URL}/api/companies/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(res => setCompany({
        companyName:  res.data?.companyName  || user.name  || "—",
        email:        res.data?.email        || user.email || "—",
        mobileNumber: res.data?.mobileNumber || "—",
      }))
      .catch(() => setCompany({
        companyName:  user.name  || "—",
        email:        user.email || "—",
        mobileNumber: "—",
      }));

    fetchPayments();
    fetchStudents();
  }, []);

  return (
    <div className="py-wrapper">
      <p className="py-page-label">Payments</p>
      <p className="py-page-subtitle">
        Lines match pay-later enrolments from your portal or bulk-order links (one fee per course).
        Tick what you want to pay; the amount is always the full remaining balance on each selected
        line. After you pay by card, totals and the Payment column update straight away—use Refresh
        if you need the latest from the server.
      </p>
      {loading
        ? <p style={{ padding: "1rem" }}>Loading...</p>
        : <PaymentsTable payments={payments} company={company} onRefresh={fetchPayments} />
      }
      <StudentsTable students={students} company={company} loading={studentsLoading} onRefresh={fetchStudents} />
    </div>
  );
}