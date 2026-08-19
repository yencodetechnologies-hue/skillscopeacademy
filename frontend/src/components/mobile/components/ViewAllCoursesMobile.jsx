import React, {
  useState,
  useMemo,
  useEffect,
} from "react";

import { colors } from "../../../constants/theme";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import MobileNavbar from "../../MobileNavbar";
import "../styles/ViewAllCoursesMobile.css";

import {
  getCoursePriceDisplay,
  getCourseOriginalDisplay,
  getCourseSavingDisplay,
} from "../../../utils/coursePrice";

import BookingModal from "../../course/BookingModal";

/* =========================================================
   CATEGORY ORDER
========================================================= */

const PREFERRED_ORDER = [
  "Combo Courses",
  "Short Courses",
  "Working in Confined Space Courses",
  "Earthmoving Courses",
  "Demolition Courses",
  "First Aid Courses",
  "Traffic Control Courses",
  "Asbestos Removal Courses",
  "Certificate Courses",
  "High Risk Work",
  "Telecome Courses",
  "Telecom Courses",
];

/* =========================================================
   CATEGORY NORMALIZER
========================================================= */

function normalizeCategory(category = "") {
  return category
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/* =========================================================
   CATEGORY MATCH
========================================================= */

function isSameCategory(category1 = "", category2 = "") {
  const a = normalizeCategory(category1);
  const b = normalizeCategory(category2);

  /* Handle Telecom / Telecome spelling */
  const telecomA =
    a.replace("telecome", "telecom");

  const telecomB =
    b.replace("telecome", "telecom");

  return telecomA === telecomB;
}

/* =========================================================
   CATEGORY ICON
   Inline SVG is used so icons work even if Font Awesome
   is not loaded.
========================================================= */

function CategoryIcon({ category }) {
  const cat = normalizeCategory(category);

  /* ALL COURSES */
  if (cat === "all") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }

  /* COMBO */
  if (cat.includes("combo")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22" x2="12" y2="12" />
      </svg>
    );
  }

  /* SHORT COURSES */
  if (cat.includes("short")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v4c3 3 9 3 12 0v-4" />
        <path d="M22 10v5" />
      </svg>
    );
  }

  /* CONFINED SPACE */
  if (
    cat.includes("confined") ||
    cat.includes("height")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <path d="M8 21V8h8v13" />
        <path d="M7 6h10" />
        <path d="M10 11h1" />
        <path d="M13 11h1" />
        <path d="M10 15h1" />
        <path d="M13 15h1" />
      </svg>
    );
  }

  /* EARTHMOVING */
  if (cat.includes("earthmoving")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="7" cy="18" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <path d="M4.5 18H3l1-6h7l2 6" />
        <path d="M7 12l2-5h5l2 5" />
        <path d="M14 7l3-3" />
        <path d="M17 4h3" />
        <path d="M11 12h6" />
      </svg>
    );
  }

  /* DEMOLITION */
  if (cat.includes("demolition")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 21h16" />
        <path d="M7 21V8h5v13" />
        <path d="M12 8h5l2 3" />
        <path d="M17 11l-3 4" />
        <path d="M14 15l3 3" />
        <path d="M4 8h5" />
      </svg>
    );
  }

  /* FIRST AID */
  if (cat.includes("first aid")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="3"
          y="6"
          width="18"
          height="14"
          rx="2"
        />

        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />

        <path d="M12 10v6" />
        <path d="M9 13h6" />
      </svg>
    );
  }

  /* TRAFFIC CONTROL
     Reliable inline icon - does not depend on Font Awesome.
  */
  if (
    cat.includes("traffic") ||
    cat.includes("traffic control")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Cone */}
        <path d="M9 3h6l1 5H8l1-5z" />
        <path d="M8 8l-3 12h14L16 8" />

        {/* Cone stripes */}
        <path d="M7 13h10" />
        <path d="M6 17h12" />

        {/* Base */}
        <path d="M4 20h16" />
      </svg>
    );
  }

  /* ASBESTOS */
  if (cat.includes("asbestos")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v4" />
        <path d="M12 17v4" />
        <path d="M3 12h4" />
        <path d="M17 12h4" />
        <path d="M5.6 5.6l2.8 2.8" />
        <path d="M15.6 15.6l2.8 2.8" />
        <path d="M18.4 5.6l-2.8 2.8" />
        <path d="M8.4 15.6l-2.8 2.8" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  /* CERTIFICATE */
  if (cat.includes("certificate")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="4"
          y="3"
          width="16"
          height="14"
          rx="1"
        />
        <path d="M8 7h8" />
        <path d="M8 10h6" />
        <circle cx="12" cy="20" r="2" />
        <path d="M10.5 18.5L9 17" />
        <path d="M13.5 18.5L15 17" />
      </svg>
    );
  }

  /* HIGH RISK */
  if (cat.includes("high risk")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3L22 20H2L12 3z" />
        <path d="M12 9v5" />
        <circle cx="12" cy="17" r=".8" />
      </svg>
    );
  }

  /* TELECOM / TELECOME */
  if (
    cat.includes("telecom") ||
    cat.includes("telecome")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20V8" />
        <path d="M8 20h8" />
        <path d="M9 8l3-5 3 5" />
        <path d="M7 11a7 7 0 0 1 10 0" />
        <path d="M4.5 8.5a10.5 10.5 0 0 1 15 0" />
      </svg>
    );
  }

  /* DEFAULT */
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

