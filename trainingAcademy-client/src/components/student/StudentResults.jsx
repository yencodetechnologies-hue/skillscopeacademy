import { useState, useEffect } from "react";
import "./StudentResults.css";
import { API_URL } from "../../data/service";

const statusConfig = {
  "Competent": { color: "#16a34a", bg: "#dcfce7", label: "Competent" },
  "Not Yet Competent": { color: "#dc2626", bg: "#fee2e2", label: "Not Yet Competent" },
  "Pending": { color: "#ca8a04", bg: "#fef9c3", label: "Pending" },
};

function ScoreRing({ score }) {
  const r = 28, circ = 2 * Math.PI * r;
  const pct = Math.min(score, 100);
  const dashOffset = circ - (pct / 100) * circ;
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#ca8a04" : "#dc2626";
  return (
    <svg className="rr-ring" width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={dashOffset}
        strokeLinecap="round" transform="rotate(-90 36 36)" />
      <text x="36" y="40" textAnchor="middle" fontSize="11" fontWeight="800" fill={color}>{score}%</text>
    </svg>
  );
}

export default function StudentResults() {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("All");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`${API_URL}/api/results/student/${user?.id}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const filters = ["All", "Competent", "Not Yet Competent"];
  const filtered = filter === "All" ? results : results.filter(r => r.status === filter);

  const avg = results.length
    ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length)
    : 0;
  const competentCount = results.filter(r => r.status === "Competent").length;

  if (loading) return <div>Loading...</div>;

  return (
    <div className="rr-wrapper">
      <div className="rr-header">
        <h1 className="rr-title">My Results</h1>
        <p className="rr-subtitle">Track your exam results and academic performance</p>
      </div>

      <div className="rr-summary">
        <div className="rr-stat-card">
          <span className="rr-stat-icon">📊</span>
          <div>
            <p className="rr-stat-value">{avg}%</p>
            <p className="rr-stat-label">Average Score</p>
          </div>
        </div>
        <div className="rr-stat-card">
          <span className="rr-stat-icon">✅</span>
          <div>
            <p className="rr-stat-value">{competentCount}/{results.length}</p>
            <p className="rr-stat-label">Units Competent</p>
          </div>
        </div>
        <div className="rr-stat-card">
          <span className="rr-stat-icon">🎯</span>
          <div>
            <p className="rr-stat-value">{results.length}</p>
            <p className="rr-stat-label">Total Assessments</p>
          </div>
        </div>
      </div>

      <div className="rr-filters">
        {filters.map(f => (
          <button
            key={f}
            className={`rr-filter-btn ${filter === f ? "rr-filter-btn--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rr-list">
        {results.length === 0 && (
          <div className="rr-empty">
            <span>📋</span>
            <p>No results yet. Results will appear here after your assessments.</p>
          </div>
        )}
        {filtered.length === 0 && results.length > 0 && (
          <div className="rr-empty">
            <span>📋</span>
            <p>No results found for this filter.</p>
          </div>
        )}
        {filtered.map(result => {
          const sc = statusConfig[result.status] || statusConfig["Pending"];
          const isOpen = expanded === result._id;
          return (
            <div key={result._id} className={`rr-card ${isOpen ? "rr-card--open" : ""}`}>
              <div className="rr-card-main" onClick={() => setExpanded(isOpen ? null : result._id)}>
                <ScoreRing score={result.score} />
                <div className="rr-card-info">
                  <h3 className="rr-card-unit">{result.unitName}</h3>
                  <p className="rr-card-course">{result.courseName}</p>
                  <div className="rr-card-meta">
                    <span className="rr-meta-tag">{result.assessmentType}</span>
                    <span className="rr-meta-tag">
                      📅 {result.assessmentDate
                        ? new Date(result.assessmentDate).toLocaleDateString("en-AU")
                        : "Date not set"}
                    </span>
                    <span className="rr-meta-tag">Attempt {result.attempts}</span>
                  </div>
                </div>
                <div className="rr-card-right">
                  <span className="rr-status-badge" style={{ color: sc.color, background: sc.bg }}>
                    {sc.label}
                  </span>
                  <span className={`rr-chevron ${isOpen ? "rr-chevron--open" : ""}`}>›</span>
                </div>
              </div>
              {isOpen && (
                <div className="rr-card-detail">
                  <div className="rr-detail-row">
                    <span className="rr-detail-label">Course Code</span>
                    <span className="rr-detail-val">{result.courseCode || "—"}</span>
                  </div>
                  <div className="rr-detail-row">
                    <span className="rr-detail-label">Assessment Type</span>
                    <span className="rr-detail-val">{result.assessmentType}</span>
                  </div>
                  <div className="rr-detail-row">
                    <span className="rr-detail-label">Date</span>
                    <span className="rr-detail-val">
                      {result.assessmentDate
                        ? new Date(result.assessmentDate).toLocaleDateString("en-AU")
                        : "—"}
                    </span>
                  </div>
                  <div className="rr-detail-row">
                    <span className="rr-detail-label">Score</span>
                    <span className="rr-detail-val rr-detail-score">{result.score}%</span>
                  </div>
                  {result.feedback && (
                    <div className="rr-feedback">
                      <span className="rr-detail-label">Feedback</span>
                      <p className="rr-feedback-text">{result.feedback}</p>
                    </div>
                  )}
                  {result.status === "Not Yet Competent" && (
                    <button className="rr-retake-btn">📖 Schedule Retake</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}