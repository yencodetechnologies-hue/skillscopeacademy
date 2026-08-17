import React, { useState, useMemo } from "react";
import { colors } from "../../../constants/theme";
import { useNavigate, useSearchParams } from "react-router-dom";
import MobileNavbar from "../../MobileNavbar";
import "../styles/ViewAllCoursesMobile.css";
import {
  getCoursePriceDisplay,
  getCourseOriginalDisplay,
  getCourseSavingDisplay,
} from "../../../utils/coursePrice";
import BookingModal from "../../course/BookingModal";
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

// ── Fallback Category Icon Generator ─────────────────────────────────────────
function CategoryIcon({ category }) {
  const catLower = (category || "").toLowerCase();

  if (catLower.includes("combo")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    );
  }

  if (catLower.includes("short")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    );
  }

  if (
    catLower.includes("confined") ||
    catLower.includes("height") ||
    catLower.includes("first aid")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }

  if (catLower.includes("traffic")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L3 22h18L12 2z" />
        <line x1="7.5" y1="13" x2="16.5" y2="13" />
        <line x1="6" y1="17" x2="18" y2="17" />
      </svg>
    );
  }

  // Grid Default Icon
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

const CATEGORY_COLORS = {
  "Short Courses": colors.navyDeep,
  "Earthmoving Courses": colors.brandPrimary,
  "High Risk Work": colors.brandAccent,
  Combo: colors.navyMid,
};

function getCategoryColor(category = "") {
  for (const [key, val] of Object.entries(CATEGORY_COLORS)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }

  const palette = [
    colors.navyDeep,
    colors.brandAccent,
    colors.brandPrimary,
    colors.navyMid,
  ];

  let hash = 0;

  for (let i = 0; i < category.length; i++) {
    hash += category.charCodeAt(i);
  }

  return palette[hash % palette.length];
}

const getPriceDisplay = getCoursePriceDisplay;
const getOrigPrice = getCourseOriginalDisplay;
const getSaving = getCourseSavingDisplay;

// ─────────────────────────────────────────────────────────────────────────────