/* =========================================================
   CATEGORY COLORS
========================================================= */

const CATEGORY_COLORS = {
  "Short Courses": colors.navyDeep,
  "Earthmoving Courses": colors.brandPrimary,
  "High Risk Work": colors.brandAccent,
  "Combo Courses": colors.navyMid,
  "Traffic Control Courses": "#2563eb",
  "First Aid Courses": "#059669",
  "Demolition Courses": "#dc2626",
  "Asbestos Removal Courses": "#7c3aed",
  "Telecome Courses": "#2563eb",
  "Telecom Courses": "#2563eb",
};

function getCategoryColor(category = "") {
  const normalized = normalizeCategory(category);

  for (const [key, value] of Object.entries(CATEGORY_COLORS)) {
    if (
      normalized.includes(
        normalizeCategory(key)
      )
    ) {
      return value;
    }
  }

  const palette = [
    colors.navyDeep,
    colors.brandAccent,
    colors.brandPrimary,
    colors.navyMid,
    "#2563eb",
    "#059669",
    "#7c3aed",
  ];

  let hash = 0;

  for (let i = 0; i < category.length; i++) {
    hash += category.charCodeAt(i);
  }

  return palette[hash % palette.length];
}

/* =========================================================
   PRICE HELPERS
========================================================= */

const getPriceDisplay =
  getCoursePriceDisplay;

const getOrigPrice =
  getCourseOriginalDisplay;

const getSaving =
  getCourseSavingDisplay;

/* =========================================================
   COMPONENT
========================================================= */

