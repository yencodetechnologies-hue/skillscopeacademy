import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CompanyDashboard.css";
import { API_URL } from "../../data/service";

function SummaryCards() {
  const cards = [
    {
      label: "Courses",
      title: "Browse courses",
      desc: "View available training courses in the Courses section",
      icon: (
        <svg className="cd-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2.5" />
          <path d="M2 9h20" />
        </svg>
      ),
    },
    {
      label: "Payments",
      title: "Training fees",
      desc: "Pay outstanding per-enrolment lines by card or bank; balances update when payments are applied",
      icon: (
        <svg className="cd-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
    },
    {
      label: "Students Enrolled",
      title: "Enrolled students",
      desc: "View students enrolled under your company in the Student Enrolled section",
      icon: (
        <svg className="cd-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <div className="cd-top-cards">
      {cards.map((card) => (
        <div key={card.label} className="cd-card">
          <div className="cd-card-header">
            <span className="cd-card-label">{card.label}</span>
            {card.icon}
          </div>
          <p className="cd-card-title">{card.title}</p>
          <p className="cd-card-desc">{card.desc}</p>
        </div>
      ))}
    </div>
  );
}

function EnrolmentLinkCard({ enrollLink }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(enrollLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="cd-enroll-card">
      <div className="cd-enroll-heading">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
        Employee enrolment link
      </div>
      <p className="cd-enroll-desc">
        Share this link with staff. They choose a course and session; training fees are billed to
        your company (no card payment on this link).
      </p>
      <div className="cd-enroll-url-box">{enrollLink}</div>
      <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
        <button className="cd-copy-btn" onClick={handleCopy}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

// ── View Students Mini-Modal ──────────────────────────────────────────────────
function ViewStudentsPanel({ companyId, token, onClose }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authToken = localStorage.getItem("token")
    fetch(`${API_URL}/api/students/company/${companyId}/link/${token}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
      .then(r => r.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }, [companyId, token])

  const statusStyle = (s) => {
    if (s === "paid")     return { background: "#1f2937", color: "#fff" }
    if (s === "pending")  return { background: "#f3f4f6", color: "#374151" }
    if (s === "failed")   return { background: "#fee2e2", color: "#dc2626" }
    return                       { background: "#fff7ed", color: "#c2410c" }
  }
  const statusText = (s) => {
    if (s === "paid")    return "Paid"
    if (s === "pending") return "Pending"
    if (s === "failed")  return "Failed"
    return "Not Paid"
  }

  return (
    <div style={{
      marginTop: "12px",
      border: "1px solid #e0e7ff",
      borderRadius: "10px",
      background: "#fafafa",
      overflow: "hidden",
    }}>
      {/* Panel header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 14px",
        background: "#f5f3ff",
        borderBottom: "1px solid #e0e7ff",
      }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: "#02afef" }}>
          👥 Students via this link
        </span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#6b7280", lineHeight: 1 }}
        >✕</button>
      </div>

      {/* Content */}
      <div style={{ padding: "10px 14px" }}>
        {loading ? (
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Loading...</p>
        ) : students.length === 0 ? (
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>No students enrolled via this link yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ textAlign: "left", padding: "6px 8px", color: "#6b7280", fontWeight: 600 }}>Student</th>
                <th style={{ textAlign: "left", padding: "6px 8px", color: "#6b7280", fontWeight: 600 }}>Amount</th>
                <th style={{ textAlign: "left", padding: "6px 8px", color: "#6b7280", fontWeight: 600 }}>Payment</th>
                <th style={{ textAlign: "left", padding: "6px 8px", color: "#6b7280", fontWeight: 600 }}>LLN</th>
                <th style={{ textAlign: "left", padding: "6px 8px", color: "#6b7280", fontWeight: 600 }}>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "7px 8px" }}>
                    <div style={{ fontWeight: 600, color: "#111" }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{s.email}</div>
                  </td>
                  <td style={{ padding: "7px 8px", color: "#374151" }}>{s.amount}</td>
                  <td style={{ padding: "7px 8px" }}>
                    <span style={{
                      ...statusStyle(s.paymentStatus),
                      padding: "2px 8px", borderRadius: 6,
                      fontSize: 11, fontWeight: 600,
                    }}>
                      {statusText(s.paymentStatus)}
                    </span>
                  </td>
                  <td style={{ padding: "7px 8px" }}>
                    <span style={{
                      background: s.llnd === "Completed" ? "#dcfce7" : "#f3f4f6",
                      color: s.llnd === "Completed" ? "#16a34a" : "#6b7280",
                      padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                    }}>
                      {s.llnd}
                    </span>
                  </td>
                  <td style={{ padding: "7px 8px", color: "#6b7280", whiteSpace: "nowrap" }}>{s.enrolled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ✅ NEW — Course Links Section
function CourseLinkCards({ companyId }) {
  const navigate = useNavigate()
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedToken, setCopiedToken] = useState(null)
  const [openToken, setOpenToken] = useState(null)   // which link's students panel is open

  useEffect(() => {
    if (!companyId) return
    fetch(`${API_URL}/api/course-links/company/${companyId}`)
      .then(res => res.json())
      .then(data => setLinks(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [companyId])

  const handleCopy = (token) => {
    const url = `${window.location.origin}/book-now?token=${token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2000)
    })
  }

  const toggleStudents = (token) => {
    setOpenToken(prev => prev === token ? null : token)
  }

  if (loading) return <p style={{ marginTop: "20px", color: "#888" }}>Loading course links...</p>
  if (links.length === 0) return null

  return (
    <div className="cd-quick-card" style={{ marginTop: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <p className="cd-quick-title">Course Booking Links</p>
          <p className="cd-quick-desc">
            Share these links with specific employees for each course booking.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
        {links.map((link) => {
          const url = `${window.location.origin}/book-now?token=${link.token}`
          const isFull = link.usedCount >= link.maxUses
          const isOpen = openToken === link.token
          return (
            <div key={link._id} style={{
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "14px 16px",
              background: isFull ? "#f9fafb" : "#fff",
              opacity: isFull ? 0.85 : 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <p style={{ fontWeight: "600", fontSize: "14px", color: "#111", margin: 0, marginBottom: "10px" }}>
                    {link.courseName}
                  </p>
                  <p style={{ fontSize: "12px", color: "#666", margin: "2px 0 0" }}>
                    {link.courseCode} {link.sessionDate ? `· ${new Date(link.sessionDate).toLocaleDateString("en-AU")}` : ""} {link.startTime ? `· ${link.startTime} - ${link.endTime}` : ""}
                  </p>
                </div>
                <span style={{
                  fontSize: "11px", fontWeight: "600",
                  padding: "3px 10px", borderRadius: "20px",
                  background: isFull ? "#fee2e2" : "#dcfce7",
                  color: isFull ? "#dc2626" : "#16a34a",
                }}>
                  {link.usedCount}/{link.maxUses} used {isFull ? "· Full" : "· Available"}
                </span>
              </div>

              <div style={{
                marginTop: "10px", background: "#f3f4f6", borderRadius: "6px",
                padding: "8px 12px", fontSize: "12px", color: "#555", wordBreak: "break-all",
              }}>
                {url}
              </div>

              {/* Buttons row */}
              <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => handleCopy(link.token)}
                  disabled={isFull}
                  style={{
                    padding: "7px 16px", fontSize: "13px", fontWeight: "600",
                    borderRadius: "8px", border: "none",
                    cursor: isFull ? "not-allowed" : "pointer",
                    background: isFull ? "#e5e7eb" : "#02afef",
                    color: isFull ? "#999" : "#fff",
                  }}
                >
                  {copiedToken === link.token ? "Copied!" : "Copy Link"}
                </button>

                <button
                  onClick={() => toggleStudents(link.token)}
                  style={{
                    padding: "7px 16px", fontSize: "13px", fontWeight: "600",
                    borderRadius: "8px", border: "1px solid #e0e7ff",
                    cursor: "pointer",
                    background: isOpen ? "#02afef" : "#f5f3ff",
                    color: isOpen ? "#fff" : "#02afef",
                    transition: "all 0.15s",
                  }}
                >
                  {isOpen ? "Hide Students" : "View Students"}
                </button>
              </div>

              {/* Students panel — toggled */}
              {isOpen && (
                <ViewStudentsPanel
                  companyId={companyId}
                  token={link.token}
                  onClose={() => setOpenToken(null)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatPurchaseDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Australia/Sydney",
  });
}

function formatSessionDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" });
}

function purchaseStatusLabel(p) {
  if (p.status === "success" || p.confirmed) return "Paid";
  if (p.status === "failed") return "Failed";
  return "Pending";
}

function PurchasedCoursesCard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/company-payments/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setOrders([]);
        }
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="cd-purchases-card">
      <div className="cd-purchases-heading">Purchased courses</div>
      <p className="cd-purchases-desc">
        Courses your company has paid for through the booking portal.
      </p>
      {loading ? (
        <p className="cd-purchases-empty">Loading purchase history...</p>
      ) : orders.length === 0 ? (
        <p className="cd-purchases-empty">No course purchases recorded yet.</p>
      ) : (
        <div className="cd-purchases-list">
          {orders.map((order) => {
            const status = purchaseStatusLabel(order);
            const statusStyle =
              status === "Paid"
                ? { background: "#ecfdf5", color: "#059669" }
                : status === "Failed"
                  ? { background: "#fef2f2", color: "#dc2626" }
                  : { background: "#fef3c7", color: "#b45309" };
            return (
              <div key={order._id} className="cd-purchase-item">
                <div className="cd-purchase-item-top">
                  <div>
                    <p className="cd-purchase-order-id">Order {order.orderId || "—"}</p>
                    <p className="cd-purchase-date">
                      {formatPurchaseDate(order.createdAt)}
                      {order.paymentMethod ? ` · ${order.paymentMethod}` : ""}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        ...statusStyle,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 6,
                        display: "inline-block",
                      }}
                    >
                      {status}
                    </span>
                    <p className="cd-purchase-amount">${Number(order.amount || 0).toFixed(2)}</p>
                  </div>
                </div>
                {order.gatewayTransactionId && (
                  <p className="cd-purchase-txn">Transaction: {order.gatewayTransactionId}</p>
                )}
                {(order.courses || []).length > 0 ? (
                  <ul className="cd-purchase-courses">
                    {(order.courses || []).map((c, i) => (
                      <li key={i}>
                        <strong>{c.courseName || "Course"}</strong>
                        {c.courseCode ? ` (${c.courseCode})` : ""}
                        {" · "}Qty {c.quantity || 1}
                        {c.sessionDate && (
                          <>
                            {" · "}
                            {formatSessionDate(c.sessionDate)}
                            {c.startTime ? ` ${c.startTime}` : ""}
                            {c.endTime ? ` – ${c.endTime}` : ""}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="cd-purchase-no-lines">No course details on this order.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function QuickLinksCard({ username, email }) {
  return (
    <div className="cd-quick-card">
      <p className="cd-quick-title">Quick Links</p>
      <p className="cd-quick-desc">
        Use the sidebar to navigate to Courses, Payments, and Student Enrolled sections.
      </p>
      <CourseLinkCards/>
      <div className="cd-quick-divider">
        You are logged in as {username} ({email}).
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function CompanyDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setData(user);
  }, []);

  if (!data) return <p>Loading...</p>;

  const username = data.name;
  const email = data.email;
  const enrollLink = `${window.location.origin}/book-now/company/${data.id}`;

  return (
    <div className="cd-wrapper">
      <p className="cd-page-label">Company Dashboard</p>
      <p className="cd-page-subtitle">
        Welcome back, {username}! Here&apos;s an overview of your account.
      </p>

      <SummaryCards />
      <EnrolmentLinkCard enrollLink={enrollLink} />
      <PurchasedCoursesCard />
      {/* <QuickLinksCard username={username} email={email} /> */}

      {/* ✅ Course Links */}
      <CourseLinkCards companyId={data.id} />
    </div>
  );
}