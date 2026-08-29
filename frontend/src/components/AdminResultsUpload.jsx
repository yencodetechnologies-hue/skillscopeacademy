import { useState, useEffect } from "react";
import "../styles/AdminResultsUpload.css";
import { API_URL } from "../data/service";
const ITEMS_PER_PAGE = 10;

// ─── Badge helpers ────────────────────────────────────────────────────────────
function Badge({ type, label }) {
  const map = {
    completed:       "ru-badge ru-badge--completed",
    "not-completed": "ru-badge ru-badge--not-completed",
    active:          "ru-badge ru-badge--active",
    inactive:        "ru-badge ru-badge--inactive",
    paid:            "ru-badge ru-badge--paid",
    unpaid:          "ru-badge ru-badge--unpaid",
    verified:        "ru-badge ru-badge--verified",
    "not-verified":  "ru-badge ru-badge--not-verified",
  };
  return <span className={map[type] || "ru-badge"}>{label}</span>;
}

function statusBadge(val) {
  if (val === "Completed") return <Badge type="completed"     label="✓ Completed" />;
  return                          <Badge type="not-completed" label="⊘ Not Completed" />;
}
function activeBadge(val) {
  if (val === "Active") return <Badge type="active"   label="Active" />;
  return                       <Badge type="inactive" label="Inactive" />;
}
function paymentBadge(val) {
  if (val === "Paid")     return <Badge type="paid"         label="Paid" />;
  if (val === "Verified") return <Badge type="verified"     label="Verified" />;
  return                         <Badge type="not-verified" label={val || "—"} />;
}

