import { useState, useEffect } from "react";
import { colors } from '../constants/theme';
import "../styles/EnrollmentForms.css";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { API_URL } from "../data/service";
import { authHeaders } from "../utils/authHeaders";

const ITEMS_PER_PAGE = 10;

function DocViewer({ url, alt, className, style }) {
  if (!url) return null;
  if (/\.pdf($|\?)/i.test(url)) {
    return (
      <a href={url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: colors.brandPrimary, color: colors.brandOnPrimary, borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
        📄 Open PDF
      </a>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={style}
      onError={e => { e.currentTarget.style.display = "none"; }}
    />
  );
}

function StatusBadge({ status }) {
  const map = {
    Approved: { className: "badge badge-approved", icon: "✓" },
    Pending: { className: "badge badge-pending", icon: "⏱" },
    Rejected: { className: "badge badge-rejected", icon: "✕" },
  };
  const { className, icon } = map[status] || {};
  return (
    <span className={className}>
      <span className="badge-icon">{icon}</span> {status}
    </span>
  );
}

/* ── MODAL ── */
function EnrollmentModal({ form, onClose, onStatusChange, onDateChange }) {
  const [activeTab, setActiveTab] = useState("Applicant");
  const [updating, setUpdating] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [savingDate, setSavingDate] = useState(false);
  const [reviewedAt, setReviewedAt] = useState(null);
  const tabs = ["Applicant", "USI", "Education", "Additional", "Declaration"];

  if (!form) return null;

  // ✅ Correct field mapping from actual API response
  const raw = form.raw || {};
  const p = raw.personalDetails || {};
  const addr = raw.address?.residential || {};
  const postalAddr = raw.address?.postal || {};
  const emergency = raw.emergencyContact || {};
  const usi = raw.usi || {};
  const edu = raw.education || {};
  const employment = raw.employment || {};
  const qualifications = raw.qualifications || {};
  const specialNeeds = raw.specialNeeds || {};
  const language = raw.language || {};

  // Use reviewedAt state if set (after edit), otherwise fall back to raw.reviewedAt then raw.updatedAt
  const effectiveReviewedAt = reviewedAt ?? raw.reviewedAt ?? raw.updatedAt;
  const reviewedDate = effectiveReviewedAt
    ? new Date(effectiveReviewedAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })
    : new Date().toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" });

  // Format date as YYYY-MM-DD for the date input value
  const reviewedDateInputValue = effectiveReviewedAt
    ? new Date(effectiveReviewedAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const statusConfig = {
    Approved: { bg: "#f0fdf4", border: "#bbf7d0", color: colors.success, icon: "✓" },
    Pending:  { bg: "#fffbeb", border: "#fde68a", color: "#d97706", icon: "⏱" },
    Rejected: { bg: "#fef2f2", border: "#fecaca", color: colors.error, icon: "✕" },
  };
  const sc = statusConfig[form.status] || statusConfig.Pending;

  // const handleStatus = async (status) => {
  //   setUpdating(true);
  //   try {
  //     await axios.patch(`${API_URL}/api/enrollment-form/${form.id}/status`, { status }, {
  //       headers: authHeaders(),
  //     });
  //     onStatusChange(form.id, status);
  //     onClose();
  //   } catch (err) {
  //     alert("Failed to update status");
  //   } finally {
  //     setUpdating(false);
  //   }
  // };

  const handleSaveDate = async (newDate) => {
    if (!newDate) return;
    setSavingDate(true);
    try {
      const res = await axios.patch(
        `${API_URL}/api/enrollment-form/${form.id}/reviewed-date`,
        { reviewedAt: newDate },
        { headers: authHeaders() }
      );
      // Update local modal state with the saved date
      const savedDate = res.data.reviewedAt || newDate;
      setReviewedAt(savedDate);
      setEditingDate(false);
      // ✅ Sync the listing row date so it updates immediately without re-fetch
      if (onDateChange) onDateChange(form.id, savedDate);
    } catch (err) {
      alert("Failed to update reviewed date");
    } finally {
      setSavingDate(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Enrollment Form Details</h2>
            <p className="modal-subtitle">Review the student's enrollment form submission</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Status Bar */}
        <div className="modal-status-bar" style={{ background: sc.bg, borderColor: sc.border }}>
          <div className="modal-status-left">
            <span className="modal-status-icon" style={{ color: sc.color }}>
              {sc.icon === "✓" ? (
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke={sc.color} strokeWidth="2"/>
                  <path d="M6 10l3 3 5-5" stroke={sc.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : sc.icon}
            </span>
            <div>
              <p className="modal-status-text" style={{ color: sc.color }}>Status: {form.status}</p>
              {/* ── Reviewed Date with Edit Button ── */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                {editingDate ? (
                  /* Inline date editor */
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="date"
                      defaultValue={reviewedDateInputValue}
                      id="reviewed-date-input"
                      style={{
                        fontSize: 12,
                        padding: "3px 8px",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        color: colors.slate800,
                        background: colors.white,
                        outline: "none",
                        height: 28,
                        cursor: "pointer",
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById("reviewed-date-input");
                        if (input?.value) handleSaveDate(input.value);
                      }}
                      disabled={savingDate}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 6,
                        border: "none",
                        background: colors.success,
                        color: colors.white,
                        cursor: savingDate ? "not-allowed" : "pointer",
                        height: 28,
                        opacity: savingDate ? 0.7 : 1,
                      }}
                    >
                      {savingDate ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingDate(false)}
                      disabled={savingDate}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                        background: colors.white,
                        color: colors.slate500,
                        cursor: "pointer",
                        height: 28,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  /* Static date display with edit button */
                  <>
                    <p className="modal-status-date">Reviewed on {reviewedDate}</p>
                    <button
                      onClick={() => setEditingDate(true)}
                      title="Change reviewed date"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 5,
                        border: "1px solid #cbd5e1",
                        background: colors.white,
                        color: colors.slate600,
                        cursor: "pointer",
                        lineHeight: 1.4,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = colors.slate100; e.currentTarget.style.borderColor = colors.textSubtle; }}
                      onMouseLeave={e => { e.currentTarget.style.background = colors.white; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                    >
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit date
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="modal-status-actions">
            {form.status !== "Approved" && (
              <button
                className="modal-action-btn approve-btn"
                onClick={() => handleStatus("Approved")}
                disabled={updating}
              >
                <i className="fa-solid fa-check"></i> {updating ? "..." : "Approve"}
              </button>
            )}
            {form.status !== "Rejected" && (
              <button
                className="modal-action-btn reject-btn"
                onClick={() => handleStatus("Rejected")}
                disabled={updating}
              >
                <i className="fa-solid fa-xmark"></i> {updating ? "..." : "Reject"}
              </button>
            )}
            <button
              className="modal-action-btn"
              onClick={() => window.open(`/print.html?id=${form.id}`, "_blank")}
            >
              <i className="fa-regular fa-file"></i> View PDF
            </button>

            {/* Print - ?print=true pass பண்ணும் */}
            <button
              className="modal-action-btn"
              onClick={() => window.open(`/print.html?id=${form.id}&print=true`, "_blank")}
            >
              <i className="fa-solid fa-print"></i> Print
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="modal-tabs modal-tabs-enrl-forms">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`modal-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="modal-body">

          {/* ── APPLICANT TAB ── */}
          {activeTab === "Applicant" && (
            <div className="modal-section-group">
              <div className="modal-section">
                <h4 className="modal-section-title">Personal Details</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Title</span>
                    <span className="field-value">{p.title || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Full Name</span>
                    <span className="field-value">
                      {[p.givenName, p.middleName, p.surname].filter(Boolean).join(" ") || "N/A"}
                    </span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Preferred Name</span>
                    <span className="field-value">{p.preferredName || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Date of Birth</span>
                    <span className="field-value">
                      {p.dob ? new Date(p.dob).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }) : "N/A"}
                    </span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Gender</span>
                    <span className="field-value">{p.gender || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Email</span>
                    <span className="field-value">{p.email || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Mobile</span>
                    <span className="field-value">{p.mobilePhone || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Home Phone</span>
                    <span className="field-value">{p.homePhone || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Work Phone</span>
                    <span className="field-value">{p.workPhone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Residential Address</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Street</span>
                    <span className="field-value">{addr.address || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Suburb</span>
                    <span className="field-value">{addr.suburb || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">State</span>
                    <span className="field-value">{addr.state || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Postcode</span>
                    <span className="field-value">{addr.postcode || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Postal Address</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Street</span>
                    <span className="field-value">{postalAddr.address || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Suburb</span>
                    <span className="field-value">{postalAddr.suburb || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">State</span>
                    <span className="field-value">{postalAddr.state || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Postcode</span>
                    <span className="field-value">{postalAddr.postcode || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Emergency Contact</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Name</span>
                    <span className="field-value">{emergency.name || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Relationship</span>
                    <span className="field-value">{emergency.relationship || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Phone</span>
                    {/* ✅ API field is contactNumber, not phone */}
                    <span className="field-value">{emergency.contactNumber || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Consent</span>
                    <span className="field-value">{emergency.consent ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">
                  <i className="fa-regular fa-user" style={{ marginRight: 6 }}></i>
                  Photo and ID Card
                </h4>
                {raw.idDocumentUrl && (
                  <div className="modal-photo-block">
                    <div className="modal-photo-label-row">
                      <span className="field-label">Primary Photo ID</span>
                      <a href={raw.idDocumentUrl} target="_blank" rel="noreferrer" className="view-fullsize-link">
                        <i className="fa-regular fa-eye"></i> View full size
                      </a>
                    </div>
                    <DocViewer url={raw.idDocumentUrl} alt="Primary ID" className="modal-photo-img" />
                  </div>
                )}
                {raw.photoDocumentUrl && (
                  <div className="modal-photo-block">
                    <div className="modal-photo-label-row">
                      <span className="field-label">Photo</span>
                      <a href={raw.photoDocumentUrl} target="_blank" rel="noreferrer" className="view-fullsize-link">
                        <i className="fa-regular fa-eye"></i> View full size
                      </a>
                    </div>
                    <DocViewer url={raw.photoDocumentUrl} alt="Student Photo" className="modal-photo-img" />
                  </div>
                )}
                {!raw.idDocumentUrl && !raw.photoDocumentUrl && (
                  <p className="field-value">No documents uploaded</p>
                )}
              </div>
            </div>
          )}

          {/* ── USI TAB ── */}
          {activeTab === "USI" && (
            <div className="modal-section-group">
              <div className="modal-section">
                <h4 className="modal-section-title">USI Details</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">USI Number</span>
                    {/* ✅ API field is usi.number */}
                    <span className="field-value">{usi.number || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Apply through SafeTicks</span>
                    <span className="field-value">{usi.staApplication === "yes" ? "Yes" : "No"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">USI Access Permission</span>
                    <span className="field-value">{usi.permission ? "Yes" : "No"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Town of Birth</span>
                    <span className="field-value">{usi.staTownOfBirth || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Overseas Town</span>
                    <span className="field-value">{usi.staOverseasTown || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">ID Type</span>
                    <span className="field-value">{usi.staIdType || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Authorise Name</span>
                    <span className="field-value">{usi.staAuthoriseName || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">SafeTicks Consent</span>
                    <span className="field-value">{usi.staConsent ? "Yes" : "No"}</span>
                  </div>
                </div>
                {usi.staIdFileUrl && (
                  <div className="modal-photo-block" style={{ marginTop: 16 }}>
                    <div className="modal-photo-label-row">
                      <span className="field-label">USI ID Document</span>
                      <a href={usi.staIdFileUrl} target="_blank" rel="noreferrer" className="view-fullsize-link">
                        <i className="fa-regular fa-eye"></i> View full size
                      </a>
                    </div>
                    <DocViewer url={usi.staIdFileUrl} alt="USI ID" className="modal-photo-img" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── EDUCATION TAB ── */}
          {activeTab === "Education" && (
            <div className="modal-section-group">
              <div className="modal-section">
                <h4 className="modal-section-title">Prior Education</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Highest Level</span>
                    {/* ✅ API field is edu.highestLevel */}
                    <span className="field-value">{edu.highestLevel || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Year Completed</span>
                    <span className="field-value">{edu.yearCompleted || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">School Name</span>
                    <span className="field-value">{edu.schoolName || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">School State</span>
                    <span className="field-value">{edu.schoolState || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">School Postcode</span>
                    <span className="field-value">{edu.schoolPostcode || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Qualifications</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Has Qualification</span>
                    <span className="field-value">{qualifications.hasQualification ? "Yes" : "No"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Types</span>
                    <span className="field-value">
                      {qualifications.types?.length ? qualifications.types.join(", ") : "N/A"}
                    </span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Details</span>
                    <span className="field-value">{qualifications.details || "N/A"}</span>
                  </div>
                </div>
                {qualifications.evidenceUrl && (
                  <div className="modal-photo-block" style={{ marginTop: 16 }}>
                    <div className="modal-photo-label-row">
                      <span className="field-label">Evidence Document</span>
                      <a href={qualifications.evidenceUrl} target="_blank" rel="noreferrer" className="view-fullsize-link">
                        <i className="fa-regular fa-eye"></i> View full size
                      </a>
                    </div>
                    <DocViewer url={qualifications.evidenceUrl} alt="Qualification Evidence" className="modal-photo-img" />
                  </div>
                )}
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Employment</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Employment Status</span>
                    {/* ✅ API field is employment.status */}
                    <span className="field-value">{employment.status || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Employer Name</span>
                    <span className="field-value">{employment.details?.employerName || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Supervisor</span>
                    <span className="field-value">{employment.details?.supervisorName || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Employer Email</span>
                    <span className="field-value">{employment.details?.email || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Employer Phone</span>
                    <span className="field-value">{employment.details?.phone || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Training Reason</span>
                    <span className="field-value">{raw.trainingReason || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ADDITIONAL TAB ── */}
          {activeTab === "Additional" && (
            <div className="modal-section-group">
              <div className="modal-section">
                <h4 className="modal-section-title">Language & Background</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Country of Birth</span>
                    {/* ✅ API field is language.countryOfBirth */}
                    <span className="field-value">{language.countryOfBirth || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Speaks Other Language</span>
                    <span className="field-value">{language.speaksOtherLanguage === "yes" ? "Yes" : "No"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Other Language</span>
                    <span className="field-value">{language.otherLanguage || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Indigenous Status</span>
                    <span className="field-value">{language.indigenousStatus || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Special Needs / Disability</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Has Disability</span>
                    {/* ✅ API field is specialNeeds.hasDisability */}
                    <span className="field-value">{specialNeeds.hasDisability ? "Yes" : "No"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Types</span>
                    <span className="field-value">
                      {specialNeeds.types?.length ? specialNeeds.types.join(", ") : "N/A"}
                    </span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Other Details</span>
                    <span className="field-value">{specialNeeds.other || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DECLARATION TAB ── */}
          {activeTab === "Declaration" && (
            <div className="modal-section-group">
              <div className="modal-section">
                <h4 className="modal-section-title">Declaration & Signature</h4>
                <div className="modal-grid-3">
                  <div className="modal-field">
                    <span className="field-label">Student Name</span>
                    <span className="field-value">{raw.studentName || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Declaration Date</span>
                    <span className="field-value">{raw.declarationDate || "N/A"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Form Completed</span>
                    <span className="field-value">{raw.enrollmentFormCompleted ? "Yes" : "No"}</span>
                  </div>
                  <div className="modal-field">
                    <span className="field-label">Submitted At</span>
                    <span className="field-value">
                      {raw.enrollmentFormSubmittedAt
                        ? new Date(raw.enrollmentFormSubmittedAt).toLocaleString("en-AU", { timeZone: "Australia/Sydney" })
                        : "N/A"}
                    </span>
                  </div>
                </div>
                {raw.signatureUrl && (
                  <div className="modal-field" style={{ marginTop: 16 }}>
                    <span className="field-label">Signature</span>
                    <div className="modal-signature-box">
                      <img src={raw.signatureUrl} alt="Signature" className="modal-signature-img" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ── */
function EnrollmentForms() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedForm, setSelectedForm] = useState(null);
  const [searchParams] = useSearchParams();

  const filtered = data.filter((row) => {
    const matchSearch =
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      (row.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" || row.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalSubmitted = data.length;
  const pending = data.filter((r) => r.status === "Pending").length;
  const approved = data.filter((r) => r.status === "Approved").length;
  const rejected = data.filter((r) => r.status === "Rejected").length;

  const fetchForms = async () => {
    try {
      const formsRes = await axios.get(`${API_URL}/api/enrollment-form`);

      const formatted = formsRes.data.map((item) => ({
        id: item._id,
        date: new Date(item.reviewedAt || item.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" }),
        name: `${item.personalDetails?.givenName || ""} ${item.personalDetails?.surname || ""}`.trim(),
        email: item.personalDetails?.email,
        phone: item.personalDetails?.mobilePhone,
        course: item.courseTitle || "N/A",
        bookingDate: item.courseBookingDate || "N/A",
        type: item.enrollmentType || "Individual",
        status: item.status,
        enrollments: item.enrollment?.units?.length || 1,
        raw: item,
      }));
      setData(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  // ✅ Auto-open modal from URL params (redirect from Students page)
  useEffect(() => {
    const email = searchParams.get("studentEmail");
    const openModal = searchParams.get("openModal");
    if (!email || !openModal || data.length === 0) return;
    const record = data.find(
      (r) => r.email?.toLowerCase() === email.toLowerCase()
    );
    if (record) setSelectedForm(record);
  }, [data, searchParams]);

  // ✅ Update status in UI after Approve/Reject
  const handleStatusChange = (id, newStatus) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  // ✅ Update listing date + raw.reviewedAt when admin edits reviewed date in modal
  const handleDateChange = (id, newReviewedAt) => {
    const formattedDate = new Date(newReviewedAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" });
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              date: formattedDate,
              raw: { ...item.raw, reviewedAt: newReviewedAt },
            }
          : item
      )
    );
    // Also update the currently open modal's form so the modal reflects the change
    setSelectedForm((prev) =>
      prev && prev.id === id
        ? { ...prev, date: formattedDate, raw: { ...prev.raw, reviewedAt: newReviewedAt } }
        : prev
    );
  };

  const handlePrint = (id) => {
    window.open(`/print.html?id=${id}`, "_blank");
  };

  return (
    <div className="ef-container">
      <div className="ef-header">
        <h2 className="ef-title">Student Enrollment Forms</h2>
        <p className="ef-subtitle">Review and manage student enrollment form submissions</p>
      </div>

      {/* Stat Cards */}
      <div className="ef-stats">
        <div className="stat-card">
          <div>
            <p className="stat-label">Total Submitted</p>
            <p className="stat-value purple-enrl">{totalSubmitted}</p>
          </div>
          <div className="stat-icon purple-bg">📋</div>
        </div>
        <div className="stat-card">
          <div>
            <p className="stat-label">Pending Review</p>
            <p className="stat-value yellow">{pending}</p>
          </div>
          <div className="stat-icon yellow-bg">⏱</div>
        </div>
        <div className="stat-card">
          <div>
            <p className="stat-label">Approved</p>
            <p className="stat-value green-enrl">{approved}</p>
          </div>
          <div className="stat-icon green-bg">✓</div>
        </div>
        <div className="stat-card">
          <div>
            <p className="stat-label">Rejected</p>
            <p className="stat-value red">{rejected}</p>
          </div>
          <div className="stat-icon red-bg">✕</div>
        </div>
      </div>

      {/* Filters */}
      <div className="ef-filters">
        <div className="search-wrapper">
          <span className="search-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
          <input
            className="ef-search"
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <select
          className="ef-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option>All Status</option>
          <option>Approved</option>
          <option>Pending</option>
          <option>Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="ef-table-section">
        <div className="ef-table-header">
          <div>
            <h3 className="ef-table-title">Enrollment Forms ({filtered.length})</h3>
            <p className="ef-table-sub">Review submitted enrollment forms</p>
          </div>
        </div>

        <div className="ef-table-wrapper">
          <table className="ef-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Course</th>
                <th>Course booking date</th>
                <th>Individual/Company</th>
                <th>Status</th>
                <th>Enrollments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>
                    <div className="name-cell">
                      <span className="avatar"><i className="fa-regular fa-user"></i></span>
                      {row.name}
                    </div>
                  </td>
                  <td>{row.email}</td>
                  <td>{row.phone}</td>
                  <td>{row.course}</td>
                  <td>{row.bookingDate}</td>
                  <td>{row.type}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>
                    <span className="enrollments-badge">{row.enrollments} course</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn"
                        title="View"
                        onClick={() => setSelectedForm(row)}
                      >
                        <i className="fa-regular fa-eye"></i>
                      </button>
                      <button className="action-btn icon-btn" title="Document">
                        <i className="fa-regular fa-file"></i>
                      </button>
                      <button
                        className="action-btn icon-btn"
                        onClick={() => handlePrint(row.id)}
                        title="Print"
                      >
                        <i className="fa-solid fa-print"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="no-results">No results found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="ef-pagination">
          <span className="pagination-info">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} results
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              className="page-btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Modal with onStatusChange */}
      {selectedForm && (
        <EnrollmentModal
          form={selectedForm}
          onClose={() => setSelectedForm(null)}
          onStatusChange={handleStatusChange}
          onDateChange={handleDateChange}
        />
      
      )}
    </div>
  );
}

export default EnrollmentForms;