export default function ViewAllCoursesMobile({
  courses = [],
}) {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] =
    useSearchParams();

  /* =======================================================
     URL CATEGORY
  ======================================================= */

  const urlCategory =
    searchParams.get("category") || "";

  const urlSearch =
    searchParams.get("search") || "";

  /* =======================================================
     ACTIVE FILTER
     
     If URL contains:
     ?category=Telecome%20Courses

     then Telecome Courses becomes active.
  ======================================================= */

  const getInitialCategory = () => {
    if (!urlCategory) {
      return "All";
    }

    const matchingCategory = courses.find(
      (course) =>
        course.category &&
        isSameCategory(
          course.category,
          urlCategory
        )
    )?.category;

    return matchingCategory || urlCategory;
  };

  const [activeFilter, setActiveFilter] =
    useState(getInitialCategory());

  const [search, setSearch] =
    useState(urlSearch);

  const [selectedCourse, setSelectedCourse] =
    useState(null);

  const [sortBy, setSortBy] =
    useState("Popular");

  /* =======================================================
     UPDATE ACTIVE CATEGORY WHEN URL CHANGES
  ======================================================= */

  useEffect(() => {
    if (!urlCategory) {
      setActiveFilter("All");
      return;
    }

    const matchingCategory = courses.find(
      (course) =>
        course.category &&
        isSameCategory(
          course.category,
          urlCategory
        )
    )?.category;

    setActiveFilter(
      matchingCategory || urlCategory
    );
  }, [urlCategory, courses]);

  /* =======================================================
     UPDATE SEARCH FROM URL
  ======================================================= */

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  /* =======================================================
     ACTIVE COURSES
  ======================================================= */

  const activeCourses = useMemo(() => {
    return courses.filter(
      (course) =>
        course.status === "Active"
    );
  }, [courses]);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {
    const cats = [
      ...new Set(
        activeCourses
          .map((course) => course.category)
          .filter(Boolean)
      ),
    ];

    const sorted = cats.sort((a, b) => {
      const idxA =
        PREFERRED_ORDER.findIndex(
          (item) =>
            isSameCategory(item, a)
        );

      const idxB =
        PREFERRED_ORDER.findIndex(
          (item) =>
            isSameCategory(item, b)
        );

      if (
        idxA !== -1 &&
        idxB !== -1
      ) {
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

    return [
      "All",
      ...sorted,
    ];
  }, [activeCourses]);

  /* =======================================================
     HANDLE CATEGORY CLICK
  ======================================================= */

  const handleCategoryChange = (
    category
  ) => {
    setActiveFilter(category);

    const params =
      new URLSearchParams(
        searchParams
      );

    if (category === "All") {
      params.delete("category");
    } else {
      params.set(
        "category",
        category
      );
    }

    setSearchParams(params);
  };

  /* =======================================================
     FILTER COURSES
  ======================================================= */

  const filtered = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    const list =
      activeCourses.filter((course) => {
        const matchCategory =
          activeFilter === "All" ||
          isSameCategory(
            course.category,
            activeFilter
          );

        const matchSearch =
          !searchText ||
          course.title
            ?.toLowerCase()
            .includes(searchText) ||
          course.courseCode
            ?.toLowerCase()
            .includes(searchText);

        return (
          matchCategory &&
          matchSearch
        );
      });

    return [...list].sort(
      (a, b) => {
        if (sortBy === "Title") {
          return (
            a.title || ""
          ).localeCompare(
            b.title || ""
          );
        }

        const idxA =
          PREFERRED_ORDER.findIndex(
            (item) =>
              isSameCategory(
                item,
                a.category
              )
          );

        const idxB =
          PREFERRED_ORDER.findIndex(
            (item) =>
              isSameCategory(
                item,
                b.category
              )
          );

        if (
          idxA !== -1 &&
          idxB !== -1
        ) {
          return idxA - idxB;
        }

        if (idxA !== -1) {
          return -1;
        }

        if (idxB !== -1) {
          return 1;
        }

        return (
          a.category || ""
        ).localeCompare(
          b.category || ""
        );
      }
    );
  }, [
    activeCourses,
    activeFilter,
    search,
    sortBy,
  ]);

  /* =======================================================
     CATEGORY COUNT
  ======================================================= */

  const getCategoryCount = (
    category
  ) => {
    if (category === "All") {
      return activeCourses.length;
    }

    return activeCourses.filter(
      (course) =>
        isSameCategory(
          course.category,
          category
        )
    ).length;
  };

  /* =======================================================
     JSX
  ======================================================= */

  return (
    <div className="vac-root">

      {/* MOBILE NAVBAR */}
      <MobileNavbar
        courses={courses}
      />

      {/* SEARCH */}
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
            onChange={(e) => {
              setSearch(
                e.target.value
              );
            }}
          />

          {search && (
            <button
              type="button"
              className="vac-search-clear"
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}

        </div>
      </div>

      {/* ===================================================
          CATEGORY SECTION
      =================================================== */}

      <section className="vac-filter-section">

        <div className="vac-filter-header">
          <h3>
            Categories
          </h3>

          {activeFilter !== "All" && (
            <button
              type="button"
              className="vac-view-all"
              onClick={() =>
                handleCategoryChange(
                  "All"
                )
              }
            >
              {/* View All
              <span>›</span> */}
            </button>
          )}
        </div>

        <div className="vac-filter-grid">

          {categories.map(
            (cat) => {
              const count =
                getCategoryCount(
                  cat
                );

              const isActive =
                isSameCategory(
                  activeFilter,
                  cat
                );

              const categoryColor =
                getCategoryColor(
                  cat
                );

              return (
                <button
                  key={cat}
                  type="button"
                  className={`vac-filter-card ${
                    isActive
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleCategoryChange(
                      cat
                    )
                  }
                >

                  {/* ICON */}
                  <span
                    className="vac-category-icon"
                    style={{
                      "--category-color":
                        categoryColor,
                    }}
                  >
                    <CategoryIcon
                      category={
                        cat
                      }
                    />
                  </span>

                  {/* NAME */}
                  <span className="vac-filter-name">
                    {cat ===
                    "All"
                      ? "All Courses"
                      : cat.replace(
                          " Courses",
                          ""
                        )}
                  </span>

                  {/* COUNT */}
                  {/* <span className="vac-filter-count">
                    {count}{" "}
                    {count === 1
                      ? "Course"
                      : "Courses"}
                  </span> */}

                </button>
              );
            }
          )}

        </div>

      </section>

      {/* ===================================================
          META
      =================================================== */}

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
            onChange={(e) =>
              setSortBy(
                e.target.value
              )
            }
          >
            <option value="Popular">
              Popular
            </option>

            <option value="Title">
              Title
            </option>
          </select>

        </div>

      </div>

      {/* ===================================================
          COURSE LIST
      =================================================== */}

      <div className="vac-course-list">

        {filtered.length === 0 ? (
          <div className="vac-empty">
            No courses found.
            <br />
            Try a different
            search or category.
          </div>
        ) : (
          filtered.map(
            (course) => {
              const price =
                getPriceDisplay(
                  course
                );

              const orig =
                getOrigPrice(
                  course
                );

              const saving =
                getSaving(
                  course
                );

              const categoryImgSrc =
                course.categoryImage ||
                course.categoryIcon ||
                course.image ||
                course.icon;

              return (
                <div
                  key={
                    course._id
                  }
                  className="vac-course-card vac-course-item-clickable"
                  onClick={() =>
                    navigate(
                      `/course/${course.slug}`
                    )
                  }
                  role="button"
                  tabIndex={0}
                >

                  <div className="vac-card-accent-bar" />

                  <div className="vac-card-main">

                    {/* CATEGORY IMAGE */}
                    <div className="vac-card-avatar">

                      {categoryImgSrc ? (
                        <img
                          src={
                            categoryImgSrc
                          }
                          alt={
                            course.category ||
                            course.title
                          }
                          className="vac-card-backend-img"
                        />
                      ) : (
                        <CategoryIcon
                          category={
                            course.category
                          }
                        />
                      )}

                    </div>

                    <div className="vac-card-content">

                      {/* TITLE + PRICE */}
                      <div className="vac-card-header">

                        <div className="vac-title-block">

                          <h3 className="vac-course-title">
                            {
                              course.title
                            }
                          </h3>

                          {course.courseCode && (
                            <div className="vac-course-code">
                              (
                              {
                                course.courseCode
                              }
                              )
                            </div>
                          )}

                        </div>

                        <div className="vac-price-block">

                          <div className="vac-course-price">
                            {
                              price
                            }
                          </div>

                          {orig && (
                            <div className="vac-course-orig">
                              {
                                orig
                              }
                            </div>
                          )}

                        </div>

                      </div>

                      {/* META */}
                      <div className="vac-course-meta">

                        {course.duration && (
                          <span className="vac-meta-tag">
                            {course.duration}
                          </span>
                        )}

                        {course.deliveryMethod && (
                          <span className="vac-meta-tag">
                            {
                              course.deliveryMethod
                            }
                          </span>
                        )}

                        {course.location && (
                          <span className="vac-meta-tag">
                            {
                              course.location
                            }
                          </span>
                        )}

                        {saving && (
                          <span className="vac-meta-tag vac-save-tag">
                            {
                              saving
                            }
                          </span>
                        )}

                      </div>

                      {/* ACTIONS */}
                      <div className="vac-course-actions">

                        <button
                          type="button"
                          className="vac-btn-book"
                          onClick={(
                            e
                          ) => {
                            e.stopPropagation();

                            setSelectedCourse(
                              course
                            );
                          }}
                        >
                          Book Now

                          <span className="vac-btn-arrow">
                            →
                          </span>
                        </button>

                        <button
                          type="button"
                          className="vac-btn-details"
                          onClick={(
                            e
                          ) => {
                            e.stopPropagation();

                            navigate(
                              `/course/${course.slug}`
                            );
                          }}
                        >
                          Details
                        </button>

                      </div>

                    </div>

                  </div>

                </div>
              );
            }
          )
        )}

      </div>

      {/* ===================================================
          STICKY BOTTOM
      =================================================== */}

      <div className="vac-sticky-wrapper">

        <div className="vac-sticky">

          <button
            type="button"
            className="vac-sticky-call"
            onClick={() =>
              navigate(
                "/book-now"
              )
            }
          >
            Enroll Now
          </button>

          <a
            href="https://wa.me/611300976097"
            target="_blank"
            rel="noopener noreferrer"
            className="vac-sticky-wa"
            aria-label="WhatsApp Us"
          >
            <i className="fa-brands fa-whatsapp" />
          </a>

        </div>

      </div>

      {/* BOOKING MODAL */}
      {selectedCourse && (
        <BookingModal
          course={
            selectedCourse
          }
          onClose={() =>
            setSelectedCourse(
              null
            )
          }
        />
      )}

    </div>
  );
}