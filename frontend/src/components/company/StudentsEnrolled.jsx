import { useState, useEffect } from "react";
import { colors } from '../../constants/theme';
import "./StudentsEnrolled.css";
import { API_URL } from "../../data/service";

/* ── Badge helpers ── */
function sourceLabel(source) {
  if (source === "Booking Link")  return { text: "Booking Link",  color: colors.brandPrimary };
  if (source === "Company Link")  return { text: "Company Link",  color: "#0891b2" };
  return                                 { text: source || "—",   color: colors.textMuted };
}

/* ── Enrolments Table ── */
function EnrolmentsTable({ students }) {
  return (
    <div className="se-table-wrap">
      <table className="se-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Course</th>
            <th>Amount</th>
            <th>Source</th>
            <th>LLN</th>
            <th>Form</th>
            <th>Training</th>
            <th>Enrolled</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr><td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>No students enrolled yet</td></tr>
          ) : (
            students.map((s) => {
              const src = sourceLabel(s.source);
              return (
                <tr key={s.id}>
                  <td>
                    <p className="se-student-name">{s.name}</p>
                    <p className="se-student-meta">{s.email}</p>
                  </td>
                  <td>{s.course}</td>
                  <td>{s.amount}</td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: src.color, background: src.color + "18",
                      padding: "2px 8px", borderRadius: 10,
                    }}>{src.text}</span>
                  </td>
                  <td>
                    <span className="se-badge" style={s.llnd === "Completed" ? { background: "#1f2937", color: colors.white, border: "none" } : {}}>
                      {s.llnd}
                    </span>
                  </td>
                  <td>
                    <span className="se-badge" style={s.form === "Submitted" ? { background: "#1f2937", color: colors.white, border: "none" } : {}}>
                      {s.form}
                    </span>
                  </td>
                  <td>
                    <div className="se-training-cell">
                      <span className="se-badge" style={{ width: "fit-content" }}>{s.training}</span>
                    </div>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{s.enrolled}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ── Main Component ── */
export default function StudentsEnrolled() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");
    setLoading(true);

    fetch(`${API_URL}/api/students/company/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  return (
    <div className="se-wrapper">
      <p className="se-page-label">Students enrolled</p>
      <p className="se-page-subtitle">
        Students enrolled via your company — course link, company link, or direct booking.
      </p>

      <div className="se-card">
        <div className="se-card-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
            Enrolments
          </div>
          <button
            onClick={fetchStudents}
            style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 13 }}
          >
            🔄 Refresh
          </button>
        </div>
        <p className="se-card-desc">
          Company-scoped students and courses (portal and bulk-order links).
        </p>
        {loading ? (
          <p style={{ padding: "1rem" }}>Loading...</p>
        ) : (
          <EnrolmentsTable students={students} />
        )}
      </div>
    </div>
  );
}