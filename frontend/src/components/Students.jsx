import * as React from "react";
import { colors } from '../constants/theme';
import { useState, useEffect, useRef } from "react";
import "../styles/Student.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_URL } from "../data/service";
import { authHeaders } from "../utils/authHeaders";
const ITEMS_PER_PAGE = 10;

///Send mail to Multipple users

const handleMultipleMail = () => {
  if (selectedStudents.length === 0) {
    alert("Please select at least one student.");
    return;
  }

  console.log("Selected Students:", selectedStudents);

  // We'll call the backend API here in the next step
};

// ─── Badge Components ───────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const isCompleted = status === "Completed";
  return (
    <span className={`status-badge ${isCompleted ? "badge-completed" : "badge-not-completed"}`}>
      <span className="badge-icon">{isCompleted ? "✓" : "⊘"}</span>
      {status}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function PaymentBadge({ status }) {
  return (
    <span className={`payment-badge ${status === "Paid" ? "payment-paid" : "payment-unpaid"}`}>
      {status}
    </span>
  );
}

function ActiveBadge({ status }) {
  const isActive = status === "Active";
  return (
    <span className={`active-badge ${isActive ? "badge-active" : "badge-inactive"}`}>
      {status}
    </span>
  );
}

// ─── View Modal ──────────────────────────────────────────────────────────────

function ViewModal({ student, onClose, onRefresh, onUpdateStudent }) {
  if (!student) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Student details: {student.name}</h2>
            <p className="modal-subtitle">
              Profile, courses purchased, payment dates and history for {student.email}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-profile-card">
          <div className="modal-avatar">
            <span>{student.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="modal-profile-info">
            <h3 className="modal-name">{student.name}</h3>
            {student.nickname && <p className="modal-nick">({student.nickname})</p>}
            <p className="modal-email-line">✉ {student.email}</p>
            <p className="modal-phone-line">📞 {student.phone}</p>
            <div className="modal-badges">
              <ActiveBadge status={student.status} />
              <span className={`status-badge ${student.llndStatus === "Completed" ? "badge-completed" : "badge-not-completed"}`}>
                LLN: {student.llndStatus}
              </span>
              <span className={`status-badge ${student.enrollmentForm === "Completed" ? "badge-completed" : "badge-not-completed"}`}>
                Form: {student.enrollmentForm}
              </span>
            </div>
          </div>
        </div>



        <div className="modal-section">
          <h4 className="modal-section-title">📘 Course</h4>
          <div className="modal-detail-row"><span>Course</span><span>{student.course || "—"}</span></div>
          <div className="modal-detail-row"><span>Type</span><span>{student.type || "—"}</span></div>
          <div className="modal-detail-row"><span>Booking Date</span><span>{student.courseBookingDate || "—"}</span></div>
          <div className="modal-detail-row"><span>Booking ID</span><span style={{ fontWeight: '700', color: colors.brandPrimary }}>{student.bookingId || "—"}</span></div>
          <div className="modal-detail-row"><span>Register Date</span><span>{student.registerDate || "—"}</span></div>
          <div className="modal-detail-row"><span>Last Login</span><span>{student.lastLogin || "Never"}</span></div>
        </div>

        <div className="modal-section">
          <h4 className="modal-section-title">💲 Payment Summary</h4>
          <div className="modal-detail-row">
            <span>Payment Status</span>
            <PaymentBadge status={student.paymentStatus} />
          </div>
          <div className="modal-detail-row">
            <span>Payment Method</span>
            <PaymentBadge status={student.paymentMethod} />
          </div>
          <div className="modal-detail-row">
            <span>Transaction ID</span>
            <PaymentBadge status={student.transactionId} />
          </div>
          {student.gatewayTransactionId && student.gatewayTransactionId !== "—" && (
            <div className="modal-detail-row">
              <span>Gateway Transaction ID</span>
              <span style={{ fontWeight: '600', color: '#10b981' }}>{student.gatewayTransactionId}</span>
            </div>
          )}
          <div className="modal-detail-row">
            <span>Transaction URL</span>
            <a href={student.slipUrl} target="_blank" rel="noopener noreferrer">View Transaction</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────

function EditModal({ student, onClose, onSave }) {
  const [form, setForm] = useState({
    name: student?.name || "",
    nickname: student?.nickname || "",
    email: student?.email || "",
    phone: student?.phone || "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        name: form.name,
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
      };
      if (form.password) body.password = form.password;

      const res = await fetch(`${API_URL}/api/students/${student.id}`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update student");

      const updated = await res.json();
      onSave(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!student) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Edit Student</h2>
            <p className="modal-subtitle">Update student information</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-form">
          <label className="modal-label">Full Name</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">👤</span>
            <input
              className="modal-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
            />
          </div>

          <label className="modal-label">Preferred Name (Optional)</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">👤</span>
            <input
              className="modal-input"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="Johnny"
            />
          </div>

          <label className="modal-label">Email</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">✉</span>
            <input
              className="modal-input"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
            />
          </div>

          <label className="modal-label">Phone Number</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">📞</span>
            <input
              className="modal-input"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+61..."
            />
          </div>

          <label className="modal-label">New Password (optional)</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">🔒</span>
            <input
              className="modal-input"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Leave empty to keep current"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="modal-save-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Update Student"}
          </button>
        </div>
      </div>
    </div>
  );
}
///SEND EMAIL

function SendMailModal({ student, onClose }) {
  const [link, setLink] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");


const handleSendMail = async () => {

  if (!link.trim()) {
    setError("Please enter a manual link.");
    return;
  }

  try {
    setLoading(true);
    setError("");

 const res = await fetch(`${API_URL}/api/send-mail`, {
  method: "POST",
  headers: authHeaders({
    "Content-Type": "application/json",
  }),
  body: JSON.stringify({
    studentId: student._id || student.id,
    courseLink: link,
  }),
});

    if (!res.ok) {
      throw new Error("Failed to send email");
    }

    alert("Mail sent successfully.");

    onClose();

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  if (!student) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Send Manual Link</h2>
            <p className="modal-subtitle">
              Student: {student.name}
            </p>
          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-form">
          {error && (
  <div className="modal-error">
    {error}
  </div>
)}

          <label className="modal-label">
            Enter Manual Link
          </label>

          <div className="modal-input-wrap">
            <input
              className="modal-input"
              type="text"
              placeholder="https://example.com/link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

        </div>

        <div className="modal-actions">

          <button
            className="modal-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
  className="modal-save-btn"
  onClick={handleSendMail}
  disabled={loading}
>
  {loading ? "Sending..." : "Send Mail"}
</button>

        </div>

      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteModal({ student, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onConfirm(student.flowId);
    setDeleting(false);
  };

  if (!student) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Delete Student Account?</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-delete-body">
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Email:</strong> {student.email}</p>
          <p className="modal-delete-warning">This will remove the student and all related records. This action cannot be undone.</p>
        </div>
        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button className="modal-delete-confirm-btn" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Student Modal ────────────────────────────────────────────────────────

const getCourseVariants = (course) => {
  if (!course) return [];
  const pt = course.pricingType || (course.experienceBasedBooking ? "experience" : "standard");

  if (pt === "experience") {
    return [
      { variant: "with-experience", label: "With Experience", price: Number(course.withExperiencePrice || 0) },
      { variant: "without-experience", label: "Without Experience", price: Number(course.withoutExperiencePrice || 0) },
    ];
  }
  if (pt === "slbl") {
    return [
      { variant: "sl", label: "Single License", price: Number(course.slSinglePrice || 0) },
      { variant: "slbl", label: "Both Licenses (SL + BL)", price: Number(course.slblPrice || 0) },
    ];
  }
  return [{ variant: null, label: null, price: Number(course.sellingPrice || 0) }];
};

function AddStudentModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    email: "",
    phone: "",
    password: "",
    courseId: "",
    sessionId: "",
    transactionId: "",
    paymentMethod: "Bank Transfer",
  });
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false); // ✅ Added for custom dropdown
  const dropdownRef = React.useRef(null); // ✅ Used React.useRef for reliability
  const [selectedDate, setSelectedDate] = useState(null); // ✅ Added for session chips
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/api/courses`);
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // ✅ Handle click outside for dropdown
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setCourseOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCourseSelect = (courseId) => {
    setForm(prev => ({ ...prev, courseId }));
    setCourseOpen(false);
    setSelectedDate(null); // Reset date on course change
    // Manually trigger the fetch logic that was in handleChange
    fetchSessions(courseId);
  };

  const fetchSessions = async (courseId) => {
    setForm(prev => ({ ...prev, sessionId: "" }));
    if (courseId) {
      setLoadingSessions(true);
      try {
        const res = await fetch(`${API_URL}/api/schedules/course/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          const allSessions = data.flatMap(slot => 
            slot.sessions.map(s => ({ ...s, date: slot.date }))
          );
          setSessions(allSessions);
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      } finally {
        setLoadingSessions(false);
      }
    } else {
      setSessions([]);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "courseId") {
      setForm(prev => ({ ...prev, sessionId: "" }));
      if (value) {
        setLoadingSessions(true);
        try {
          const res = await fetch(`${API_URL}/api/schedules/course/${value}`);
          if (res.ok) {
            const data = await res.json();
            // Flatten sessions from slots
            const allSessions = data.flatMap(slot => 
              slot.sessions.map(s => ({ ...s, date: slot.date }))
            );
            setSessions(allSessions);
          }
        } catch (err) {
          console.error("Failed to fetch sessions:", err);
        } finally {
          setLoadingSessions(false);
        }
      } else {
        setSessions([]);
      }
    }
  };

  const handleFileChange = (e) => {
    setPaymentSlip(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.courseId || !form.sessionId) {
      setError("Name, email, password, course, and session are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, val);
      });
      if (paymentSlip) {
        formData.append("paymentSlip", paymentSlip);
      }

      const res = await fetch(`${API_URL}/api/students`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to add student");
      const newStudent = await res.json();
      onSave(newStudent);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Add New Student</h2>
            <p className="modal-subtitle">Create a new student account</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-form">
          <label className="modal-label">Full Name *</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">👤</span>
            <input className="modal-input" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" />
          </div>

          <label className="modal-label">Preferred Name (Optional)</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">👤</span>
            <input className="modal-input" name="nickname" value={form.nickname} onChange={handleChange} placeholder="Johnny" />
          </div>

          <label className="modal-label">Email *</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">✉</span>
            <input className="modal-input" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
          </div>

          <label className="modal-label">Phone Number</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">📞</span>
            <input className="modal-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+61..." />
          </div>

          <label className="modal-label">Password *</label>
          <div className="modal-input-wrap">
            <span className="modal-input-icon">🔒</span>
            <input className="modal-input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Set a password" />
          </div>

          <label className="modal-label">Select Course *</label>
          <div className="modal-input-wrap" ref={dropdownRef}>
            <span className="modal-input-icon">📖</span>
            <style>
              {`
                .custom-dropdown {
                  position: relative;
                  width: 100%;
                }
                .custom-dropdown-trigger {
                  padding: 10px 12px;
                  border: 1px solid #cbd5e1;
                  border-radius: 8px;
                  background: #fff;
                  cursor: pointer;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  font-size: 14px;
                  min-height: 42px;
                }
                .custom-dropdown-menu {
                  position: absolute;
                  top: calc(100% + 6px); /* Better spacing below trigger */
                  left: 0;
                  right: 0;
                  background: #fff;
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                  max-height: 350px;
                  overflow-y: auto;
                  z-index: 9999; /* Ensure it stays on top */
                  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                  padding: 0;
                }
                .custom-dropdown-group {
                  background: #e0f2fe; /* Light blue from Screenshot 2 */
                  color: ${colors.brandPrimary}; /* Brand accent text */
                  font-weight: 700;
                  padding: 10px 15px;
                  font-size: 11px;
                  text-transform: uppercase;
                  border-top: 1px solid #bae6fd;
                  border-bottom: 1px solid #bae6fd;
                  letter-spacing: 0.05em;
                  position: sticky;
                  top: 0;
                  z-index: 10;
                  display: block;
                  width: 100%;
                  box-sizing: border-box;
                }
                .custom-dropdown-option {
                  padding: 12px 15px;
                  cursor: pointer;
                  font-size: 13px;
                  transition: all 0.2s;
                  color: #334155;
                  border-bottom: 1px solid #f1f5f9;
                  background: #fff;
                }
                .custom-dropdown-option:hover {
                  background: #f8fafc;
                  color: ${colors.brandPrimary};
                  padding-left: 20px;
                }
                .custom-dropdown-placeholder { color: #94a3b8; }
              `}
            </style>
            
            <div className="custom-dropdown">
              <div className="custom-dropdown-trigger" onClick={() => setCourseOpen(!courseOpen)}>
                <span className={form.courseId ? "" : "custom-dropdown-placeholder"}>
                  {form.courseId 
                    ? (courses.find(c => c._id === form.courseId)?.title + " - $" + (courses.find(c => c._id === form.courseId)?.sellingPrice || 0))
                    : "Select a course"}
                </span>
                <span style={{ fontSize: '10px', color: colors.slate500 }}>{courseOpen ? "▲" : "▼"}</span>
              </div>
              
              {courseOpen && (
                <div className="custom-dropdown-menu">
                  {Object.entries(
                    courses.reduce((acc, course) => {
                      // ✅ Try to get category name from different possible fields
                      const cat = (course.category && typeof course.category === 'object' ? course.category.name : course.category) || "Other Courses";
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(course);
                      return acc;
                    }, {})
                  ).map(([category, catCourses]) => (
                    <div key={category}>
                      <div className="custom-dropdown-group">{category}</div>
                      {catCourses.flatMap((c) => {
                        const variants = getCourseVariants(c);
                        return variants.map((v) => (
                          <div 
                            key={`${c._id}-${v.variant}`} 
                            className="custom-dropdown-option"
                            onClick={() => handleCourseSelect(c._id)}
                          >
                            {c.courseCode} - {c.title} {v.label ? `(${v.label})` : ""} - ${v.price}
                          </div>
                        ));
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {form.courseId && (
            <div className="session-selection-container" style={{ marginTop: '20px' }}>
              <style>
                {`
                  .session-heading {
                    font-size: 15px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 12px;
                  }
                  .date-chips-wrap {
                    display: flex;
                    gap: 10px;
                    overflow-x: auto;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                  }
                  .date-chip {
                    min-width: 80px;
                    padding: 10px;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.2s;
                    background: #fff;
                  }
                  .date-chip--active {
                    background: #f5f3ff;
                    border-color:${colors.brandPrimary};
                    color:${colors.brandPrimary};
                  }
                  .date-chip__day { font-size: 11px; font-weight: 600; text-transform: uppercase; }
                  .date-chip__date { font-size: 14px; font-weight: 700; margin: 2px 0; }
                  .date-chip__session { font-size: 10px; color: #64748b; }
                  .date-chip--active .date-chip__session { color:${colors.brandPrimary}; }
                  
                  .session-cards-wrap {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 10px;
                  }
                  .session-card {
                    padding: 15px;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: #fff;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                  }
                  .session-card:hover { border-color:${colors.brandPrimary}; background: #fdfcff; }
                  .session-card--active {
                    background: #f5f3ff;
                    border-color:${colors.brandPrimary};
                  }
                  .session-card__time {
                    font-weight: 600;
                    color: #334155;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                  }
                  .session-card__slots {
                    font-size: 12px;
                    color:${colors.brandPrimary};
                    font-weight: 500;
                    padding-left: 24px;
                  }
                  .clear-btn {
                    color: #64748b;
                    font-size: 12px;
                    cursor: pointer;
                    margin-bottom: 10px;
                    display: inline-block;
                  }
                `}
              </style>

              <h3 className="session-heading">
                Select date for {courses.find(c => c._id === form.courseId)?.title}
              </h3>

              {selectedDate && (
                <div className="clear-btn" onClick={() => { setSelectedDate(null); setForm(prev => ({ ...prev, sessionId: "" })); }}>
                  ✕ Clear
                </div>
              )}

              <div className="date-chips-wrap">
                {loadingSessions ? (
                  <p style={{ fontSize: '13px', color: colors.slate500 }}>⏳ Loading sessions...</p>
                ) : sessions.length > 0 ? (
                  Object.entries(
                    sessions.reduce((acc, s) => {
                      if (!acc[s.date]) acc[s.date] = [];
                      acc[s.date].push(s);
                      return acc;
                    }, {})
                  ).map(([date, dateSessions]) => {
                    const d = new Date(date);
                    const isActive = selectedDate === date;
                    return (
                      <div 
                        key={date} 
                        className={`date-chip ${isActive ? "date-chip--active" : ""}`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="date-chip__day">{d.toLocaleDateString("en-AU", { weekday: "short" })}</div>
                        <div className="date-chip__date">{d.getDate()} {d.toLocaleDateString("en-AU", { month: "short" })}</div>
                        <div className="date-chip__session">{dateSessions.length} session{dateSessions.length > 1 ? "s" : ""}</div>
                      </div>
                    );
                  })
                ) : (
                   <p style={{ fontSize: '13px', color: '#ef4444' }}>❌ No upcoming sessions available.</p>
                )}
              </div>

              {selectedDate && (
                <>
                  <h3 className="session-heading" style={{ fontSize: '13px', color: colors.slate500 }}>
                    Sessions on {new Date(selectedDate).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </h3>
                  <div className="session-cards-wrap">
                    {sessions
                      .filter(s => s.date === selectedDate)
                      .map(s => {
                        const isActive = form.sessionId === s._id;
                        return (
                          <div 
                            key={s._id} 
                            className={`session-card ${isActive ? "session-card--active" : ""}`}
                            onClick={() => setForm(prev => ({ ...prev, sessionId: s._id }))}
                          >
                            <div className="session-card__time">
                              <span>🕒</span>
                              {s.startTime} - {s.endTime}
                            </div>
                            <div className="session-card__slots">
                              {s.maxStudents - (s.enrolledCount || 0)} slots available
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </>
              )}
            </div>
          )}

          <label className="modal-label">Payment Method *</label>
          <div className="modal-radio-group" style={{ display: "flex", gap: "20px", marginTop: "10px", padding: "10px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="radio"
                name="paymentMethod"
                value="Bank Transfer"
                checked={form.paymentMethod === "Bank Transfer"}
                onChange={handleChange}
              />
              Bank Transfer
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="radio"
                name="paymentMethod"
                value="Pay Later"
                checked={form.paymentMethod === "Pay Later"}
                onChange={handleChange}
              />
              Pay Later
            </label>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label className="modal-label">Payment Receipt (Optional)</label>
            <div style={{ 
              marginTop: '8px', 
              border: '2px dashed #cbd5e1', 
              borderRadius: '8px', 
              padding: '10px',
              textAlign: 'center',
              background: colors.slate50
            }}>
              <input 
                type="file" 
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                style={{ fontSize: '12px' }}
              />
              <p style={{ fontSize: '10px', color: colors.slate500, marginTop: '5px' }}>
                Upload proof of bank transfer or receipt
              </p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="modal-save-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? "Adding..." : "Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────


export default function Students() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  
  // Get page from URL or default to 1
  const currentPage = parseInt(searchParams.get("page") || "1") || 1;

  const setCurrentPage = (pageOrFn) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const currentPage = parseInt(next.get("page") || "1") || 1;
      const nextPage = typeof pageOrFn === "function" ? pageOrFn(currentPage) : pageOrFn;
      next.set("page", String(nextPage));
      return next;
    });
  };

  // Modal states
  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mailStudent, setMailStudent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendType, setSendType] = useState("email");
  const [showEmailModal, setShowEmailModal] = useState(false);
const [courseLink, setCourseLink] = useState("");
const [showWhatsappModal, setShowWhatsappModal] = useState(false);
const [whatsappLink, setWhatsappLink] = useState("");
  const navigate = useNavigate();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  // useEffect(() => {
  //   const fetchStudents = async () => {
  //     console.log("[DEBUG] fetchStudents: Starting fetch from", `${API_URL}/api/students`);
  //     try {
  //       const res = await fetch(`${API_URL}/api/students`);
  //       console.log("[DEBUG] fetchStudents: Response status =", res.status, res.statusText);
  //       if (!res.ok) throw new Error("Failed to fetch students");
  //       const data = await res.json();
  //       console.log("[DEBUG] fetchStudents: Successfully fetched", data.length, "students");
  //       setStudents(data);
  //     } catch (err) {
  //       console.error("[DEBUG] fetchStudents: Error caught =", err);
  //       setError(err.message);
  //     } finally {
  //       console.log("[DEBUG] fetchStudents: Setting loading to false");
  //       setLoading(false);
  //     }
  //   };
  //   fetchStudents();
  // }, []);

  
useEffect(() => {
  if (viewStudent) {
    const updated = students.find(s => s.flowId === viewStudent.flowId);
    if (updated) setViewStudent(updated);
  }
}, [students]);
  // useEffect(() => {
  //   const fetchStudents = async () => {
  //     try {
  //       const res = await fetch(`${API_URL}/api/students`);
  //       console.log("studentsresponse",res );
        
  //       if (!res.ok) throw new Error("Failed to fetch students");
  //       const data = await res.json();
  //       console.log("studentdata",data);
        
  //       setStudents(data);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchStudents();
  // }, []);

useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
  return () => clearTimeout(timer);
}, [search]);

useEffect(() => {
  setSearchParams((prev) => {
    if ((prev.get("page") || "1") === "1") return prev;
    const next = new URLSearchParams(prev);
    next.set("page", "1");
    return next;
  });
}, [debouncedSearch, statusFilter, setSearchParams]);

const applySearchNow = () => {
  setDebouncedSearch(search.trim());
  setCurrentPage(1);
};

 const fetchStudents = async () => {
  try {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(ITEMS_PER_PAGE),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter !== "All Status") params.set("status", statusFilter);

    const res = await fetch(
      `${API_URL}/api/students?${params.toString()}`
    );

    if (!res.ok) throw new Error("Failed to fetch students");

    const result = await res.json();

    setStudents(result.data || []);
    setTotal(result.total || 0);
    setTotalPages(result.totalPages || 1);

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
// useEffect(() => {
//   fetchStudents();
// }, []);

useEffect(() => {
  console.log(selectedStudents);
}, [selectedStudents]);

useEffect(() => {
  fetchStudents();
}, [currentPage, debouncedSearch, statusFilter]);

  // ── Filter & Paginate ──────────────────────────────────────────────────────
  // const filtered = students
  //   .filter((s) => {
  //     const sSearch = search.toLowerCase();
  //     if (!sSearch) return statusFilter === "All Status" || s.status === statusFilter;

  //     const matchSearch =
  //       (s.name?.toLowerCase().startsWith(sSearch)) ||
  //       (s.email?.toLowerCase().startsWith(sSearch)) ||
  //       (s.phone?.toLowerCase().startsWith(sSearch)) ||
  //       (s.nickname?.toLowerCase().startsWith(sSearch)) ||
  //       (s.companyName?.toLowerCase().startsWith(sSearch)) ||
  //       (s.transactionId?.toLowerCase().startsWith(sSearch)) ||
  //       (s.courseCode?.toLowerCase().startsWith(sSearch)) ||
  //       (s.courseTitle?.toLowerCase().startsWith(sSearch));

  //     const matchStatus =
  //       statusFilter === "All Status" || s.status === statusFilter;
  //     return matchSearch && matchStatus;
  //   })
  //   .sort((a, b) => {
  //     if (!search) return 0;
  //     const sSearch = search.toLowerCase();
  //     const aName = a.name?.toLowerCase() || "";
  //     const bName = b.name?.toLowerCase() || "";
      
  //     const aStarts = aName.startsWith(sSearch);
  //     const bStarts = bName.startsWith(sSearch);

  //     if (aStarts && !bStarts) return -1;
  //     if (!aStarts && bStarts) return 1;

  //     return 0;
  //   });

  const displayStudents = students;

//   // ── CRUD Handlers ──────────────────────────────────────────────────────────
// const fetchStudents = async () => {
//   try {
//     const res = await fetch(`${API_URL}/api/students`);
//     const data = await res.json();
//     setStudents(data);
//   } catch (err) {
//     console.error(err);
//   }
// };
  // Edit: update student in list after save
  // const handleEditSave = (updated) => {
  //   setStudents((prev) =>
  //     prev.map((s) => (s.flowId === updated.flowId ? { ...s, ...updated } : s)  )
  //   );
  //   setEditStudent(null);
  
  // };
  // const handleEditSave = (updated) => {
  //   setStudents((prev) =>
  //     prev.map((s) => (s.flowId === updated.flowId ? { ...s, ...updated } : s)  )
  //   );
  //   setEditStudent(null);
  //   fetchStudents();
  // };

  const handleEditSave = (updated) => {
  setStudents((prev) =>
    prev.map((s) =>
      s.flowId === updated.flowId ? { ...s, ...updated } : s
    )
  );
  setEditStudent(null);
};
  // Deactivate / Activate toggle
const handleToggleStatus = async (student) => {
  const newStatus = student.status === "Active" ? "Inactive" : "Active";

  try {
    const res = await fetch(`${API_URL}/api/students/${student.flowId}/status`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) throw new Error("Failed to update status");

    const updated = await res.json();

    // setStudents((prev) =>
    //   prev.map((s) =>
    //     s.flowId === student.flowId
    //       ? { ...s, status: updated.status } // ⚡ no fallback needed
    //       : s
    //   )
    // );

    setStudents((prev) =>
      prev.map((s) =>
        s.flowId === student.flowId
          ? { ...s, status: updated.status } // ⚡ no fallback needed
          : s
      )
    );
  
  prev.map((s) =>
    s.flowId === student.flowId
      ? { ...s, status: newStatus }
      : s
  )

    // fetchStudents();

  } catch (err) {
    alert("Error: " + err.message);
  }
};

  // Delete
  const handleDeleteConfirm = async (flowId) => {
    try {
      const res = await fetch(`${API_URL}/api/students/${flowId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete student");
      // setStudents((prev) => prev.filter((s) => s.flowId !== flowId));
      // setDeleteStudent(null);

      setStudents((prev) => prev.filter((s) => s.flowId !== flowId));
      setDeleteStudent(null);

setDeleteStudent(null);
      // fetchStudents();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Add new student
  const handleAddSave = (newStudent) => {
    setStudents((prev) => [newStudent, ...prev]);
    setShowAddModal(false);
  };

  
  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="sm-page">
      {/* Section Header */}
      <div className="sm-section-header">
        <div className="sm-page-header">
          <h1 className="sm-page-title">Student Management</h1>
          <p className="sm-page-subtitle">Manage all registered students</p>
        </div>
        <button className="sm-add-btn" onClick={() => setShowAddModal(true)}>
          <span className="sm-add-btn-icon">+</span> Add New Student
        </button>
      </div>

      {/* Search & Filter */}
      <div className="sm-card sm-search-card">
        <h3 className="sm-card-title">Search &amp; Filter</h3>
        <p className="sm-card-subtitle">Find students by name, email, or status</p>
        <div className="sm-search-row">
          <div className="sm-search-input-wrap">
            <span className="sm-search-icon">🔍</span>
            <input
              className="sm-search-input"
              type="text"
              placeholder="Search students by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearchNow()}
            />
          </div>
          <select
            className="sm-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button className="sm-search-btn" type="button" onClick={applySearchNow}>
            🔍 Search
          </button>
        </div>
      </div>
<div style={{ marginBottom: "10px", fontWeight: "bold" }}>
  Selected Students: {selectedStudents.length}
</div>
      {/* Table */}
      <div className="sm-card sm-table-card">
        <div className="sm-table-header">
          <h3 className="sm-card-title">Student Accounts ({total})</h3>
          <p className="sm-card-subtitle">Manage all student registrations and access</p>
        </div>

        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  }}
>
  <div style={{ fontWeight: "600" }}>
    Selected Students: {selectedStudents.length}
  </div>

<button
  className="sm-add-btn"
  onClick={() => {
    if (selectedStudents.length === 0) {
      alert("Please choose at least one user.");
      return;
    }

    setShowSendModal(true);
  }}
>
  📤 Send
</button>
</div>

       
        {error && <p className="sm-error">Error: {error}</p>}

        {!loading && !error && (
          <div className="sm-table-scroll">
            <table className="sm-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Register date</th>
                  <th>Booking ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Course schedule date</th>
                  <th>LLN Status</th>
                  <th>Enrollment Form</th>
                  <th>Payment Method</th>
                  <th>Payment status</th>
                  <th>Bank Transfer ID</th>
                  <th>Gateway Transaction ID</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                
               

                {displayStudents.length === 0 ? (
                  <tr>
                    
                    <td colSpan={17} style={{ textAlign: "center", padding: "2rem", color: colors.textIcon }}>
                      No students found.
                    </td>
                  </tr>
                ) : (
                  displayStudents.map((s) => (
                    <tr key={s.flowId}>
                       <td>
<input
  type="checkbox"
  checked={selectedStudents.some((stu) => stu.flowId === s.flowId)}
  onChange={(e) => {
    if (e.target.checked) {
      setSelectedStudents([...selectedStudents, s]);
    } else {
      setSelectedStudents(
        selectedStudents.filter((stu) => stu.flowId !== s.flowId)
      );
    }
  }}
/>
</td>
                      <td>
                        <div className="sm-date">{s.registerDate}</div>
                        <div className="sm-time">{s.registerTime}</div>
                      </td>
                      <td className="sm-booking-id">
                        <div className="sm-date" style={{ fontWeight: '600', color: colors.brandPrimary }}>
                          {s.bookingId || "—"}
                        </div>
                      </td>
                      <td>
                        <div className="sm-student-cell">
                          <div className="sm-avatar">
                            <span className="sm-avatar-icon">🎓</span>
                          </div>
                          <div>
                            <div className="sm-student-name">{s.name}</div>
                            {s.nickname && (
                              <div className="sm-student-nick">({s.nickname})</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{s.type}</div>
                        {s.type === "Company" && s.companyName && (
                          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#0066cc" }}>
                           {s.companyName}
                          </div>
                        )}
                        {s.type === "Agent" && (
                          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: colors.brandPrimary }}>
                            {s.agentName || "Agent"}
                          </div>
                        )}
                        {s.linkName && (
                          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#059669" }}>
                            {s.linkName}
                          </div>
                        )}
                      </td>
                      <td className="sm-email">{s.email}</td>
                      <td>{s.phone}</td>
                      <td className="sm-course">
                        <div style={{ fontWeight: 500 }}>{s.courseTitle || "—"}</div>
                        <div style={{ fontSize: "0.75rem", color: colors.textIcon }}>{s.courseCategory || ""}</div>
                      </td>
                      <td>{s.courseBookingDate}</td>
                      <td>
                        <div className="sm-status-cell">
                          <StatusBadge status={s.llndStatus} />
                          <button
                            className="sm-icon-btn"
                            title="View LLN"
                            onClick={() => navigate(`/admin/llnd-results?studentId=${s.flowId}&openModal=true`)}
                          >
                            👁
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="sm-status-cell">
                          <StatusBadge status={s.enrollmentForm} />
                          <button
                            className="sm-icon-btn"
                            title="View Enrollment "
                            onClick={() => navigate(`/admin/enrollment-forms?studentEmail=${s.email}&openModal=true`)}
                          >
                            👁
                          </button>
                        </div>
                      </td>
                       <td>
                        <PaymentBadge status={s.paymentMethod} />
                      </td>
                      <td>
                        <PaymentBadge status={s.paymentStatus} />
                      </td>
                      <td>
                        <div style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", fontWeight: "600", color: "#4b5563" }}>
                          {(s.paymentMethod === "Bank Transfer" || s.paymentMethod === "Manual") ? (s.transactionId || "—") : "-"}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", fontWeight: "600", color: colors.brandPrimary }}>
                          {s.gatewayTransactionId && s.gatewayTransactionId !== "—" ? s.gatewayTransactionId : (s.paymentMethod === "Card Payment" ? "—" : "-")}
                        </div>
                      </td>
                      <td>
                        <ActiveBadge status={s.status} />
                      </td>
                      <td>{s.lastLogin || "Never"}</td>
                      <td>
                        <div className="sm-actions">
                          {/* View */}
                          <button
                            className="sm-icon-btn"
                            title="View"
                            onClick={() => setViewStudent(s)}
                          >
                            👁
                          </button>

                          {/* Edit */}
                          <button
                            className="sm-icon-btn"
                            title="Edit"
                            onClick={() => setEditStudent(s)}
                          >
                            ✏️
                          </button>

                          {/* Deactivate / Activate */}
                          <button
                            className={s.status === "Active" ? "sm-deactivate-btn" : "sm-activate-btn"}
                            onClick={() => handleToggleStatus(s)}
                          >
                            {s.status === "Active" ? "Deactivate" : "Activate"}
                          </button>

                          {/* Delete */}
                          <button
                            className="sm-icon-btn sm-delete-btn"
                            title="Delete"
                            onClick={() => setDeleteStudent(s)}
                          >
                            🗑
                          </button>

                          <button
    className="sm-icon-btn"
    title="Send Mail"
    onClick={() => setMailStudent(s)}
>
    📧
</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* <pre>
{JSON.stringify(selectedStudents, null, 2)}
</pre> */}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && total > 0 && (
          <div className="sm-pagination">
            <span className="sm-pagination-info">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, total)} of{" "}
              {total} results
            </span>
            <div className="sm-pagination-controls">
              <button
                className="sm-page-btn"
                // onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                // disabled={currentPage === 1}

                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="sm-page-indicator">
                {/* Page {currentPage} of {totalPage} */}
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="sm-page-btn"
                // onClick={() => setCurrentPage((p) => Math.min(totalPage, p + 1))}
                // disabled={currentPage === totalPage}

                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {viewStudent && (
        <ViewModal student={viewStudent} onClose={() => setViewStudent(null)} />
      )}
      {editStudent && (
        <EditModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSave={handleEditSave}
        />
      )}
      {deleteStudent && (
        <DeleteModal
          student={deleteStudent}
          onClose={() => setDeleteStudent(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddSave}
        />
      )}

      {mailStudent && (
  <SendMailModal
    student={mailStudent}
    onClose={() => setMailStudent(null)}
  />
)}

{showSendModal && (
  <div className="modal-overlay">
    <div className="send-modal">

      <h2 className="send-heading">Choose Sending Method</h2>
      <p className="send-subtitle">
        Select how you want to send the course link.
      </p>

      <div
        className={`send-option ${sendType === "email" ? "active" : ""}`}
        onClick={() => setSendType("email")}
      >
        <div className="send-option-icon">📧</div>

        <div>
          <h4>Send via Email</h4>
          <p>
            Send course link to <b>{selectedStudents.length}</b> selected
            student{selectedStudents.length > 1 ? "s" : ""}.
          </p>
        </div>
      </div>

      <div
        className={`send-option ${sendType === "whatsapp" ? "active" : ""}`}
        onClick={() => setSendType("whatsapp")}
      >
        <div className="send-option-icon">💬</div>

        <div>
          <h4>Send via WhatsApp</h4>
          <p>
            Share the course link through WhatsApp.
          </p>
        </div>
      </div>

      <div className="send-buttons">
        <button
          className="next-btn"
          onClick={() => {
            setShowSendModal(false);

            if (sendType === "email") {
              setShowEmailModal(true);
            } else {
              // alert("WhatsApp functionality will be implemented later.");
              setShowWhatsappModal(true);
            }
          }}
        >
          Continue
        </button>

        <button
          className="cancel-btn"
          onClick={() => setShowSendModal(false)}
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}

{showEmailModal && (
  <div className="modal-overlay">
    <div className="send-modal">

      <div className="send-modal-header">
        <h2>📧 Send Email</h2>
        <p>
          Send course link to <strong>{selectedStudents.length}</strong> selected
          student{selectedStudents.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="send-modal-body">

        <label className="input-label">
          Course Link
        </label>

        <input
          type="text"
          className="course-input"
          value={courseLink}
          onChange={(e) => setCourseLink(e.target.value)}
          placeholder="https://example.com/course-link"
        />

      </div>

      <div className="send-modal-footer">

        <button
          className="next-btn"
          onClick={async () => {
            if (selectedStudents.length === 0) {
              alert("Please select at least one student.");
              return;
            }

            if (!courseLink.trim()) {
              alert("Please enter course link.");
              return;
            }

            try {
              const res = await fetch(
                `${API_URL}/api/send-mail/multiple`,
                {
                  method: "POST",
                  headers: authHeaders({
                    "Content-Type": "application/json",
                  }),
                  body: JSON.stringify({
                    students: selectedStudents,
                    courseLink,
                  }),
                }
              );

              const data = await res.json();

              if (!res.ok) {
                alert(data.message);
                return;
              }

              alert("Emails sent successfully.");

              setShowEmailModal(false);
              setCourseLink("");

            } catch (err) {
              console.error(err);
              alert("Failed to send emails.");
            }
          }}
        >
          📤 Send Email
        </button>

        <button
          className="cancel-btn"
          onClick={() => setShowEmailModal(false)}
        >
          Cancel
        </button>

      </div>

    </div>
  </div>
)}

{showWhatsappModal && (
  <div className="modal-overlay">
    <div className="send-modal">

      <div className="send-modal-header">
        <h2>💬 Send via WhatsApp</h2>

        <p>
          Send course link to{" "}
          <strong>{selectedStudents.length}</strong>{" "}
          selected student
          {selectedStudents.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="send-modal-body">

        <label className="input-label">
          Course Link
        </label>

        <input
          type="text"
          className="course-input"
          value={courseLink}
          onChange={(e) => setCourseLink(e.target.value)}
          placeholder="https://example.com/course-link"
        />

        <div style={{
          display: "flex",
          gap: "10px",
          marginTop: "15px"
        }}>

          {/* Copy Link */}
          <button
            className="cancel-btn"
            onClick={async () => {
              if (!courseLink.trim()) {
                alert("Please enter course link.");
                return;
              }

              try {
                await navigator.clipboard.writeText(courseLink);
                alert("Course link copied!");
              } catch (error) {
                alert("Failed to copy link.");
              }
            }}
          >
            📋 Copy Link
          </button>

          {/* Open WhatsApp */}
          <button
            className="next-btn"
            onClick={() => {

              if (!courseLink.trim()) {
                alert("Please enter course link.");
                return;
              }

              const message =
                `Hello,\n\nPlease use the following course link:\n${courseLink}\n\nThank you.`;

              const encodedMessage =
                encodeURIComponent(message);

              // Open WhatsApp Web
              window.open(
                `https://web.whatsapp.com/send?text=${encodedMessage}`,
                "_blank"
              );
            }}
          >
            💬 Open WhatsApp
          </button>

        </div>

      </div>

      <div className="send-modal-footer">

        <button
          className="cancel-btn"
          onClick={() => {
            setShowWhatsappModal(false);
            setCourseLink("");
          }}
        >
          Cancel
        </button>

      </div>

    </div>
  </div>
)}
    </div>
  );
}