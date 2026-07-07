import { useState, useEffect } from "react";
import "./CompanyCourses.css";
import { API_URL } from "../../data/service";
import { ACTIVE_COURSES_URL } from "../../utils/courseStatus";
import { cdnImage } from "../../utils/cdnImage";

export default function CompanyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(ACTIVE_COURSES_URL(API_URL))
      .then(res => res.json())
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    (c.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.courseCode || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="cr-wrapper">
      <p className="cr-page-label">Courses</p>
      <p className="cr-page-subtitle">
        Browse available training courses. Contact the academy to enrol your employees.
      </p>

      {/* Search */}
      <div className="cr-search-wrap">
        <div className="cr-search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="cr-search-input"
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="cr-loading">Loading courses...</div>
      ) : filtered.length === 0 ? (
        <div className="cr-empty">No courses found.</div>
      ) : (
        <div className="cr-grid">
          {filtered.map((course) => (
            <div key={course._id} className="cr-card">
              {course.image && (
                <img
                  src={cdnImage(course.image, { w: 480 })}
                  alt={course.title}
                  className="cr-card-img"
                  loading="lazy"
                  decoding="async"
                  onError={e => e.target.style.display = "none"}
                />
              )}
              <p className="cr-card-code">{course.courseCode}</p>
              <p className="cr-card-title">{course.title}</p>

              {course.sellingPrice && (
                <p className="cr-card-price">${course.sellingPrice}</p>
              )}
              {course.duration && (
                <p className="cr-card-duration">{course.duration}</p>
              )}

              <div className="cr-card-meta">
                {course.deliveryMethod && (
                  <span>🎓 {course.deliveryMethod}</span>
                )}
                {course.location && (
                  <span>📌 {course.location}</span>
                )}
              </div>

              {course.category && (
                <p className="cr-card-category">{course.category}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}