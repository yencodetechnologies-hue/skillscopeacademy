import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import '../styles/Payments.css';
import { API_URL } from "../data/service";

const ITEMS_PER_PAGE = 10;

const Payment = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [stats, setStats] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const currentPage = parseInt(searchParams.get("page") || "1");
  const setCurrentPage = (page) => {
    setSearchParams(prev => {
      prev.set("page", page);
      return prev;
    });
  };
  const [searchQuery, setSearchQuery] = useState("");

  const openReview = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const formatStatus = (status) => {
    if (status === "success" || status === "completed") return "Verified";
    if (status === "pending" || status === "unpaid") return "Pending";
    if (status === "failed") return "Rejected";
    return status || "Pending";
  };

  const [uploading, setUploading] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/flow/payments`);
      setPayments(res.data.payments.map(p => ({
        ...p,
        date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-AU") : p.date,
        time: p.createdAt ? new Date(p.createdAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase() : ""
      })));
      setStats(res.data.stats);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      // Optimistic Update
      setPayments(prev => prev.map(p => 
        (p.enrollmentId === selectedPayment.enrollmentId && p.itemId === selectedPayment.itemId)
          ? { ...p, status: "success" }
          : p
      ));
      
      await axios.put(
        `${API_URL}/api/flow/payment/${selectedPayment.enrollmentId}/${selectedPayment.itemId}`,
        { status: "success" }
      );
      
      // Refresh background data to stay in sync
      fetchPayments();
      setShowModal(false);
    } catch (err) {
      console.error("Verify Error:", err);
      alert("Failed to verify payment. Please try again.");
      fetchPayments(); // Rollback on error
    }
  };

  const handleReject = async () => {
    try {
      if (!selectedPayment?.enrollmentId || !selectedPayment?.itemId) {
        alert("Invalid payment data");
        return;
      }
      if (!rejectionReason) {
        alert("Enter rejection reason");
        return;
      }

      // Optimistic Update
      setPayments(prev => prev.map(p => 
        (p.enrollmentId === selectedPayment.enrollmentId && p.itemId === selectedPayment.itemId)
          ? { ...p, status: "failed" }
          : p
      ));

      await axios.put(
        `${API_URL}/api/flow/payment/${selectedPayment.enrollmentId}/${selectedPayment.itemId}`,
        { status: "failed", reason: rejectionReason }
      );
      
      fetchPayments();
      setShowModal(false);
      setRejectionReason(""); // Clear reason
    } catch (err) {
      console.error("Reject Error:", err);
      alert("Failed to reject payment. Please try again.");
      fetchPayments(); // Rollback on error
    }
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile || !selectedPayment) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("paymentSlip", receiptFile);
      formData.append("flowId", selectedPayment.enrollmentId);
      formData.append("courseId", selectedPayment.code);
      formData.append("payment", JSON.stringify({
        status: selectedPayment.status,
        method: selectedPayment.method,
        amount: selectedPayment.amount,
        transactionId: selectedPayment.transId
      }));

      await axios.post(`${API_URL}/api/flow/payment`, formData);
      alert("Receipt uploaded successfully");
      fetchPayments();
      setReceiptFile(null);
      setShowModal(false);
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredPayments = payments
    .filter(p => p.type?.toLowerCase() !== "company")
    .filter(p => p.type?.toLowerCase() !== "agent")
    .filter(p => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      
      // Split name into words to check if any part starts with the query
      const nameWords = (p.student || "").toLowerCase().split(" ");
      const nameMatch = nameWords.some(word => word.startsWith(q));

      return (
        nameMatch ||
        p.email?.toLowerCase().includes(q) ||
        p.course?.toLowerCase().includes(q) ||
        p.transId?.toLowerCase().includes(q)
      );
    });

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPayments = filteredPayments.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className="payment-container">
      <header className="payment-header">
        <h2>Payment Management</h2>
        <p>Track and manage course payments and verify student receipts</p>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="table-section">
        <div className="table-header">
          <h3>Payment Receipt Verification</h3>
          <button className="refresh-btn" onClick={fetchPayments}>🔄 Refresh</button>
        </div>

        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: '0 0 16px',
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '8px 14px',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6.5" cy="6.5" r="4.5" stroke="#999" strokeWidth="1.4" />
            <path d="M10.5 10.5L14 14" stroke="#999" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search by student, email, course, transaction ID..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              width: '100%',
              background: 'transparent',
              color: '#333',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#999',
                padding: '0',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
          {searchQuery && (
            <span style={{ fontSize: '11px', color: '#999', whiteSpace: 'nowrap' }}>
              {filteredPayments.length} result{filteredPayments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="table-responsive">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Booking date</th>
                <th>Booking ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Schedule Date</th>
                <th>Method</th>
                <th>Bank Transfer ID</th>
                <th>Gateway Transaction ID</th>
                <th>Amount</th>
                <th>Payment date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '32px', color: '#999', fontSize: '14px' }}>
                    {searchQuery ? `No results found for "${searchQuery}"` : "No payments found"}
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p, index) => (
                  <tr key={p.id || p.transId || index}>
                    <td className="date-cell">
                      <div>{p.date}</div>
                      <div className="time-muted">{p.time || "—"}</div>
                    </td>
                    <td className="td-mono" style={{ fontWeight: '600', color: '#cc0000' }}>
                      {p.bookingId || "—"}
                    </td>
                    <td>
                      <div className="student-info">
                        <span className="name">{p.student}</span>
                        <span className="email-muted">{p.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="course-info">
                        <span className="course-name-bold">{p.course}</span>
                      </div>
                    </td>
                    <td className="td-muted">{p.sessionDate || "—"}</td>
                    <td className="td-muted">{p.method || "Individual"}</td>
                    <td className="td-mono" style={{ fontWeight: '600' }}>
                      {p.method === "Bank Transfer" ? (p.transId || "—") : "—"}
                    </td>
                    <td className="td-mono" style={{ color: '#cc0000', fontWeight: '600' }}>{p.gatewayTransId || "—"}</td>
                    <td className="amount">${p.amount}</td>
                    <td className="td-muted">{p.date}</td>
                    <td>
                      <span className={`status-badge ${formatStatus(p.status).toLowerCase()}`}>
                        {formatStatus(p.status)}
                      </span>
                    </td>
                    <td>
                      <button className="review-btn" onClick={() => openReview(p)}>👁 Review</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - always show when data exists */}
        {filteredPayments.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
            marginTop: '20px',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1, background: '#f5f5f5', fontSize: '13px',
              }}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '6px 10px', borderRadius: '4px',
                  border: currentPage === page ? '2px solid #cc0000' : '1px solid #ddd',
                  background: currentPage === page ? '#cc0000' : '#f5f5f5',
                  color: currentPage === page ? '#fff' : '#000',
                  cursor: 'pointer',
                  fontWeight: currentPage === page ? '500' : 'normal',
                  minWidth: '32px', fontSize: '13px',
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1, background: '#f5f5f5', fontSize: '13px',
              }}
            >
              Next →
            </button>

            <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
              Page {currentPage} of {totalPages} · {filteredPayments.length} records
            </span>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3>Payment Receipt Review</h3>
                <p>Verify payment receipt for {selectedPayment.student}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="close-x">×</button>
            </div>

            <div className="modal-body modal-body-payments">
              {/* Top Info Cards */}
              <div className="info-grid-v2">
                <div className="info-card-v2 student">
                  <h4>Student Information</h4>
                  <p><strong>Name: {selectedPayment.student}</strong></p>
                  <p><strong>Email:</strong> {selectedPayment.email}</p>
                </div>
                <div className="info-card-v2 course">
                  <h4>Course Information</h4>
                  <p><strong>Course: {selectedPayment.course}</strong></p>
                  <p><strong>Code:</strong> {selectedPayment.code || "—"}</p>
                  <p><strong>Course Price:</strong> ${selectedPayment.amount}</p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="transaction-section-v2">
                <h4>Transaction Details</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <div className="label">Booking ID:</div>
                    <div className="value mono-box" style={{ fontWeight: '700', color: '#cc0000' }}>
                      {selectedPayment.bookingId || "—"}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="label">
                      {selectedPayment.method === "Bank Transfer" ? "Bank Transfer ID:" : "Gateway Transaction ID:"}
                    </div>
                    <div className="value mono-box" style={{ color: (selectedPayment.method === "Pay Later" || !selectedPayment.gatewayTransId) ? '#000' : 'inherit' }}>
                      {selectedPayment.method === "Bank Transfer" 
                        ? (selectedPayment.transId && selectedPayment.transId !== "—" ? selectedPayment.transId : selectedPayment.gatewayTransId || "—")
                        : (selectedPayment.method === "Pay Later" ? "—" : (selectedPayment.gatewayTransId && selectedPayment.gatewayTransId !== "—" ? selectedPayment.gatewayTransId : selectedPayment.transId || "—"))
                      }
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="label">Amount Paid:</div>
                    <div className="value amount">${selectedPayment.amount}</div>
                  </div>
                  <div className="detail-item">
                    <div className="label">
                      {selectedPayment.method === "Pay Later" ? "Booking Date:" : "Payment Date:"}
                    </div>
                    <div className="value">{selectedPayment.date}</div>
                  </div>
                  <div className="detail-item">
                    <div className="label">Upload Date:</div>
                    <div className="value">{selectedPayment.date}, {selectedPayment.time || "—"}</div>
                  </div>
                  <div className="detail-item">
                    <div className="label">Payment Method:</div>
                    <div className="value bold">{selectedPayment.method || "Card Payment"}</div>
                  </div>
                  {selectedPayment.method === "Bank Transfer" && (
                    <div className="detail-item">
                      <div className="label">Bank:</div>
                      <div className="value">{selectedPayment.bankName || "Bank Transfer"}</div>
                    </div>
                  )}
                  {selectedPayment.method === "Bank Transfer" && (
                    <div className="detail-item">
                      <div className="label">Reference:</div>
                      <div className="value bold">{selectedPayment.transId}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Receipt Preview */}
              <div className="receipt-section-v2">
                <div className="receipt-header">
                  <span>Payment Receipt</span>
                  {selectedPayment.slipUrl && (
                    <button 
                      className="download-btn"
                      onClick={() => window.open(selectedPayment.slipUrl, "_blank")}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download Receipt
                    </button>
                  )}
                </div>
                
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px' }}>
                  File: {selectedPayment.slipUrl ? selectedPayment.slipUrl.split('/').pop() : "No receipt uploaded"}
                </p>

                <div className="receipt-preview-v2">
                  {selectedPayment.slipUrl ? (
                    /\.pdf($|\?)/i.test(selectedPayment.slipUrl) ? (
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '48px' }}>📄</span>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '10px' }}>PDF Document</p>
                      </div>
                    ) : (
                      <img 
                        src={selectedPayment.slipUrl} 
                        alt="Receipt" 
                        style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }} 
                      />
                    )
                  ) : (
                    <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                      <p style={{ fontSize: '24px' }}>📄</p>
                      <p>No receipt preview available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Bar */}
              {selectedPayment.status === "success" || selectedPayment.status === "completed" ? (
                <div className="status-bar-v2 verified">
                  <div className="icon">✓</div>
                  <div className="text">
                    <h5>Verified</h5>
                    <p>on {selectedPayment.date}, {selectedPayment.time || "—"}</p>
                  </div>
                </div>
              ) : selectedPayment.status === "failed" ? (
                <div className="status-bar-v2 rejected">
                  <div className="icon">×</div>
                  <div className="text">
                    <h5>Rejected</h5>
                    <p>{selectedPayment.reason || "No reason provided"}</p>
                  </div>
                </div>
              ) : null}

            </div>

            <div className="modal-footer-v2">
              <button className="btn-base btn-close" onClick={() => setShowModal(false)}>Close</button>
              {(selectedPayment.status !== "success" && selectedPayment.status !== "completed") && (
                <button className="btn-base btn-confirm" onClick={handleVerify}>Confirm Payment</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;