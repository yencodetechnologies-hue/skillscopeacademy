import React, { useState, useEffect } from 'react';
import { colors } from '../constants/theme';
import '../styles/CompanyPayment.css';
import { API_URL } from "../data/service";

function StatusBadge({ status }) {
  if (status === "success") return <span className="cp2-badge cp2-badge--success">Paid</span>;
  if (status === "pending") return <span className="cp2-badge cp2-badge--pending">Pending</span>;
  if (status === "failed") return <span className="cp2-badge cp2-badge--failed">Failed</span>;
  return null;
}

export default function AgentPayments() {
  const [agentUsers, setAgentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewedUser, setViewedUser] = useState(null);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchAgentUsers();
  }, []);

  const fetchAgentUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/students`);
      const data = await res.json();
      
      // Filter for agent type students
      const agents = data.data.filter(s => s.type === "Agent");
      setAgentUsers(agents);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load agent users");
    } finally {
      setLoading(false);
    }
  };

  const filtered = agentUsers.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    // If it's already a formatted string (like DD/MM/YYYY), return it
    if (typeof dateStr === "string" && dateStr.includes("/")) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr || "—";
    return d.toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 600, marginBottom: "8px" }}>Agent Payments</h1>
        <p style={{ color: colors.textFaint, fontSize: "14px" }}>
          Agent-linked registrations and payment details
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: colors.errorBg,
          border: "1px solid #fecaca",
          color: colors.error,
          padding: "12px",
          borderRadius: "6px",
          marginBottom: "1rem"
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search by student, course, or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            fontSize: "14px"
          }}
        />
        <button
          onClick={fetchAgentUsers}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#D4920E",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
      ) : agentUsers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          No agent users found
        </div>
      ) : (
        <>
          <div style={{
            overflowX: "auto",
            border: "1px solid #e5e7eb",
            borderRadius: "8px"
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px"
            }}>
              <thead>
                <tr style={{ backgroundColor: colors.bg, borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Date</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Name</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Email</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Phone</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Agent Link</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Course</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>LLND Status</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600 }}>Enrollment Status</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((user, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = colors.bgMuted}
                    onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = "white"}
                    onClick={() => setViewedUser(user)}
                  >
                    <td style={{ padding: "12px" }}>{formatDate(user.registerDate)}</td>
                    <td style={{ padding: "12px", fontWeight: 500 }}>{user.name}</td>
                    <td style={{ padding: "12px" }}>{user.email}</td>
                    <td style={{ padding: "12px" }}>{user.phone}</td>
                    <td style={{ padding: "12px" }}>{user.agentName || "—"}</td>
                    <td style={{ padding: "12px" }}>{user.course || "—"}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 500,
                        backgroundColor: user.llndStatus === "Completed" ? colors.successBg : colors.warningBg,
                        color: user.llndStatus === "Completed" ? colors.success : "#b45309"
                      }}>
                        {user.llndStatus}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 500,
                        backgroundColor: user.enrollmentForm === "Approved" ? colors.successBg : user.enrollmentForm === "Submitted" ? colors.infoBg : colors.warningBg,
                        color: user.enrollmentForm === "Approved" ? colors.success : user.enrollmentForm === "Submitted" ? colors.infoHover : "#b45309"
                      }}>
                        {user.enrollmentForm || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{
              marginTop: "1.5rem",
              display: "flex",
              justifyContent: "center",
              gap: "8px"
            }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "4px",
                    border: currentPage === page ? "none" : "1px solid #e5e7eb",
                    backgroundColor: currentPage === page ? colors.brandPrimary : "white",
                    color: currentPage === page ? colors.brandOnPrimary : colors.textFaint,
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {viewedUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setViewedUser(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600 }}>{viewedUser.name}</h2>
              <button
                onClick={() => setViewedUser(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: colors.textFaint
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: "grid", gap: "12px", fontSize: "14px" }}>
              <div>
                <strong>Email:</strong> {viewedUser.email}
              </div>
              <div>
                <strong>Phone:</strong> {viewedUser.phone}
              </div>
              <div>
                <strong>Type:</strong> Agent
              </div>
              <div>
                <strong>Agent Name:</strong> {viewedUser.agentName || "—"}
              </div>
              <div>
                <strong>Course:</strong> {viewedUser.course || "—"}
              </div>
              <div>
                <strong>LLND Status:</strong> {viewedUser.llndStatus}
              </div>
              <div>
                <strong>Enrollment Status:</strong> {viewedUser.enrollmentForm || "Pending"}
              </div>
              <div>
                <strong>Registered:</strong> {formatDate(viewedUser.registerDate)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
