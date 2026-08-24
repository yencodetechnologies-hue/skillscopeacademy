import * as React from "react";
import { colors } from "../constants/theme";
import { useState, useEffect, useRef } from "react";
import "../styles/Student.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_URL } from "../data/service";
import { authHeaders } from "../utils/authHeaders";

const ITEMS_PER_PAGE = 10;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
}

// ─────────────────────────────────────────────────────────────
// Badge Components
// ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const isCompleted = status === "Completed";

  return (
    <span
      className={`status-badge ${
        isCompleted
          ? "badge-completed"
          : "badge-not-completed"
      }`}
    >
      <span className="badge-icon">
        {isCompleted ? "✓" : "⊘"}
      </span>

      {status || "—"}
    </span>
  );
}

function PaymentBadge({ status }) {
  return (
    <span
      className={`payment-badge ${
        status === "Paid"
          ? "payment-paid"
          : "payment-unpaid"
      }`}
    >
      {status || "—"}
    </span>
  );
}

function ActiveBadge({ status }) {
  const isActive = status === "Active";

  return (
    <span
      className={`active-badge ${
        isActive
          ? "badge-active"
          : "badge-inactive"
      }`}
    >
      {status || "—"}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// View Modal
// ─────────────────────────────────────────────────────────────

function ViewModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              Student details: {student.name}
            </h2>

            <p className="modal-subtitle">
              Profile, courses purchased, payment dates and
              history for {student.email}
            </p>
          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-profile-card">
          <div className="modal-avatar">
            <span>
              {student.name
                ?.charAt(0)
                .toUpperCase()}
            </span>
          </div>

          <div className="modal-profile-info">
            <h3 className="modal-name">
              {student.name}
            </h3>

            {student.nickname && (
              <p className="modal-nick">
                ({student.nickname})
              </p>
            )}

            <p className="modal-email-line">
              ✉ {student.email}
            </p>

            <p className="modal-phone-line">
              📞 {student.phone || "—"}
            </p>

            <div className="modal-badges">
              <ActiveBadge status={student.status} />

              <span
                className={`status-badge ${
                  student.llndStatus === "Completed"
                    ? "badge-completed"
                    : "badge-not-completed"
                }`}
              >
                LLN: {student.llndStatus || "—"}
              </span>

              <span
                className={`status-badge ${
                  student.enrollmentForm === "Completed"
                    ? "badge-completed"
                    : "badge-not-completed"
                }`}
              >
                Form: {student.enrollmentForm || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Course */}
        <div className="modal-section">
          <h4 className="modal-section-title">
            📘 Course
          </h4>

          <div className="modal-detail-row">
            <span>Course</span>
            <span>
              {student.courseTitle ||
                student.course ||
                "—"}
            </span>
          </div>

          <div className="modal-detail-row">
            <span>Type</span>
            <span>{student.type || "—"}</span>
          </div>

          <div className="modal-detail-row">
            <span>Booking Date</span>
            <span>
              {student.courseBookingDate || "—"}
            </span>
          </div>

          <div className="modal-detail-row">
            <span>Booking ID</span>

            <span
              style={{
                fontWeight: "700",
                color: colors.brandPrimary,
              }}
            >
              {student.bookingId || "—"}
            </span>
          </div>

          <div className="modal-detail-row">
            <span>Register Date</span>
            <span>
              {student.registerDate || "—"}
            </span>
          </div>

          <div className="modal-detail-row">
            <span>Last Login</span>
            <span>
              {student.lastLogin || "Never"}
            </span>
          </div>
        </div>

        {/* Payment */}
        <div className="modal-section">
          <h4 className="modal-section-title">
            💲 Payment Summary
          </h4>

          <div className="modal-detail-row">
            <span>Payment Status</span>
            <PaymentBadge
              status={student.paymentStatus}
            />
          </div>

          <div className="modal-detail-row">
            <span>Payment Method</span>
            <PaymentBadge
              status={student.paymentMethod}
            />
          </div>

          <div className="modal-detail-row">
            <span>Transaction ID</span>

            <span
              style={{
                fontFamily:
                  "'Courier New', Courier, monospace",
                fontWeight: "600",
              }}
            >
              {student.transactionId || "—"}
            </span>
          </div>

          {student.gatewayTransactionId &&
            student.gatewayTransactionId !== "—" && (
              <div className="modal-detail-row">
                <span>
                  Gateway Transaction ID
                </span>

                <span
                  style={{
                    fontWeight: "600",
                    color: "#10b981",
                  }}
                >
                  {student.gatewayTransactionId}
                </span>
              </div>
            )}

          <div className="modal-detail-row">
            <span>Transaction URL</span>

            {student.slipUrl ? (
              <a
                href={student.slipUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Transaction
              </a>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Edit Modal
// ─────────────────────────────────────────────────────────────

function EditModal({
  student,
  onClose,
  onSave,
}) {
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
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!student) return;

    setSaving(true);
    setError(null);

    try {
      const body = {
        name: form.name,
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
      };

      if (form.password) {
        body.password = form.password;
      }

      const res = await fetch(
        `${API_URL}/api/students/${student.id}`,
        {
          method: "PUT",
          headers: authHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to update student"
        );
      }

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
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              Edit Student
            </h2>

            <p className="modal-subtitle">
              Update student information
            </p>
          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        <div className="modal-form">
          <label className="modal-label">
            Full Name
          </label>

          <div className="modal-input-wrap">
            <span className="modal-input-icon">
              👤
            </span>

            <input
              className="modal-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
            />
          </div>

          <label className="modal-label">
            Preferred Name (Optional)
          </label>

          <div className="modal-input-wrap">
            <span className="modal-input-icon">
              👤
            </span>

            <input
              className="modal-input"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="Johnny"
            />
          </div>

          <label className="modal-label">
            Email
          </label>

          <div className="modal-input-wrap">
            <span className="modal-input-icon">
              ✉
            </span>

            <input
              className="modal-input"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
            />
          </div>

          <label className="modal-label">
            Phone Number
          </label>

          <div className="modal-input-wrap">
            <span className="modal-input-icon">
              📞
            </span>

            <input
              className="modal-input"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+61..."
            />
          </div>

          <label className="modal-label">
            New Password (optional)
          </label>

          <div className="modal-input-wrap">
            <span className="modal-input-icon">
              🔒
            </span>

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
          <button
            className="modal-cancel-btn"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className="modal-save-btn"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Update Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Send Mail Modal
// ─────────────────────────────────────────────────────────────

function SendMailModal({
  student,
  onClose,
}) {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendMail = async () => {
    if (!link.trim()) {
      setError(
        "Please enter a manual link."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_URL}/api/send-mail`,
        {
          method: "POST",
          headers: authHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            studentId:
              student._id || student.id,
            courseLink: link,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to send email"
        );
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
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              Send Manual Link
            </h2>

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
              onChange={(e) =>
                setLink(e.target.value)
              }
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
            {loading
              ? "Sending..."
              : "Send Mail"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Delete Modal
// ─────────────────────────────────────────────────────────────

function DeleteModal({
  student,
  onClose,
  onConfirm,
}) {
  const [deleting, setDeleting] =
    useState(false);

  const handleDelete = async () => {
    if (!student) return;

    setDeleting(true);

    try {
      await onConfirm(student.flowId);
    } finally {
      setDeleting(false);
    }
  };

  if (!student) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-box modal-box-sm"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="modal-header">
          <h2 className="modal-title">
            Delete Student Account?
          </h2>

          <button
            className="modal-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-delete-body">
          <p>
            <strong>Name:</strong>{" "}
            {student.name}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {student.email}
          </p>

          <p className="modal-delete-warning">
            This will remove the student and
            all related records. This action
            cannot be undone.
          </p>
        </div>

        <div className="modal-actions">
          <button
            className="modal-cancel-btn"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            className="modal-delete-confirm-btn"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Course Variants
// ─────────────────────────────────────────────────────────────

const getCourseVariants = (course) => {
  if (!course) return [];

  const pricingType =
    course.pricingType ||
    (course.experienceBasedBooking
      ? "experience"
      : "standard");

  if (pricingType === "experience") {
    return [
      {
        variant: "with-experience",
        label: "With Experience",
        price: Number(
          course.withExperiencePrice || 0
        ),
      },
      {
        variant: "without-experience",
        label: "Without Experience",
        price: Number(
          course.withoutExperiencePrice || 0
        ),
      },
    ];
  }

  if (pricingType === "slbl") {
    return [
      {
        variant: "sl",
        label: "Single License",
        price: Number(
          course.slSinglePrice || 0
        ),
      },
      {
        variant: "slbl",
        label: "Both Licenses (SL + BL)",
        price: Number(
          course.slblPrice || 0
        ),
      },
    ];
  }

  return [
    {
      variant: null,
      label: null,
      price: Number(
        course.sellingPrice || 0
      ),
    },
  ];
};

// ─────────────────────────────────────────────────────────────
// Add Student Modal
// ─────────────────────────────────────────────────────────────

function AddStudentModal({
  onClose,
  onSave,
}) {
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

  const [paymentSlip, setPaymentSlip] =
    useState(null);

  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loadingSessions, setLoadingSessions] =
    useState(false);

  const [courseOpen, setCourseOpen] =
    useState(false);

  const dropdownRef = useRef(null);

  const [selectedDate, setSelectedDate] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState(null);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/courses`
        );

        if (!res.ok) return;

        const data = await res.json();

        setCourses(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Failed to fetch courses:",
          err
        );
      }
    };

    fetchCourses();
  }, []);

  // Click outside dropdown
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          e.target
        )
      ) {
        setCourseOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handler
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handler
      );
    };
  }, []);

  // Fetch sessions
  const fetchSessions = async (
    courseId
  ) => {
    setForm((prev) => ({
      ...prev,
      sessionId: "",
    }));

    setSelectedDate(null);

    if (!courseId) {
      setSessions([]);
      return;
    }

    setLoadingSessions(true);

    try {
      const res = await fetch(
        `${API_URL}/api/schedules/course/${courseId}`
      );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch sessions"
        );
      }

      const data = await res.json();

      const allSessions =
        Array.isArray(data)
          ? data.flatMap((slot) =>
              Array.isArray(
                slot.sessions
              )
                ? slot.sessions.map(
                    (s) => ({
                      ...s,
                      date: slot.date,
                    })
                  )
                : []
            )
          : [];

      setSessions(allSessions);
    } catch (err) {
      console.error(
        "Failed to fetch sessions:",
        err
      );

      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleCourseSelect = (
    courseId
  ) => {
    setForm((prev) => ({
      ...prev,
      courseId,
      sessionId: "",
    }));

    setCourseOpen(false);

    fetchSessions(courseId);
  };

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setPaymentSlip(
      e.target.files?.[0] || null
    );
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.courseId ||
      !form.sessionId
    ) {
      setError(
        "Name, email, password, course, and session are required."
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(
        ([key, value]) => {
          formData.append(key, value);
        }
      );

      if (paymentSlip) {
        formData.append(
          "paymentSlip",
          paymentSlip
        );
      }

      const res = await fetch(
        `${API_URL}/api/students`,
        {
          method: "POST",
          headers: authHeaders(),
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to add student"
        );
      }

      const newStudent =
        await res.json();

      onSave(newStudent);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-box"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              Add New Student
            </h2>

            <p className="modal-subtitle">
              Create a new student account
            </p>
          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        <div className="modal-form">
          {/* Name */}
          <label className="modal-label">
            Full Name *
          </label>

          <div className="modal-input-wrap">
            <span className="modal-input-icon">
              👤
            </span>

            <input
              className="modal-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
            />
          </div>

          {/* Nickname */}
          <label className="modal-label">
            Preferred Name (Optional)
          </label>

          <div className="modal-input-wrap">
            <span className="modal-input-icon">
              👤
            </span>

            <input
              className="modal-input"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="Johnny"
            />
          </div>

          {/* Email */}
          <label className="modal-label">
            Email *
          </label>

          <div className="modal-input-wrap">
            <span className="modal-input-icon">
              ✉
            </span>

            <input
              className="modal-input"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
            />
          </div>

          {/* Phone */}
          <label className="modal-label">
            Phone Number
          </label>

          <div className="modal-input-wrap">
            <span className="modal-input-icon">
              📞
            </span>

            <input
              className="modal-input"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+61..."
            />
          </div>

          {/* Password */}
          <label className="modal-label">
            Password *
          </label>

          <div className="modal-input-wrap">
            <span className="modal-input-icon">
              🔒
            </span>

            <input
              className="modal-input"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Set a password"
            />
          </div>

          {/* Course */}
          <label className="modal-label">
            Select Course *
          </label>

          <div
            className="modal-input-wrap"
            ref={dropdownRef}
          >
            <span className="modal-input-icon">
              📖
            </span>

            <div
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <div
                style={{
                  padding: "10px 12px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  fontSize: "14px",
                  minHeight: "42px",
                }}
                onClick={() =>
                  setCourseOpen(
                    (prev) => !prev
                  )
                }
              >
                <span
                  style={{
                    color: form.courseId
                      ? "#334155"
                      : "#94a3b8",
                  }}
                >
                  {form.courseId
                    ? (() => {
                        const c =
                          courses.find(
                            (course) =>
                              course._id ===
                              form.courseId
                          );

                        return c
                          ? `${c.title} - $${c.sellingPrice || 0}`
                          : "Select a course";
                      })()
                    : "Select a course"}
                </span>

                <span
                  style={{
                    fontSize: "10px",
                    color:
                      colors.slate500,
                  }}
                >
                  {courseOpen
                    ? "▲"
                    : "▼"}
                </span>
              </div>

              {courseOpen && (
                <div
                  style={{
                    position:
                      "absolute",
                    top:
                      "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    background:
                      "#fff",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      "12px",
                    maxHeight:
                      "350px",
                    overflowY:
                      "auto",
                    zIndex: 9999,
                    boxShadow:
                      "0 10px 25px -5px rgba(0,0,0,.1)",
                  }}
                >
                  {Object.entries(
                    courses.reduce(
                      (acc, course) => {
                        const category =
                          course.category &&
                          typeof course.category ===
                            "object"
                            ? course.category
                                .name
                            : course.category;

                        const cat =
                          category ||
                          "Other Courses";

                        if (!acc[cat]) {
                          acc[cat] = [];
                        }

                        acc[cat].push(
                          course
                        );

                        return acc;
                      },
                      {}
                    )
                  ).map(
                    ([
                      category,
                      categoryCourses,
                    ]) => (
                      <div
                        key={category}
                      >
                        <div
                          style={{
                            background:
                              "#e0f2fe",
                            color:
                              colors.brandPrimary,
                            fontWeight:
                              "700",
                            padding:
                              "10px 15px",
                            fontSize:
                              "11px",
                            textTransform:
                              "uppercase",
                          }}
                        >
                          {category}
                        </div>

                        {categoryCourses.flatMap(
                          (course) => {
                            const variants =
                              getCourseVariants(
                                course
                              );

                            return variants.map(
                              (variant) => (
                                <div
                                  key={`${course._id}-${variant.variant}`}
                                  style={{
                                    padding:
                                      "12px 15px",
                                    cursor:
                                      "pointer",
                                    fontSize:
                                      "13px",
                                    color:
                                      "#334155",
                                    borderBottom:
                                      "1px solid #f1f5f9",
                                  }}
                                  onClick={() =>
                                    handleCourseSelect(
                                      course._id
                                    )
                                  }
                                >
                                  {course.courseCode}{" "}
                                  -{" "}
                                  {course.title}{" "}
                                  {variant.label
                                    ? `(${variant.label})`
                                    : ""}{" "}
                                  - $
                                  {
                                    variant.price
                                  }
                                </div>
                              )
                            );
                          }
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sessions */}
          {form.courseId && (
            <div
              style={{
                marginTop: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#1e293b",
                  marginBottom:
                    "12px",
                }}
              >
                Select date for{" "}
                {
                  courses.find(
                    (c) =>
                      c._id ===
                      form.courseId
                  )?.title
                }
              </h3>

              {selectedDate && (
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    cursor: "pointer",
                    marginBottom:
                      "10px",
                  }}
                  onClick={() => {
                    setSelectedDate(null);

                    setForm(
                      (prev) => ({
                        ...prev,
                        sessionId:
                          "",
                      })
                    );
                  }}
                >
                  ✕ Clear
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  paddingBottom:
                    "10px",
                  marginBottom:
                    "15px",
                }}
              >
                {loadingSessions ? (
                  <p
                    style={{
                      fontSize:
                        "13px",
                      color:
                        colors.slate500,
                    }}
                  >
                    ⏳ Loading sessions...
                  </p>
                ) : sessions.length >
                  0 ? (
                  Object.entries(
                    sessions.reduce(
                      (acc, session) => {
                        if (
                          !acc[
                            session.date
                          ]
                        ) {
                          acc[
                            session.date
                          ] = [];
                        }

                        acc[
                          session.date
                        ].push(
                          session
                        );

                        return acc;
                      },
                      {}
                    )
                  ).map(
                    ([
                      date,
                      dateSessions,
                    ]) => {
                      const d =
                        new Date(
                          date
                        );

                      const isActive =
                        selectedDate ===
                        date;

                      return (
                        <div
                          key={date}
                          style={{
                            minWidth:
                              "80px",
                            padding:
                              "10px",
                            border:
                              `1px solid ${
                                isActive
                                  ? colors.brandPrimary
                                  : "#e2e8f0"
                              }`,
                            borderRadius:
                              "12px",
                            cursor:
                              "pointer",
                            textAlign:
                              "center",
                            background:
                              isActive
                                ? "#f5f3ff"
                                : "#fff",
                          }}
                          onClick={() =>
                            setSelectedDate(
                              date
                            )
                          }
                        >
                          <div
                            style={{
                              fontSize:
                                "11px",
                              fontWeight:
                                "600",
                              textTransform:
                                "uppercase",
                            }}
                          >
                            {d.toLocaleDateString(
                              "en-AU",
                              {
                                weekday:
                                  "short",
                              }
                            )}
                          </div>

                          <div
                            style={{
                              fontSize:
                                "14px",
                              fontWeight:
                                "700",
                              margin:
                                "2px 0",
                            }}
                          >
                            {d.getDate()}{" "}
                            {d.toLocaleDateString(
                              "en-AU",
                              {
                                month:
                                  "short",
                              }
                            )}
                          </div>

                          <div
                            style={{
                              fontSize:
                                "10px",
                              color:
                                "#64748b",
                            }}
                          >
                            {
                              dateSessions.length
                            }{" "}
                            session
                            {dateSessions.length >
                            1
                              ? "s"
                              : ""}
                          </div>
                        </div>
                      );
                    }
                  )
                ) : (
                  <p
                    style={{
                      fontSize:
                        "13px",
                      color:
                        "#ef4444",
                    }}
                  >
                    ❌ No upcoming
                    sessions
                    available.
                  </p>
                )}
              </div>

              {selectedDate && (
                <>
                  <h3
                    style={{
                      fontSize:
                        "13px",
                      color:
                        colors.slate500,
                      marginBottom:
                        "10px",
                    }}
                  >
                    Sessions on{" "}
                    {new Date(
                      selectedDate
                    ).toLocaleDateString(
                      "en-AU",
                      {
                        weekday:
                          "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </h3>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr",
                      gap: "10px",
                    }}
                  >
                    {sessions
                      .filter(
                        (session) =>
                          session.date ===
                          selectedDate
                      )
                      .map(
                        (session) => {
                          const active =
                            form.sessionId ===
                            session._id;

                          const available =
                            Math.max(
                              0,
                              Number(
                                session.maxStudents ||
                                  0
                              ) -
                                Number(
                                  session.enrolledCount ||
                                    0
                                )
                            );

                          return (
                            <div
                              key={
                                session._id
                              }
                              style={{
                                padding:
                                  "15px",
                                border:
                                  `1px solid ${
                                    active
                                      ? colors.brandPrimary
                                      : "#e2e8f0"
                                  }`,
                                borderRadius:
                                  "12px",
                                cursor:
                                  "pointer",
                                background:
                                  active
                                    ? "#f5f3ff"
                                    : "#fff",
                              }}
                              onClick={() =>
                                setForm(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    sessionId:
                                      session._id,
                                  })
                                )
                              }
                            >
                              <div
                                style={{
                                  fontWeight:
                                    "600",
                                  color:
                                    "#334155",
                                }}
                              >
                                🕒{" "}
                                {
                                  session.startTime
                                }{" "}
                                -{" "}
                                {
                                  session.endTime
                                }
                              </div>

                              <div
                                style={{
                                  fontSize:
                                    "12px",
                                  color:
                                    colors.brandPrimary,
                                  fontWeight:
                                    "500",
                                  marginTop:
                                    "5px",
                                }}
                              >
                                {available}{" "}
                                slots
                                available
                              </div>
                            </div>
                          );
                        }
                      )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Payment Method */}
          <label className="modal-label">
            Payment Method *
          </label>

          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "10px",
              padding: "10px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="Bank Transfer"
                checked={
                  form.paymentMethod ===
                  "Bank Transfer"
                }
                onChange={
                  handleChange
                }
              />

              Bank Transfer
            </label>

            <label
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="Pay Later"
                checked={
                  form.paymentMethod ===
                  "Pay Later"
                }
                onChange={
                  handleChange
                }
              />

              Pay Later
            </label>
          </div>

          {/* Receipt */}
          <div
            style={{
              marginTop: "15px",
            }}
          >
            <label className="modal-label">
              Payment Receipt
              (Optional)
            </label>

            <div
              style={{
                marginTop: "8px",
                border:
                  "2px dashed #cbd5e1",
                borderRadius: "8px",
                padding: "10px",
                textAlign:
                  "center",
                background:
                  colors.slate50,
              }}
            >
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={
                  handleFileChange
                }
                style={{
                  fontSize:
                    "12px",
                }}
              />

              <p
                style={{
                  fontSize:
                    "10px",
                  color:
                    colors.slate500,
                  marginTop:
                    "5px",
                }}
              >
                Upload proof of
                bank transfer or
                receipt
              </p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="modal-cancel-btn"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            className="modal-save-btn"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving
              ? "Adding..."
              : "Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Students Component
// ─────────────────────────────────────────────────────────────

export default function Students() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const navigate = useNavigate();

  // Data
  const [students, setStudents] =
    useState([]);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  // Search
  const [search, setSearch] =
    useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  // Filters
  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [cityFilter, setCityFilter] =
    useState("All Cities");

  // ─────────────────────────────────────
  // Current page
  // ─────────────────────────────────────

  const currentPage = Math.max(
    1,
    parseInt(
      searchParams.get("page") || "1",
      10
    ) || 1
  );

  // ─────────────────────────────────────
  // Set page
  // ─────────────────────────────────────

  const setCurrentPage = (page) => {
    const nextPage =
      typeof page === "function"
        ? page(currentPage)
        : page;

    const safePage = Math.max(
      1,
      Math.min(
        Number(nextPage) || 1,
        totalPages || 1
      )
    );

    setSearchParams(
      (prev) => {
        const next =
          new URLSearchParams(prev);

        next.set(
          "page",
          String(safePage)
        );

        return next;
      },
      {
        replace: true,
      }
    );
  };

  // ─────────────────────────────────────
  // Modal states
  // ─────────────────────────────────────

  const [viewStudent, setViewStudent] =
    useState(null);

  const [editStudent, setEditStudent] =
    useState(null);

  const [deleteStudent, setDeleteStudent] =
    useState(null);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [mailStudent, setMailStudent] =
    useState(null);

  // Multiple selection
  const [
    selectedStudents,
    setSelectedStudents,
  ] = useState([]);

  const [
    showSendModal,
    setShowSendModal,
  ] = useState(false);

  const [sendType, setSendType] =
    useState("email");

  const [
    showEmailModal,
    setShowEmailModal,
  ] = useState(false);

  const [
    showWhatsappModal,
    setShowWhatsappModal,
  ] = useState(false);

  const [courseLink, setCourseLink] =
    useState("");

  // ─────────────────────────────────────
  // Search debounce
  // ─────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(
        search.trim()
      );
    }, 300);

    return () =>
      clearTimeout(timer);
  }, [search]);

  // ─────────────────────────────────────
  // Fetch students
  // ─────────────────────────────────────

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params =
        new URLSearchParams();

      params.set(
        "page",
        String(currentPage)
      );

      params.set(
        "limit",
        String(ITEMS_PER_PAGE)
      );

      if (debouncedSearch.trim()) {
        params.set(
          "search",
          debouncedSearch.trim()
        );
      }

      if (
        cityFilter !==
        "All Cities"
      ) {
        params.set(
          "preferredCity",
          cityFilter
        );
      }

      if (
        statusFilter !==
        "All Status"
      ) {
        params.set(
          "status",
          statusFilter
        );
      }

      const url =
        `${API_URL}/api/students?${params.toString()}`;

      console.log(
        "Fetching students:",
        url
      );

      const res = await fetch(url, {
        headers: authHeaders(),
      });

      if (!res.ok) {
        throw new Error(
          "Failed to fetch students"
        );
      }

      const result =
        await res.json();

      console.log(
        "Students API response:",
        result
      );

      const data =
        Array.isArray(result.data)
          ? result.data
          : [];

      const totalCount =
        Number(result.total) || 0;

      const calculatedPages =
        Math.ceil(
          totalCount /
            ITEMS_PER_PAGE
        );

      const serverTotalPages =
        Number(
          result.totalPages
        ) || calculatedPages;

      setStudents(data);

      setTotal(totalCount);

      setTotalPages(
        Math.max(
          1,
          serverTotalPages
        )
      );
    } catch (err) {
      console.error(
        "fetchStudents error:",
        err
      );

      setError(err.message);

      setStudents([]);

      setTotal(0);

      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────
  // Fetch whenever page/filter changes
  // ─────────────────────────────────────

  useEffect(() => {
    fetchStudents();
  }, [
    currentPage,
    debouncedSearch,
    cityFilter,
    statusFilter,
  ]);

  // ─────────────────────────────────────
  // Search now
  // ─────────────────────────────────────

  const applySearchNow = () => {
    setDebouncedSearch(
      search.trim()
    );

    setCurrentPage(1);
  };

  // ─────────────────────────────────────
  // Keep view modal updated
  // ─────────────────────────────────────

  useEffect(() => {
    if (!viewStudent) return;

    const updated =
      students.find(
        (student) =>
          student.flowId ===
          viewStudent.flowId
      );

    if (updated) {
      setViewStudent(updated);
    }
  }, [students]);

  // ─────────────────────────────────────
  // Edit save
  // ─────────────────────────────────────

  const handleEditSave = (
    updated
  ) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.flowId ===
        updated.flowId
          ? {
              ...student,
              ...updated,
            }
          : student
      )
    );

    setEditStudent(null);

    fetchStudents();
  };

  // ─────────────────────────────────────
  // Toggle status
  // ─────────────────────────────────────

  const handleToggleStatus =
    async (student) => {
      const newStatus =
        student.status === "Active"
          ? "Inactive"
          : "Active";

      try {
        const res = await fetch(
          `${API_URL}/api/students/${student.flowId}/status`,
          {
            method: "PATCH",
            headers: authHeaders({
              "Content-Type":
                "application/json",
            }),
            body: JSON.stringify({
              status:
                newStatus,
            }),
          }
        );

        if (!res.ok) {
          throw new Error(
            "Failed to update status"
          );
        }

        const updated =
          await res.json();

        setStudents((prev) =>
          prev.map(
            (studentItem) =>
              studentItem.flowId ===
              student.flowId
                ? {
                    ...studentItem,
                    status:
                      updated.status ||
                      newStatus,
                  }
                : studentItem
          )
        );

        // Refresh server pagination
        fetchStudents();
      } catch (err) {
        alert(
          "Error: " + err.message
        );
      }
    };

  // ─────────────────────────────────────
  // Delete
  // ─────────────────────────────────────

  const handleDeleteConfirm =
    async (flowId) => {
      try {
        const res = await fetch(
          `${API_URL}/api/students/${flowId}`,
          {
            method: "DELETE",
            headers: authHeaders(),
          }
        );

        if (!res.ok) {
          throw new Error(
            "Failed to delete student"
          );
        }

        // Remove from current page
        setStudents((prev) =>
          prev.filter(
            (student) =>
              student.flowId !==
              flowId
          )
        );

        // Remove from selected
        setSelectedStudents(
          (prev) =>
            prev.filter(
              (student) =>
                student.flowId !==
                flowId
            )
        );

        setDeleteStudent(null);

        // Refresh pagination
        fetchStudents();
      } catch (err) {
        alert(
          "Error: " + err.message
        );
      }
    };

  // ─────────────────────────────────────
  // Add student
  // ─────────────────────────────────────

  const handleAddSave = (
    newStudent
  ) => {
    setShowAddModal(false);

    // Go to first page and refresh
    setCurrentPage(1);

    // The effect will refresh after page changes.
    if (currentPage === 1) {
      fetchStudents();
    }
  };

  // ─────────────────────────────────────
  // Select / unselect student
  // ─────────────────────────────────────

  const handleStudentSelection =
    (student, checked) => {
      setSelectedStudents(
        (prev) => {
          if (checked) {
            const exists =
              prev.some(
                (item) =>
                  item.flowId ===
                  student.flowId
              );

            if (exists) {
              return prev;
            }

            return [
              ...prev,
              student,
            ];
          }

          return prev.filter(
            (item) =>
              item.flowId !==
              student.flowId
          );
        }
      );
    };

  // ─────────────────────────────────────
  // Render
  // ─────────────────────────────────────

  return (
    <div className="sm-page">

      {/* Header */}
      <div className="sm-section-header">
        <div className="sm-page-header">
          <h1 className="sm-page-title">
            Student Management
          </h1>

          <p className="sm-page-subtitle">
            Manage all registered students
          </p>
        </div>

        <button
          className="sm-add-btn"
          onClick={() =>
            setShowAddModal(true)
          }
        >
          <span className="sm-add-btn-icon">
            +
          </span>

          Add New Student
        </button>
      </div>

      {/* Search / Filters */}
      <div className="sm-card sm-search-card">
        <h3 className="sm-card-title">
          Search &amp; Filter
        </h3>

        <p className="sm-card-subtitle">
          Find students by name,
          email, or status
        </p>

        <div className="sm-search-row">

          <div className="sm-search-input-wrap">
            <span className="sm-search-icon">
              🔍
            </span>

            <input
              className="sm-search-input"
              type="text"
              placeholder="Search students by name or email..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key ===
                  "Enter"
                ) {
                  applySearchNow();
                }
              }}
            />
          </div>

          {/* City */}
          <select
            className="sm-status-select"
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(
                e.target.value
              );

              setCurrentPage(1);
            }}
          >
            <option value="All Cities">
              All Cities
            </option>

            <option value="Sydney">
              Sydney
            </option>

            <option value="Adelaide">
              Adelaide
            </option>
          </select>

          {/* Status */}
          <select
            className="sm-status-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(
                e.target.value
              );

              setCurrentPage(1);
            }}
          >
            <option value="All Status">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>

          <button
            className="sm-search-btn"
            type="button"
            onClick={
              applySearchNow
            }
          >
            🔍 Search
          </button>
        </div>
      </div>

      {/* Selected count */}
      <div
        style={{
          marginBottom: "10px",
          fontWeight: "bold",
        }}
      >
        Selected Students:{" "}
        {selectedStudents.length}
      </div>

      {/* Table Card */}
      <div className="sm-card sm-table-card">

        <div className="sm-table-header">
          <h3 className="sm-card-title">
            Student Accounts ({total})
          </h3>

          <p className="sm-card-subtitle">
            Manage all student registrations
            and access
          </p>
        </div>

        {/* Send selected */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <div
            style={{
              fontWeight: "600",
            }}
          >
            Selected Students:{" "}
            {selectedStudents.length}
          </div>

          <button
            className="sm-add-btn"
            onClick={() => {
              if (
                selectedStudents.length ===
                0
              ) {
                alert(
                  "Please choose at least one user."
                );

                return;
              }

              setShowSendModal(true);
            }}
          >
            📤 Send
          </button>
        </div>

        {error && (
          <p className="sm-error">
            Error: {error}
          </p>
        )}

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
            }}
          >
            Loading students...
          </div>
        )}

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
                  <th>Preferred City</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>
                    Course schedule date
                  </th>
                  <th>LLN Status</th>
                  <th>
                    Enrollment Form
                  </th>
                  <th>
                    Payment Method
                  </th>
                  <th>
                    Payment status
                  </th>
                  <th>
                    Bank Transfer ID
                  </th>
                  <th>
                    Gateway Transaction ID
                  </th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {students.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={19}
                      style={{
                        textAlign:
                          "center",
                        padding:
                          "2rem",
                        color:
                          colors.textIcon,
                      }}
                    >
                      No students found.
                    </td>
                  </tr>
                ) : (
                  students.map(
                    (s) => (
                      <tr
                        key={
                          s.flowId
                        }
                      >

                        {/* Select */}
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedStudents.some(
                              (
                                student
                              ) =>
                                student.flowId ===
                                s.flowId
                            )}
                            onChange={(
                              e
                            ) =>
                              handleStudentSelection(
                                s,
                                e
                                  .target
                                  .checked
                              )
                            }
                          />
                        </td>

                        {/* Register date */}
                        <td>
                          <div className="sm-date">
                            {s.registerDate ||
                              "—"}
                          </div>

                          <div className="sm-time">
                            {s.registerTime ||
                              ""}
                          </div>
                        </td>

                        {/* Booking ID */}
                        <td className="sm-booking-id">
                          <div
                            className="sm-date"
                            style={{
                              fontWeight:
                                "600",
                              color:
                                colors.brandPrimary,
                            }}
                          >
                            {s.bookingId ||
                              "—"}
                          </div>
                        </td>

                        {/* Name */}
                        <td>
                          <div className="sm-student-cell">

                            <div className="sm-avatar">
                              <span className="sm-avatar-icon">
                                🎓
                              </span>
                            </div>

                            <div>
                              <div className="sm-student-name">
                                {s.name}
                              </div>

                              {s.nickname && (
                                <div className="sm-student-nick">
                                  (
                                  {
                                    s.nickname
                                  }
                                  )
                                </div>
                              )}
                            </div>

                          </div>
                        </td>

                        {/* Type */}
                        <td>
                          <div>
                            {s.type ||
                              "—"}
                          </div>

                          {s.type ===
                            "Company" &&
                            s.companyName && (
                              <div
                                style={{
                                  fontSize:
                                    "0.75rem",
                                  fontWeight:
                                    600,
                                  color:
                                    "#0066cc",
                                }}
                              >
                                {
                                  s.companyName
                                }
                              </div>
                            )}

                          {s.type ===
                            "Agent" && (
                              <div
                                style={{
                                  fontSize:
                                    "0.75rem",
                                  fontWeight:
                                    600,
                                  color:
                                    colors.brandPrimary,
                                }}
                              >
                                {s.agentName ||
                                  "Agent"}
                              </div>
                            )}

                          {s.linkName && (
                            <div
                              style={{
                                fontSize:
                                  "0.75rem",
                                fontWeight:
                                  600,
                                color:
                                  "#059669",
                              }}
                            >
                              {
                                s.linkName
                              }
                            </div>
                          )}
                        </td>

                        {/* Email */}
                        <td className="sm-email">
                          {s.email ||
                            "—"}
                        </td>

                        {/* City */}
                        <td>
                          {s.preferredCity ||
                            "—"}
                        </td>

                        {/* Phone */}
                        <td>
                          {s.phone ||
                            "—"}
                        </td>

                        {/* Course */}
                        <td className="sm-course">
                          <div
                            style={{
                              fontWeight:
                                500,
                            }}
                          >
                            {s.courseTitle ||
                              "—"}
                          </div>

                          <div
                            style={{
                              fontSize:
                                "0.75rem",
                              color:
                                colors.textIcon,
                            }}
                          >
                            {s.courseCategory ||
                              ""}
                          </div>
                        </td>

                        {/* Course date */}
                        <td>
                          {s.courseBookingDate ||
                            "—"}
                        </td>

                        {/* LLN */}
                        <td>
                          <div className="sm-status-cell">
                            <StatusBadge
                              status={
                                s.llndStatus
                              }
                            />

                            <button
                              className="sm-icon-btn"
                              title="View LLN"
                              onClick={() =>
                                navigate(
                                  `/admin/llnd-results?studentId=${s.flowId}&openModal=true`
                                )
                              }
                            >
                              👁
                            </button>
                          </div>
                        </td>

                        {/* Enrollment */}
                        <td>
                          <div className="sm-status-cell">
                            <StatusBadge
                              status={
                                s.enrollmentForm
                              }
                            />

                            <button
                              className="sm-icon-btn"
                              title="View Enrollment"
                              onClick={() =>
                                navigate(
                                  `/admin/enrollment-forms?studentEmail=${encodeURIComponent(
                                    s.email || ""
                                  )}&openModal=true`
                                )
                              }
                            >
                              👁
                            </button>
                          </div>
                        </td>

                        {/* Payment method */}
                        <td>
                          <PaymentBadge
                            status={
                              s.paymentMethod
                            }
                          />
                        </td>

                        {/* Payment status */}
                        <td>
                          <PaymentBadge
                            status={
                              s.paymentStatus
                            }
                          />
                        </td>

                        {/* Bank transfer */}
                        <td>
                          <div
                            style={{
                              fontFamily:
                                "'Courier New', Courier, monospace",
                              fontSize:
                                "12px",
                              fontWeight:
                                "600",
                              color:
                                "#4b5563",
                            }}
                          >
                            {s.paymentMethod ===
                              "Bank Transfer" ||
                            s.paymentMethod ===
                              "Manual"
                              ? s.transactionId ||
                                "—"
                              : "-"}
                          </div>
                        </td>

                        {/* Gateway */}
                        <td>
                          <div
                            style={{
                              fontFamily:
                                "'Courier New', Courier, monospace",
                              fontSize:
                                "12px",
                              fontWeight:
                                "600",
                              color:
                                colors.brandPrimary,
                            }}
                          >
                            {s.gatewayTransactionId &&
                            s.gatewayTransactionId !==
                              "—"
                              ? s.gatewayTransactionId
                              : s.paymentMethod ===
                                "Card Payment"
                              ? "—"
                              : "-"}
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <ActiveBadge
                            status={
                              s.status
                            }
                          />
                        </td>

                        {/* Last login */}
                        <td>
                          {s.lastLogin ||
                            "Never"}
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="sm-actions">

                            {/* View */}
                            <button
                              className="sm-icon-btn"
                              title="View"
                              onClick={() =>
                                setViewStudent(
                                  s
                                )
                              }
                            >
                              👁
                            </button>

                            {/* Edit */}
                            <button
                              className="sm-icon-btn"
                              title="Edit"
                              onClick={() =>
                                setEditStudent(
                                  s
                                )
                              }
                            >
                              ✏️
                            </button>

                            {/* Toggle */}
                            <button
                              className={
                                s.status ===
                                "Active"
                                  ? "sm-deactivate-btn"
                                  : "sm-activate-btn"
                              }
                              onClick={() =>
                                handleToggleStatus(
                                  s
                                )
                              }
                            >
                              {s.status ===
                              "Active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            {/* Delete */}
                            <button
                              className="sm-icon-btn sm-delete-btn"
                              title="Delete"
                              onClick={() =>
                                setDeleteStudent(
                                  s
                                )
                              }
                            >
                              🗑
                            </button>

                            {/* Mail */}
                            <button
                              className="sm-icon-btn"
                              title="Send Mail"
                              onClick={() =>
                                setMailStudent(
                                  s
                                )
                              }
                            >
                              📧
                            </button>

                          </div>
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>
            </table>
          </div>
        )}

        {/* ───────────────────────────────────── */}
        {/* Pagination */}
        {/* ───────────────────────────────────── */}

        {!loading &&
          !error &&
          total > 0 && (
            <div className="sm-pagination">

              <span className="sm-pagination-info">
                Showing{" "}
                {(currentPage - 1) *
                  ITEMS_PER_PAGE +
                  1}{" "}
                to{" "}
                {Math.min(
                  currentPage *
                    ITEMS_PER_PAGE,
                  total
                )}{" "}
                of{" "}
                {total} results
              </span>

              <div className="sm-pagination-controls">

                <button
                  type="button"
                  className="sm-page-btn"
                  onClick={() =>
                    setCurrentPage(
                      currentPage - 1
                    )
                  }
                  disabled={
                    currentPage <=
                      1 ||
                    loading
                  }
                >
                  Previous
                </button>

                <span className="sm-page-indicator">
                  Page{" "}
                  {currentPage}{" "}
                  of{" "}
                  {totalPages}
                </span>

                <button
                  type="button"
                  className="sm-page-btn"
                  onClick={() =>
                    setCurrentPage(
                      currentPage + 1
                    )
                  }
                  disabled={
                    currentPage >=
                      totalPages ||
                    loading
                  }
                >
                  Next
                </button>

              </div>
            </div>
          )}
      </div>

      {/* ───────────────────────────────────── */}
      {/* View Modal */}
      {/* ───────────────────────────────────── */}

      {viewStudent && (
        <ViewModal
          student={viewStudent}
          onClose={() =>
            setViewStudent(null)
          }
        />
      )}

      {/* Edit */}
      {editStudent && (
        <EditModal
          student={editStudent}
          onClose={() =>
            setEditStudent(null)
          }
          onSave={handleEditSave}
        />
      )}

      {/* Delete */}
      {deleteStudent && (
        <DeleteModal
          student={deleteStudent}
          onClose={() =>
            setDeleteStudent(null)
          }
          onConfirm={
            handleDeleteConfirm
          }
        />
      )}

      {/* Add */}
      {showAddModal && (
        <AddStudentModal
          onClose={() =>
            setShowAddModal(false)
          }
          onSave={handleAddSave}
        />
      )}

      {/* Single Mail */}
      {mailStudent && (
        <SendMailModal
          student={mailStudent}
          onClose={() =>
            setMailStudent(null)
          }
        />
      )}

      {/* ───────────────────────────────────── */}
      {/* Choose Sending Method */}
      {/* ───────────────────────────────────── */}

      {showSendModal && (
        <div className="modal-overlay">
          <div className="send-modal">

            <h2 className="send-heading">
              Choose Sending Method
            </h2>

            <p className="send-subtitle">
              Select how you want to
              send the course link.
            </p>

            <div
              className={`send-option ${
                sendType ===
                "email"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSendType("email")
              }
            >
              <div className="send-option-icon">
                📧
              </div>

              <div>
                <h4>
                  Send via Email
                </h4>

                <p>
                  Send course link
                  to{" "}
                  <b>
                    {
                      selectedStudents.length
                    }
                  </b>{" "}
                  selected student
                  {selectedStudents.length >
                  1
                    ? "s"
                    : ""}
                  .
                </p>
              </div>
            </div>

            <div
              className={`send-option ${
                sendType ===
                "whatsapp"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSendType(
                  "whatsapp"
                )
              }
            >
              <div className="send-option-icon">
                💬
              </div>

              <div>
                <h4>
                  Send via WhatsApp
                </h4>

                <p>
                  Share the course
                  link through
                  WhatsApp.
                </p>
              </div>
            </div>

            <div className="send-buttons">

              <button
                className="next-btn"
                onClick={() => {
                  setShowSendModal(
                    false
                  );

                  if (
                    sendType ===
                    "email"
                  ) {
                    setShowEmailModal(
                      true
                    );
                  } else {
                    setShowWhatsappModal(
                      true
                    );
                  }
                }}
              >
                Continue
              </button>

              <button
                className="cancel-btn"
                onClick={() =>
                  setShowSendModal(
                    false
                  )
                }
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────── */}
      {/* Multiple Email */}
      {/* ───────────────────────────────────── */}

      {showEmailModal && (
        <div className="modal-overlay">
          <div className="send-modal">

            <div className="send-modal-header">
              <h2>
                📧 Send Email
              </h2>

              <p>
                Send course link to{" "}
                <strong>
                  {
                    selectedStudents.length
                  }
                </strong>{" "}
                selected student
                {selectedStudents.length >
                1
                  ? "s"
                  : ""}
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
                onChange={(e) =>
                  setCourseLink(
                    e.target.value
                  )
                }
                placeholder="https://example.com/course-link"
              />

            </div>

            <div className="send-modal-footer">

              <button
                className="next-btn"
                onClick={async () => {
                  if (
                    selectedStudents.length ===
                    0
                  ) {
                    alert(
                      "Please select at least one student."
                    );
                    return;
                  }

                  if (
                    !courseLink.trim()
                  ) {
                    alert(
                      "Please enter course link."
                    );
                    return;
                  }

                  try {
                    const res =
                      await fetch(
                        `${API_URL}/api/send-mail/multiple`,
                        {
                          method:
                            "POST",
                          headers:
                            authHeaders(
                              {
                                "Content-Type":
                                  "application/json",
                              }
                            ),
                          body: JSON.stringify(
                            {
                              students:
                                selectedStudents,
                              courseLink,
                            }
                          ),
                        }
                      );

                    const data =
                      await res.json();

                    if (!res.ok) {
                      alert(
                        data.message ||
                          "Failed to send emails."
                      );

                      return;
                    }

                    alert(
                      "Emails sent successfully."
                    );

                    setShowEmailModal(
                      false
                    );

                    setCourseLink(
                      ""
                    );
                  } catch (err) {
                    console.error(
                      err
                    );

                    alert(
                      "Failed to send emails."
                    );
                  }
                }}
              >
                📤 Send Email
              </button>

              <button
                className="cancel-btn"
                onClick={() =>
                  setShowEmailModal(
                    false
                  )
                }
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────── */}
      {/* WhatsApp */}
      {/* ───────────────────────────────────── */}

      {showWhatsappModal && (
        <div className="modal-overlay">
          <div className="send-modal">

            <div className="send-modal-header">
              <h2>
                💬 Send via WhatsApp
              </h2>

              <p>
                Send course link to{" "}
                <strong>
                  {
                    selectedStudents.length
                  }
                </strong>{" "}
                selected student
                {selectedStudents.length >
                1
                  ? "s"
                  : ""}
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
                onChange={(e) =>
                  setCourseLink(
                    e.target.value
                  )
                }
                placeholder="https://example.com/course-link"
              />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop:
                    "15px",
                }}
              >

                <button
                  className="cancel-btn"
                  onClick={async () => {
                    if (
                      !courseLink.trim()
                    ) {
                      alert(
                        "Please enter course link."
                      );

                      return;
                    }

                    try {
                      await navigator.clipboard.writeText(
                        courseLink
                      );

                      alert(
                        "Course link copied!"
                      );
                    } catch (
                      error
                    ) {
                      alert(
                        "Failed to copy link."
                      );
                    }
                  }}
                >
                  📋 Copy Link
                </button>

                <button
                  className="next-btn"
                  onClick={() => {
                    if (
                      !courseLink.trim()
                    ) {
                      alert(
                        "Please enter course link."
                      );

                      return;
                    }

                    const message =
                      `Hello,\n\nPlease use the following course link:\n${courseLink}\n\nThank you.`;

                    const encodedMessage =
                      encodeURIComponent(
                        message
                      );

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
                  setShowWhatsappModal(
                    false
                  );

                  setCourseLink(
                    ""
                  );
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