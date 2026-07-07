import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PublicNavbar from "../../PublicNavbar";
import "../styles/ViewAllCoursesMobile.css";
import {
  getCoursePriceDisplay,
  getCourseOriginalDisplay,
  getCourseSavingDisplay,
} from "../../../utils/coursePrice";
import BookingModal, { getBookingType } from "../../course/BookingModal";
import { ORG_PHONE_1300 } from "../../../utils/organizationPhones";

const PREFERRED_ORDER = [
  "Combo Courses",
  "Short Courses",
  "Working in Confined Space Courses",
  "Earthmoving Courses",
  "Demolition Courses",
  "First Aid Courses",
  "Traffic Control Courses",
  "Asbestos Removal Courses",
  "High Risk Work",
];

// ── Color bar per category ────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  "Short Courses":      "#0d2240",
  "Earthmoving Courses":"#29b6e8",
  "High Risk Work":     "#0e6da8",
  "Combo":              "#0a4d7a",
};

function getCategoryColor(category = "") {
  for (const [key, val] of Object.entries(CATEGORY_COLORS)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return val;
  }
  // cycle through brand colors for unknown categories
  const palette = ["#0d2240","#0e6da8","#29b6e8","#0a4d7a","#1490cc"];
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash += category.charCodeAt(i);
  return palette[hash % palette.length];
}

// Pricing helpers live in src/utils/coursePrice so every mobile screen
// (landing hero, all-courses list, course detail) shows the same value
// for experience- and SL/BL-based courses. Local aliases keep the JSX
// below readable and the previous call sites unchanged.
const getPriceDisplay = getCoursePriceDisplay;
const getOrigPrice    = getCourseOriginalDisplay;
const getSaving       = getCourseSavingDisplay;

// ─────────────────────────────────────────────────────────────────────────────

export default function ViewAllCoursesMobile({ courses = [] }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // initialise active filter from URL ?category=
  const urlCategory = searchParams.get("category") || "All";
  const urlSearch = searchParams.get("search") || "";
  const [activeFilter, setActiveFilter] = useState(urlCategory);
  const [search, setSearch] = useState(urlSearch);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // ── Active courses only ───────────────────────────────────────────────────
  const activeCourses = courses.filter((c) => c.status === "Active");

  // ── Unique categories for filter pills ───────────────────────────────────
  const categories = useMemo(() => {
    const cats = [...new Set(activeCourses.map((c) => c.category).filter(Boolean))];
    const sorted = cats.sort((a, b) => {
      const idxA = PREFERRED_ORDER.indexOf(a);
      const idxB = PREFERRED_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
    return ["All", ...sorted];
  }, [activeCourses]);

  // ── Filtered courses ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const list = activeCourses.filter((c) => {
      const matchCat = activeFilter === "All" || c.category === activeFilter;
      const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) ||
                          c.courseCode?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });

    return list.sort((a, b) => {
      const idxA = PREFERRED_ORDER.indexOf(a.category);
      const idxB = PREFERRED_ORDER.indexOf(b.category);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a.category || "").localeCompare(b.category || "");
    });
  }, [activeCourses, activeFilter, search]);

  return (
    <div className="vac-root">

      {/* ── Top Bar ── */}
      <div className="vac-topbar">
        <span className="vac-logo-text">Safety Training Academy</span>
        <a href={ORG_PHONE_1300.tel} className="vac-topbar-phone">☎ Call Now</a>
      </div>

      <PublicNavbar courses={courses} />

      {/* ── Search Bar ── */}
      <div className="vac-search-bar">
        <svg className="vac-search-icon" viewBox="0 0 20 20" fill="none">
          <circle cx="8.5" cy="8.5" r="5.5" stroke="#4a7096" strokeWidth="1.5"/>
          <path d="M13 13l3 3" stroke="#4a7096" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          className="vac-search-input"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="vac-search-clear" onClick={() => setSearch("")}>✕</button>
        )}
      </div>

      {/* ── Filter Pills ── */}
      <div className="vac-filter-strip">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`vac-filter-btn ${activeFilter === cat ? "active" : ""}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Count Label ── */}
      <div className="vac-count-label">
        Showing {filtered.length} course{filtered.length !== 1 ? "s" : ""}
      </div>

      {/* ── Course List ── */}
      <div className="vac-course-list">
        {filtered.length === 0 ? (
          <div className="vac-empty">
            No courses found. Try a different search or filter.
          </div>
        ) : (
          filtered.map((c) => {
            const price   = getPriceDisplay(c);
            const orig    = getOrigPrice(c);
            const saving  = getSaving(c);
            const color   = getCategoryColor(c.category);

            return (
              <div
                key={c._id}
                className="vac-course-item vac-course-item-clickable"
                onClick={() => navigate(`/course/${c.slug}`)}
                role="button"
              >
                {/* Left color bar */}
                <div className="vac-course-color"  />

                <div className="vac-course-body">
                  {/* Title + Price */}
                  <div className="vac-course-top">
                    <div className="vac-course-name">
                      {c.title}
                      {c.courseCode && (
                        <span className="vac-course-code"> ({c.courseCode})</span>
                      )}
                    </div>
                    <div className="vac-price-block">
                      <div className="vac-course-price">{price}</div>
                      {orig && <div className="vac-course-orig">{orig}</div>}
                    </div>
                  </div>

                  {/* Meta tags */}
                  <div className="vac-course-meta">
                    {c.duration && <span className="vac-meta-tag">{c.duration}</span>}
                    {c.deliveryMethod && (
                      <span className="vac-meta-tag">{c.deliveryMethod}</span>
                    )}
                    {c.location && (
                      <span className="vac-meta-tag">{c.location}</span>
                    )}
                    {saving && <span className="vac-meta-tag vac-save-tag">{saving}</span>}
                  </div>

                  {/* Actions */}
                  <div className="vac-course-actions">
                    <button
                      className="vac-btn-book"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCourse(c);
                      }}
                    >
                      Book Now
                    </button>
                    <button
                      className="vac-btn-details"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${c.slug}`);
                      }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <div className="vac-sticky">
        <button href="tel:1300976097" className="vac-sticky-call" onClick={()=>{navigate(`/book-now`)}}>Enroll Now</button>
        <a href={ORG_PHONE_1300.wa} className="vac-sticky-wa"><span><i class="fa-brands fa-whatsapp"></i></span></a>
      </div>

      {selectedCourse && (
        <BookingModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}

    </div>
  );
}