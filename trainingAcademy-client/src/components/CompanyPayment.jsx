import React, { useState, useEffect } from 'react';
import '../styles/CompanyPayment.css';
import { API_URL } from "../data/service";

function StatusBadge({ status, confirmed }) {
  if (status === "success" && confirmed) return <span className="cp2-badge cp2-badge--confirmed">✓ Confirmed</span>;
  if (status === "success")              return <span className="cp2-badge cp2-badge--success">Paid</span>;
  if (status === "pending")              return <span className="cp2-badge cp2-badge--pending">Pending</span>;
  if (status === "failed")               return <span className="cp2-badge cp2-badge--failed">Failed</span>;
  return null;
}

function ReceiptModal({ row, onClose, onConfirm }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setConfirming(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/company-payments/${row.id}/confirm`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Confirm failed");
      onConfirm(row.id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="cp2-overlay" onClick={onClose}>
      <div className="cp2-modal" onClick={e => e.stopPropagation()}>
        <div className="cp2-modal-hdr">
          <div>
            <div className="cp2-modal-title">Payment Receipt</div>
            <div className="cp2-modal-sub">{row.company} — {row.orderId}</div>
          </div>
          <button className="cp2-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="cp2-modal-body">
          <div className="cp2-info-grid">
            <div className="cp2-info-box">
              <div className="cp2-info-label">Company</div>
              <div className="cp2-info-val">{row.company}</div>
            </div>
            <div className="cp2-info-box">
              <div className="cp2-info-label">Email</div>
              <div className="cp2-info-val">{row.email}</div>
            </div>
            <div className="cp2-info-box">
              <div className="cp2-info-label">Mobile</div>
              <div className="cp2-info-val">{row.mobile}</div>
            </div>
            <div className="cp2-info-box">
              <div className="cp2-info-label">Amount</div>
              <div className="cp2-info-val cp2-amount">${Number(row.amount || 0).toFixed(2)}</div>
            </div>
            <div className="cp2-info-box">
              <div className="cp2-info-label">Gateway Transaction ID</div>
              <div className="cp2-info-val" style={{ fontFamily: "monospace", fontSize: 13, color: (!row.transactionId || row.transactionId === "—") ? "#000" : "inherit" }}>
                {(!row.transactionId || row.transactionId === "—") ? "—" : row.transactionId}
              </div>
            </div>
            <div className="cp2-info-box">
              <div className="cp2-info-label">Payment Method</div>
              <div className="cp2-info-val">{row.paymentMethod}</div>
            </div>
            <div className="cp2-info-box">
              <div className="cp2-info-label">Date &amp; Time</div>
              <div className="cp2-info-val">{row.date} · {row.time}</div>
            </div>
          </div>
          <div className="cp2-status-row">
            <span className="cp2-info-label">Status</span>
            <StatusBadge status={row.status} confirmed={row.confirmed} />
          </div>
          <div className="cp2-receipt-section">
            <div className="cp2-info-label" style={{ marginBottom: 10 }}>Payment Receipt</div>
            {row.receiptUrl ? (
              <>
                <img
                  src={row.receiptUrl}
                  alt="Payment Receipt"
                  className="cp2-receipt-img"
                  onError={e => { e.target.style.display = "none"; }}
                />
                <button
                  className="cp2-open-btn"
                  onClick={() => window.open(row.receiptUrl, "_blank")}
                >
                  Open in New Tab ↗
                </button>
              </>
            ) : (
              <div className="cp2-no-receipt">
                <span>🧾</span>
                <p>No receipt uploaded</p>
                <span className="cp2-no-receipt-sub">
                  {row.paymentMethod === "Card"
                    ? "Card payment — receipt auto-generated"
                    : "Company has not uploaded a receipt yet"}
                </span>
              </div>
            )}
          </div>
          {error && <div style={{ color: "red", fontSize: 13, marginTop: 8 }}>{error}</div>}
        </div>
        <div className="cp2-modal-ftr">
          <button className="cp2-cancel-btn" onClick={onClose} disabled={confirming}>Close</button>
          {row.receiptUrl && !row.confirmed && (
            <button className="cp2-confirm-btn" onClick={handleConfirm} disabled={confirming}>
              {confirming ? "Confirming..." : "✓ Confirm Payment"}
            </button>
          )}
          {row.confirmed && (
            <span className="cp2-already-confirmed">✓ Already Confirmed</span>
          )}
        </div>
      </div>
    </div>
  );
}

const thStyle = { padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 12 };
const tdStyle = { padding: "8px 10px", color: "#4b5563" };

function CoursesModal({ row, onClose }) {
  return (
    <div className="cp2-overlay" onClick={onClose}>
      <div className="cp2-modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="cp2-modal-hdr">
          <div>
            <div className="cp2-modal-title">Courses Purchased</div>
            <div className="cp2-modal-sub">{row.company}</div>
          </div>
          <button className="cp2-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="cp2-modal-body">
          {row.courses.length === 0 ? (
            <p style={{ color: "#888", fontSize: 13 }}>No course data found.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={thStyle}>Course</th>
                  <th style={thStyle}>Code</th>
                  <th style={thStyle}>Qty</th>
                  <th style={thStyle}>Price/Person</th>
                  <th style={thStyle}>Session Date</th>
                  <th style={thStyle}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {row.courses.map((c, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={tdStyle}>{c.courseName || "—"}</td>
                    <td style={tdStyle}>{c.courseCode || "—"}</td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>{c.quantity}</td>
                    <td style={tdStyle}>${Number(c.pricePerPerson || 0).toFixed(2)}</td>
                    <td style={tdStyle}>
                      {c.sessionDate ? new Date(c.sessionDate).toLocaleDateString("en-AU") : "—"}
                      {c.startTime && c.endTime ? ` · ${c.startTime}–${c.endTime}` : ""}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                      ${(Number(c.pricePerPerson || 0) * Number(c.quantity || 1)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="cp2-modal-ftr">
          <button className="cp2-cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function StudentsModal({ paymentId, companyName, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/company-payments/${paymentId}/details`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(r => { if (r.success) setData(r); else setError(r.message || "Failed"); })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [paymentId]);

  return (
    <div className="cp2-overlay" onClick={onClose}>
      <div className="cp2-modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="cp2-modal-hdr">
          <div>
            <div className="cp2-modal-title">Enrolled Students</div>
            <div className="cp2-modal-sub">{companyName}</div>
          </div>
          <button className="cp2-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="cp2-modal-body">
          {loading && <p style={{ color: "#888", textAlign: "center" }}>Loading...</p>}
          {error   && <p style={{ color: "red",  textAlign: "center" }}>{error}</p>}
          {data && (
            data.enrolledStudents.length === 0
              ? <p style={{ color: "#888", fontSize: 13 }}>No students enrolled yet.</p>
              : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f3f4f6" }}>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Course</th>
                      <th style={thStyle}>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.enrolledStudents.map((s, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={tdStyle}>{s.name}</td>
                        <td style={{ ...tdStyle, fontSize: 11 }}>{s.email}</td>
                        <td style={tdStyle}>{s.course}</td>
                        <td style={tdStyle}>
                          <span style={{
                            padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                            background: s.payment === "success" ? "#dcfce7" : "#fef9c3",
                            color:      s.payment === "success" ? "#16a34a" : "#92400e",
                          }}>
                            {s.payment === "success" ? "Paid" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          )}
        </div>
        <div className="cp2-modal-ftr">
          <button className="cp2-cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Pagination Component ──────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="cp2-pagination">
      <button
        className="cp2-page-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹ Prev
      </button>

      {pages.map(p => (
        <button
          key={p}
          className={`cp2-page-btn ${currentPage === p ? "cp2-page-btn--active" : ""}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="cp2-page-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next ›
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const ROWS_PER_PAGE = 10;

const CompanyPayment = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modalRow, setModalRow]       = useState(null);
  const [coursesRow, setCoursesRow]   = useState(null);
  const [studentsRow, setStudentsRow] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = () => {
    setLoading(true);
    setFetchError("");
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/company-payments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          setRows(res.data.map(p => ({
            id:            p._id,
            date:          new Date(p.createdAt).toLocaleDateString("en-AU"),
            time:          new Date(p.createdAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }),
            orderId:       p.orderId || "—",
            company:       p.companyName || "—",
            email:         p.email || "—",
            mobile:        p.mobile || "—",
            courses:       p.courses || [],
            courseCount:   p.courseCount || 0,
            type:          (p.courses && p.courses.length > 0) ? "course_purchase" : "student_payment",
            amount:        p.amount || 0,
            paymentMethod:       p.paymentMethod || "—",
            transactionId:       p.gatewayTransactionId || "—",
            status:              p.status || "pending",
            receiptUrl:          p.receiptUrl || "",
            confirmed:           p.confirmed || false,
          })));
          setCurrentPage(1);
        }
      })
      .catch(err => {
        console.error(err);
        setFetchError("Failed to load payments. Please refresh.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const totalAmt  = rows.reduce((s, r) => s + r.amount, 0);
  const confirmed = rows.filter(r => r.confirmed).length;
  const pending   = rows.filter(r => r.status === "pending").length;

  const stats = [
    { label: "Total Orders",  value: rows.length,               color: "var(--cp2-indigo)" },
    { label: "Confirmed",     value: confirmed,                  color: "var(--cp2-green)"  },
    { label: "Pending",       value: pending,                    color: "var(--cp2-amber)"  },
    { label: "Total Amount",  value: `$${totalAmt.toFixed(2)}`,  color: "var(--cp2-sky)"    },
  ];

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q
      || r.company.toLowerCase().includes(q)
      || r.email.toLowerCase().includes(q)
      || r.orderId.toLowerCase().includes(q);
    const matchS = !statusFilter
      || (statusFilter === "confirmed" && r.confirmed)
      || (statusFilter === "pending"   && r.status === "pending")
      || (statusFilter === "failed"    && r.status === "failed");
    return matchQ && matchS;
  });

  // ✅ Pagination logic
  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginatedRows = filtered.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  // ✅ Search/filter மாறும்போது page 1-க்கு reset
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  const handleConfirm = (id) => {
    setRows(prev => prev.map(r =>
      r.id === id ? { ...r, confirmed: true, status: "success" } : r
    ));
  };

  const renderCoursesCell = (r) => {
    if (r.type === "course_purchase") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
          <span className="cp2-course-pill">📖 {r.courses.length}</span>
          <button
            title="View courses purchased"
            onClick={e => { e.stopPropagation(); setCoursesRow(r); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 1 }}
          >
            <i className="fa-regular fa-eye"></i>
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
        <span className="cp2-course-pill">👤 {r.courseCount}</span>
        <button
          title="View enrolled students"
          onClick={e => { e.stopPropagation(); setStudentsRow(r); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 1 }}
        >
          <i className="fa-regular fa-eye"></i>
        </button>
      </div>
    );
  };

  return (
    <div className="cp2-wrap">

      <div className="cp2-header">
        <div>
          <h2 className="cp2-title">Payment Management</h2>
          <p className="cp2-subtitle">Review and confirm company payment receipts</p>
        </div>
        <button className="cp2-refresh-btn" onClick={fetchData}>🔄 Refresh</button>
      </div>

      <div className="cp2-stats">
        {stats.map((s, i) => (
          <div className="cp2-stat-card" key={i}>
            <span className="cp2-stat-label">{s.label}</span>
            <span className="cp2-stat-value" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="cp2-search-row">
        <input
          className="cp2-search"
          type="text"
          placeholder="Search by company, email or order ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="cp2-filter"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="cp2-table-card">
        <div className="cp2-table-top">
          <h3 className="cp2-table-title">Order Records</h3>
          <span className="cp2-table-count">
            {filtered.length} records
            {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
          </span>
        </div>

        {loading ? (
          <div className="cp2-loading">
            <div className="cp2-spinner" />
            <span>Loading payments...</span>
          </div>
        ) : fetchError ? (
          <div className="cp2-fetch-error">
            ⚠️ {fetchError}
            <button onClick={fetchData} style={{ marginLeft: 10, cursor: "pointer" }}>Retry</button>
          </div>
        ) : (
          <>
            <div className="cp2-table-scroll">
              <table className="cp2-table">
                <thead>
                  <tr>
                    <th>Booking date</th>
                    <th>Booking ID</th>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Courses / Students</th>
                    <th>Amount</th>
                    <th>Gateway Transaction ID</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length === 0 ? (
                    <tr><td colSpan={11} className="cp2-empty">No records found.</td></tr>
                  ) : paginatedRows.map(r => (
                    <tr key={r.id} className={r.confirmed ? "cp2-row-confirmed" : ""}>
                      <td className="cp2-td-muted">
                        <div>{r.date}</div>
                        <div style={{ fontSize: 11 }}>{r.time}</div>
                      </td>
                      <td className="cp2-td-mono">
                        {r.orderId ? String(r.orderId).replace(/\D/g, "").slice(-8).padStart(8, "0") : "—"}
                      </td>
                      <td className="cp2-td-bold">{r.company}</td>
                      <td className="cp2-td-muted">{r.email}</td>
                      <td className="cp2-td-muted">{r.mobile}</td>
                      <td className="cp2-td-center">{renderCoursesCell(r)}</td>
                      <td className="cp2-td-amount">${Number(r.amount).toFixed(2)}</td>
                      <td className="cp2-td-mono" style={{ fontSize: 11, color: (!r.transactionId || r.transactionId === "—") ? "#000" : "inherit" }}>
                        {(!r.transactionId || r.transactionId === "—") ? "—" : r.transactionId}
                      </td>
                      <td className="cp2-td-method">{r.paymentMethod}</td>
                      <td><StatusBadge status={r.status} confirmed={r.confirmed} /></td>
                      <td>
                        <button className="cp2-view-btn" onClick={() => setModalRow(r)}>
                          👁 View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ Desktop Pagination */}
            <div className="cp2-pagination-desktop">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

            <div className="cp2-mobile-list">
              {paginatedRows.length === 0 ? (
                <div className="cp2-empty">No records found.</div>
              ) : paginatedRows.map(r => (
                <div className={`cp2-mobile-card ${r.confirmed ? "cp2-mc-confirmed" : ""}`} key={r.id}>
                  <div className="cp2-mc-top">
                    <span className="cp2-mc-company">{r.company}</span>
                    <StatusBadge status={r.status} confirmed={r.confirmed} />
                  </div>
                  <div className="cp2-mc-orderid">{r.orderId}</div>
                  <div className="cp2-mc-row">
                    <span className="cp2-mc-label">Date</span>
                    <span className="cp2-td-muted">{r.date} · {r.time}</span>
                  </div>
                  <div className="cp2-mc-row">
                    <span className="cp2-mc-label">Email</span>
                    <span className="cp2-td-muted" style={{ fontSize: 11 }}>{r.email}</span>
                  </div>
                  <div className="cp2-mc-row">
                    <span className="cp2-mc-label">Mobile</span>
                    <span className="cp2-td-muted">{r.mobile}</span>
                  </div>
                  <div className="cp2-mc-row">
                    <span className="cp2-mc-label">
                      {r.type === "course_purchase" ? "Courses" : "Students"}
                    </span>
                    <span>
                      {r.type === "course_purchase"
                        ? `📖 ${r.courses.length}`
                        : `👤 ${r.courseCount}`}
                    </span>
                  </div>
                  <div className="cp2-mc-row">
                    <span className="cp2-mc-label">Amount</span>
                    <span className="cp2-td-amount">${Number(r.amount).toFixed(2)}</span>
                  </div>
                  <div className="cp2-mc-row">
                    <span className="cp2-mc-label">Transaction ID</span>
                    <span style={{ fontFamily: "monospace", fontSize: 11 }}>{r.transactionId}</span>
                  </div>
                  <div className="cp2-mc-row">
                    <span className="cp2-mc-label">Method</span>
                    <span className="cp2-td-method">{r.paymentMethod}</span>
                  </div>
                  <button className="cp2-view-btn cp2-view-btn--full" onClick={() => setModalRow(r)}>
                    👁 View Receipt
                  </button>
                </div>
              ))}
            </div>

            {/* ✅ Mobile Pagination */}
            <div className="cp2-pagination-mobile">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {modalRow && (
        <ReceiptModal
          row={modalRow}
          onClose={() => setModalRow(null)}
          onConfirm={handleConfirm}
        />
      )}

      {coursesRow && (
        <CoursesModal
          row={coursesRow}
          onClose={() => setCoursesRow(null)}
        />
      )}

      {studentsRow && (
        <StudentsModal
          paymentId={studentsRow.id}
          companyName={studentsRow.company}
          onClose={() => setStudentsRow(null)}
        />
      )}

    </div>
  );
};

export default CompanyPayment;