// ─── Warning Modal ────────────────────────────────────────────────────────────
function WarningModal({ student, onClose }) {
  const llndOk  = student.llndStatus     === "Completed";
  const enrollOk = student.enrollmentForm === "Completed";
  return (
    <div className="ru-overlay" onClick={onClose}>
      <div className="ru-warn-modal" onClick={e => e.stopPropagation()}>
        <div className="ru-warn-top">
          <span className="ru-warn-icon">⚠️</span>
          <h2>Cannot Upload Result</h2>
          <p>{student.name} has incomplete prerequisites</p>
        </div>
        <div className="ru-warn-checks">
          <div className={`ru-warn-check-row ${llndOk ? "pass" : "fail"}`}>
            <span className="wc-icon">{llndOk ? "✅" : "❌"}</span>
            LLND Status — {llndOk ? "Completed" : "Not Completed"}
          </div>
          <div className={`ru-warn-check-row ${enrollOk ? "pass" : "fail"}`}>
            <span className="wc-icon">{enrollOk ? "✅" : "❌"}</span>
            Enrollment Form — {enrollOk ? "Completed" : "Not Completed"}
          </div>
        </div>
        <div className="ru-warn-footer">
          <button className="ru-warn-close-btn" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}

// ─── Upload Result Modal ──────────────────────────────────────────────────────
function UploadResultModal({ student, courses, onClose, onSaved }) {
  // Try to match course from courses list using every possible key
  const matchedCourse = courses.find(c =>
    (student.courseId    && (c._id === student.courseId || c.id === student.courseId)) ||
    (student.courseCode  && c.courseCode === student.courseCode) ||
    (student.courseTitle && c.title      === student.courseTitle)
  );

  const resolvedCourseId   = matchedCourse?._id       || matchedCourse?.id
                           || student.courseId         || student.course_id || "";
  const resolvedCourseName = matchedCourse?.title      || student.courseTitle || student.course || "";
  const resolvedCourseCode = matchedCourse?.courseCode || student.courseCode  || "";

  const defaultForm = {
    courseId:       resolvedCourseId,
    courseName:     resolvedCourseName,
    courseCode:     resolvedCourseCode,
    unitName:       resolvedCourseCode || resolvedCourseName,
    assessmentType: "Theory",
    score:          "",
    status:         "Competent",
    feedback:       "",
    attempts:       1,
    assessmentDate: "",
  };

  const [form, setForm]       = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [existingId, setExistingId] = useState(null); // _id if result already exists

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // On mount — fetch existing result for this student+course
  useEffect(() => {
    const studentId = student.id || student.flowId;
    if (!studentId) { setFetching(false); return; }

    const load = async () => {
      try {
        const res  = await fetch(`${API_URL}/api/results/student/${studentId}`);
        const data = await res.json();
        // Find result that matches this course
        const existing = Array.isArray(data)
          ? data.find(r =>
              r.courseId === resolvedCourseId ||
              r.courseCode === resolvedCourseCode ||
              r.courseName === resolvedCourseName
            )
          : null;

        if (existing) {
          setExistingId(existing._id);
          setForm({
            courseId:       existing.courseId       || resolvedCourseId,
            courseName:     existing.courseName     || resolvedCourseName,
            courseCode:     existing.courseCode     || resolvedCourseCode,
            unitName:       existing.unitName       || resolvedCourseCode || resolvedCourseName,
            assessmentType: existing.assessmentType || "Theory",
            score:          existing.score          ?? "",
            status:         existing.status         || "Competent",
            feedback:       existing.feedback       || "",
            attempts:       existing.attempts       || 1,
            assessmentDate: existing.assessmentDate
              ? new Date(existing.assessmentDate).toISOString().split("T")[0]
              : "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch existing result:", err);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!form.score) {
      alert("Score is required!");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, studentId: student.id || student.flowId };
      // PATCH if existing, POST if new
      const url    = existingId ? `${API_URL}/api/results/${existingId}` : `${API_URL}/api/results`;
      const method = existingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save result");
      // Close immediately — no setTimeout
      onSaved && onSaved();
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const courseLabel = resolvedCourseName
    ? `${resolvedCourseCode ? resolvedCourseCode + " — " : ""}${resolvedCourseName}`
    : "No course assigned";

  return (
    <div className="ru-overlay" onClick={onClose}>
      <div className="ru-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="ru-modal-header">
          <div>
            <h2>📋 Upload Student Result</h2>
            <p>Add assessment result for this student</p>
          </div>
          <button className="ru-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Student Info Bar */}
        <div className="ru-modal-student-bar">
          <div className="ru-avatar">{student.name?.charAt(0).toUpperCase()}</div>
          <div className="ru-modal-student-bar-info">
            <h4>{student.name}{student.nickname ? ` (${student.nickname})` : ""}</h4>
            <p>{student.email} • {student.phone || "—"}</p>
          </div>
        </div>

        {fetching && <div className="ru-fetching">Loading existing result...</div>}

        <div className="ru-modal-body">

          {/* Course — locked, auto-filled */}
          <div className="ru-field">
            <label className="ru-label">
              Course
              <span style={{ marginLeft: 6, fontSize: ".72rem", color: "#9ca3af", fontWeight: 400 }}>
                (auto-filled)
              </span>
            </label>
            <input
              className="ru-input ru-input--locked"
              value={courseLabel}
              readOnly
            />
          </div>

          {/* Course Code — locked, auto-filled */}
          <div className="ru-field">
            <label className="ru-label">
              Course Code
              <span style={{ marginLeft: 6, fontSize: ".72rem", color: "#9ca3af", fontWeight: 400 }}>
                (auto-filled)
              </span>
            </label>
            <input
              className="ru-input ru-input--locked"
              value={resolvedCourseCode || "—"}
              readOnly
            />
          </div>

          {/* Assessment Type / Score / Attempts */}
          <div className="ru-grid-3">
            <div className="ru-field">
              <label className="ru-label">Assessment Type</label>
              <select className="ru-mselect" value={form.assessmentType} onChange={e => set("assessmentType", e.target.value)}>
                <option>Theory</option>
                <option>Practical</option>
                <option>Exam</option>
              </select>
            </div>
            <div className="ru-field">
              <label className="ru-label">Score (%) <span className="ru-required">*</span></label>
              <input
                className="ru-input"
                type="number" min="0" max="100"
                placeholder="e.g. 85"
                value={form.score}
                onChange={e => set("score", e.target.value)}
              />
            </div>
            <div className="ru-field">
              <label className="ru-label">Attempts</label>
              <input
                className="ru-input"
                type="number" min="1"
                value={form.attempts}
                onChange={e => set("attempts", e.target.value)}
              />
            </div>
          </div>

          {/* Status / Date */}
          <div className="ru-grid-2">
            <div className="ru-field">
              <label className="ru-label">Status</label>
              <select className="ru-mselect" value={form.status} onChange={e => set("status", e.target.value)}>
                <option>Competent</option>
                <option>Not Yet Competent</option>
                <option>Pending</option>
              </select>
            </div>
            <div className="ru-field">
              <label className="ru-label">Assessment Date</label>
              <input
                className="ru-input"
                type="date"
                value={form.assessmentDate}
                onChange={e => set("assessmentDate", e.target.value)}
              />
            </div>
          </div>

          {/* Feedback */}
          <div className="ru-field">
            <label className="ru-label">Feedback</label>
            <textarea
              className="ru-textarea"
              placeholder="Trainer feedback..."
              value={form.feedback}
              onChange={e => set("feedback", e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="ru-modal-footer">
          <button className="ru-btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="ru-btn-save" onClick={handleSubmit} disabled={loading}>
{loading ? "Saving..." : existingId ? "Update Result" : "Save Result"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminResultsUpload() {
  const [students,     setStudents]     = useState([]);
  console.log("students",students);
  
  const [courses,      setCourses]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [uploadStudent, setUploadStudent] = useState(null);
  const [warnStudent,   setWarnStudent]   = useState(null);
  const [modalKey,      setModalKey]      = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
     const [sRes, cRes] = await Promise.all([
  fetch(`${API_URL}/api/students`),
  fetch(`${API_URL}/api/courses`),
]);

const studentsRes = await sRes.json();
const coursesRes = await cRes.json();

setStudents(studentsRes.data || []);
setCourses(coursesRes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (
      (s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)) &&
      (statusFilter === "All Status" || s.status === statusFilter)
    );
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleUploadClick = (student) => {
    const ok = student.llndStatus === "Completed" && student.enrollmentForm === "Completed";
    if (!ok) {
      setWarnStudent(student);
    } else {
      setModalKey(k => k + 1);   // increment key first → forces re-mount even for same student
      setUploadStudent(student);
    }
  };

  return (
    <div className="ru-page">
      <div className="ru-header">
        <div>
          <h1 className="ru-title">📋 Upload Results</h1>
          <p className="ru-subtitle">Select a student to upload their assessment result</p>
        </div>
      </div>

      {/* Search */}
      <div className="ru-search-card">
        <h3>Search &amp; Filter</h3>
        <p>Find students by name, email or status</p>
        <div className="ru-search-row">
          <div className="ru-search-wrap">
            <span className="ru-search-icon">🔍</span>
            <input
              className="ru-search-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select className="ru-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="ru-table-card">
        <div className="ru-table-head">
          <h3>Student Accounts ({filtered.length})</h3>
          <p>LLND and Enrollment Form must be Completed before uploading a result</p>
        </div>

        {loading && <p className="ru-loading">Loading students...</p>}
        {error   && <p className="ru-loading ru-error">Error: {error}</p>}

        {!loading && !error && (
          <div className="ru-table-scroll">
            <table className="ru-table">
              <thead>
                <tr>
                  <th>Register Date</th>
                  <th>Name</th>
                  <th>Individual / Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Course Schedule</th>
                  <th>LLND Status</th>
                  <th>Enrollment Form</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={10} className="ru-empty">No students found.</td></tr>
                ) : paginated.map(s => {
                  const canUpload = s.llndStatus === "Completed" && s.enrollmentForm === "Completed";
                  return (
                    <tr key={s.flowId || s.id}>
                      <td>
                        <div className="ru-date-primary">{s.registerDate || "—"}</div>
                        {s.registerTime && <div className="ru-date-secondary">{s.registerTime}</div>}
                      </td>
                      <td>
                        <div className="ru-student-cell">
                          <div className="ru-avatar">{s.name?.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="ru-student-name">{s.name}</div>
                            {s.nickname && <div className="ru-student-nick">({s.nickname})</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="ru-type-primary">{s.type || "Individual"}</div>
                        {s.type === "Company" && s.companyName && (
                          <div className="ru-type-company">{s.companyName}</div>
                        )}
                      </td>
                      <td className="ru-email">{s.email}</td>
                      <td className="ru-phone">{s.phone || "—"}</td>
                      <td>
                        <div className="ru-course-title">{s.courseTitle || "—"}</div>
                        {s.courseCategory && <div className="ru-course-cat">{s.courseCategory}</div>}
                      </td>
                      <td className="ru-schedule">{s.courseBookingDate || "—"}</td>
                      <td>{statusBadge(s.llndStatus)}</td>
                      <td>{statusBadge(s.enrollmentForm)}</td>
                      <td>
                        <div className="ru-actions">
                          <button
                            className="ru-btn-upload"
                            onClick={() => handleUploadClick(s)}
                            title={canUpload ? "Upload result" : "LLN or Enrollment not completed"}
                          >
                            {canUpload ? "📤 Upload Result" : "⚠️ Upload Result"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="ru-pagination">
            <span>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} students
            </span>
            <div className="ru-page-controls">
              <button className="ru-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
              <span className="ru-page-indicator">Page {currentPage} of {totalPages}</span>
              <button className="ru-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        )}
      </div>

      {warnStudent && (
        <WarningModal student={warnStudent} onClose={() => setWarnStudent(null)} />
      )}
      {uploadStudent && (
        <UploadResultModal
          key={modalKey}
          student={uploadStudent}
          courses={courses}
          onClose={() => setUploadStudent(null)}
          onSaved={() => setUploadStudent(null)}
        />
      )}
    </div>
  );
}