export default function ViewAllCoursesMobile({ courses = [] }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ─────────────────────────────────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────────────────────────────────

  const urlSearch = searchParams.get("search") || "";

  // IMPORTANT:
  // All is selected by default
  const [activeFilter, setActiveFilter] = useState("All");

  const [search, setSearch] = useState(urlSearch);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sortBy, setSortBy] = useState("Popular");

  // ── Active courses only ───────────────────────────────────────────────────
  const activeCourses = courses.filter(
    (c) => c.status === "Active"
  );

  // ── Unique categories for filter pills ────────────────────────────────────
  const categories = useMemo(() => {
    const cats = [
      ...new Set(
        activeCourses
          .map((c) => c.category)
          .filter(Boolean)
      ),
    ];

    const sorted = cats.sort((a, b) => {
      const idxA = PREFERRED_ORDER.indexOf(a);
      const idxB = PREFERRED_ORDER.indexOf(b);

      if (idxA !== -1 && idxB !== -1) {
        return idxA - idxB;
      }

      if (idxA !== -1) {
        return -1;
      }

      if (idxB !== -1) {
        return 1;
      }

      return a.localeCompare(b);
    });

    // All is always the first filter
    return ["All", ...sorted];
  }, [activeCourses]);

  // ── Filtered & Sorted courses ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    const list = activeCourses.filter((c) => {
      // When All is selected, show every active course
      const matchCat =
        activeFilter === "All" ||
        c.category === activeFilter;

      const searchText = search.toLowerCase();

      const matchSearch =
        c.title?.toLowerCase().includes(searchText) ||
        c.courseCode?.toLowerCase().includes(searchText);

      return matchCat && matchSearch;
    });

    return list.sort((a, b) => {
      if (sortBy === "Title") {
        return (a.title || "").localeCompare(b.title || "");
      }

      const idxA = PREFERRED_ORDER.indexOf(a.category);
      const idxB = PREFERRED_ORDER.indexOf(b.category);

      if (idxA !== -1 && idxB !== -1) {
        return idxA - idxB;
      }

      if (idxA !== -1) {
        return -1;
      }

      if (idxB !== -1) {
        return 1;
      }

      return (a.category || "").localeCompare(
        b.category || ""
      );
    });
  }, [activeCourses, activeFilter, search, sortBy]);

  // ─────────────────────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="vac-root">

      {/* ── Mobile Navbar ── */}
      <MobileNavbar courses={courses} />

      {/* ── Search Bar ── */}
      <div className="vac-search-wrapper">
        <div className="vac-search-bar">

          <svg
            className="vac-search-icon"
            viewBox="0 0 20 20"
            fill="none"
          >
            <circle
              cx="8.5"
              cy="8.5"
              r="5.5"
              stroke="#4a7096"
              strokeWidth="1.8"
            />

            <path
              d="M13 13l3.5 3.5"
              stroke="#4a7096"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          <input
            className="vac-search-input"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="vac-search-clear"
              onClick={() => setSearch("")}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Pills Strip ── */}
      <div className="vac-filter-strip">

        {categories.map((cat) => (
          <button
            key={cat}
            className={`vac-filter-btn ${
              activeFilter === cat ? "active" : ""
            }`}
            onClick={() => setActiveFilter(cat)}
          >
            <span className="vac-filter-icon">
              <CategoryIcon category={cat} />
            </span>

            {cat}
          </button>
        ))}

      </div>

      {/* ── Header Bar: Count & Sort Dropdown ── */}
      <div className="vac-meta-bar">

        <div className="vac-count-label">
          Showing{" "}
          <span className="vac-count-highlight">
            {filtered.length}
          </span>{" "}
          courses
        </div>

        <div className="vac-sort-wrapper">

          <svg
            className="vac-sort-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" />
          </svg>

          <select
            className="vac-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Popular">
              Sort by: Popular
            </option>

            <option value="Title">
              Sort by: Title
            </option>
          </select>

        </div>
      </div>

      {/* ── Course List ── */}
      <div className="vac-course-list">

        {filtered.length === 0 ? (
          <div className="vac-empty">
            No courses found. Try a different search or filter.
          </div>
        ) : (
          filtered.map((c) => {

            const price = getPriceDisplay(c);
            const orig = getOrigPrice(c);
            const saving = getSaving(c);

            // Dynamic Backend Category Image/Icon
            const categoryImgSrc =
              c.categoryImage ||
              c.categoryIcon ||
              c.image ||
              c.icon;

            return (
              <div
                key={c._id}
                className="vac-course-card vac-course-item-clickable"
                onClick={() =>
                  navigate(`/course/${c.slug}`)
                }
                role="button"
              >

                {/* Accent Strip */}
                <div className="vac-card-accent-bar" />

                <div className="vac-card-main">

                  {/* Avatar / Category Graphic Circle */}
                  <div className="vac-card-avatar">

                    {categoryImgSrc ? (
                      <img
                        src={categoryImgSrc}
                        alt={c.category || c.title}
                        className="vac-card-backend-img"
                      />
                    ) : (
                      <CategoryIcon
                        category={c.category}
                      />
                    )}

                  </div>

                  {/* Body Content */}
                  <div className="vac-card-content">

                    {/* Title + Price Row */}
                    <div className="vac-card-header">

                      <div className="vac-title-block">

                        <h3 className="vac-course-title">
                          {c.title}
                        </h3>

                        {c.courseCode && (
                          <div className="vac-course-code">
                            ({c.courseCode})
                          </div>
                        )}

                      </div>

                      <div className="vac-price-block">

                        <div className="vac-course-price">
                          {price}
                        </div>

                        {orig && (
                          <div className="vac-course-orig">
                            {orig}
                          </div>
                        )}

                      </div>

                    </div>

                    {/* Meta Tags Row */}
                    <div className="vac-course-meta">

                      {c.duration && (
                        <span className="vac-meta-tag">

                          <svg
                            className="vac-meta-tag-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            />

                            <line
                              x1="16"
                              y1="2"
                              x2="16"
                              y2="6"
                            />

                            <line
                              x1="8"
                              y1="2"
                              x2="8"
                              y2="6"
                            />

                            <line
                              x1="3"
                              y1="10"
                              x2="21"
                              y2="10"
                            />
                          </svg>

                          {c.duration}

                        </span>
                      )}

                      {c.deliveryMethod && (
                        <span className="vac-meta-tag">

                          <svg
                            className="vac-meta-tag-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle
                              cx="9"
                              cy="7"
                              r="4"
                            />

                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />

                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>

                          {c.deliveryMethod}

                        </span>
                      )}

                      {c.location && (
                        <span className="vac-meta-tag">

                          <svg
                            className="vac-meta-tag-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />

                            <circle
                              cx="12"
                              cy="10"
                              r="3"
                            />
                          </svg>

                          {c.location}

                        </span>
                      )}

                      {saving && (
                        <span className="vac-meta-tag vac-save-tag">
                          {saving}
                        </span>
                      )}

                    </div>

                    {/* Action Buttons */}
                    <div className="vac-course-actions">

                      <button
                        className="vac-btn-book"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCourse(c);
                        }}
                      >
                        Book Now

                        <span className="vac-btn-arrow">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </span>

                      </button>

                      <button
                        className="vac-btn-details"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/course/${c.slug}`);
                        }}
                      >
                        Details

                        <svg
                          className="vac-eye-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />

                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                          />
                        </svg>

                      </button>

                    </div>

                  </div>
                </div>
              </div>
            );
          })
        )}

      </div>

      {/* ── Sticky Bottom Navigation ── */}
      <div className="vac-sticky-wrapper">

        <div className="vac-sticky">

          <button
            className="vac-sticky-call"
            onClick={() => navigate(`/book-now`)}
          >
            Enroll Now

            <span className="vac-sticky-arrow">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>

          </button>

          {/* <a
            href={ORG_PHONE_1300.wa}
            target="_blank"
            rel="noopener noreferrer"
            className="vac-sticky-wa"
            aria-label="WhatsApp Us"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
          </a> */}

          <a href="https://wa.me/611300976097" class="vac-sticky-wa"><span><i class="fa-brands fa-whatsapp"></i></span></a>x``

        </div>
      </div>

      {/* ── Booking Modal ── */}
      {selectedCourse && (
        <BookingModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}

    </div>
  );
}