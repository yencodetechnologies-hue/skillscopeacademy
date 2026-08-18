import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
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
import { ORG_PHONE_1300 } from "../../../utils/organizationPhones";


// ============================================================================
// PREFERRED CATEGORY ORDER
// ============================================================================

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


// ============================================================================
// CATEGORY ICON
// ============================================================================

function CategoryIcon({ category }) {
  const catLower = (category || "").toLowerCase();

  // --------------------------------------------------------------------------
  // Combo
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // Short Courses
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // Confined / Height / First Aid
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // Traffic
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // Default Grid Icon
  // --------------------------------------------------------------------------

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1.5"
      />

      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1.5"
      />

      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1.5"
      />

      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1.5"
      />
    </svg>
  );
}


// ============================================================================
// CATEGORY COLORS
// ============================================================================

const CATEGORY_COLORS = {
  "Short Courses": colors.navyDeep,
  "Earthmoving Courses": colors.brandPrimary,
  "High Risk Work": colors.brandAccent,
  Combo: colors.navyMid,
};


// ============================================================================
// GET CATEGORY COLOR
// ============================================================================

function getCategoryColor(category = "") {
  for (const [key, val] of Object.entries(CATEGORY_COLORS)) {
    if (
      category
        .toLowerCase()
        .includes(key.toLowerCase())
    ) {
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


// ============================================================================
// PRICE HELPERS
// ============================================================================

const getPriceDisplay = getCoursePriceDisplay;
const getOrigPrice = getCourseOriginalDisplay;
const getSaving = getCourseSavingDisplay;


// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ViewAllCoursesMobile({
  courses = [],
}) {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  // ==========================================================================
  // CATEGORY REFERENCES
  // ==========================================================================

  // Stores each category button DOM element.
  const categoryRefs = useRef({});

  // Stores the scrollable category container.
  const categoryStripRef = useRef(null);


  // ==========================================================================
  // URL PARAMETERS
  // ==========================================================================

  const urlSearch =
    searchParams.get("search") || "";

  const urlCategory =
    searchParams.get("category") || "";


  // ==========================================================================
  // STATE
  // ==========================================================================

  const [activeFilter, setActiveFilter] =
    useState("All");

  const [search, setSearch] =
    useState(urlSearch);

  const [selectedCourse, setSelectedCourse] =
    useState(null);

  const [sortBy, setSortBy] =
    useState("Popular");


  // ==========================================================================
  // ACTIVE COURSES
  // ==========================================================================

  const activeCourses = useMemo(() => {
    return courses.filter(
      (c) => c.status === "Active"
    );
  }, [courses]);


  // ==========================================================================
  // UNIQUE CATEGORIES
  // ==========================================================================

  const categories = useMemo(() => {
    const cats = [
      ...new Set(
        activeCourses
          .map((c) => c.category)
          .filter(Boolean)
      ),
    ];

    const sorted = cats.sort((a, b) => {
      const idxA =
        PREFERRED_ORDER.indexOf(a);

      const idxB =
        PREFERRED_ORDER.indexOf(b);

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

    // Always show All first.
    return ["All", ...sorted];
  }, [activeCourses]);


  // ==========================================================================
  // URL CATEGORY -> ACTIVE CATEGORY
  // ==========================================================================

  useEffect(() => {
    const categoryFromUrl =
      searchParams.get("category");

    // No category in URL.
    if (!categoryFromUrl) {
      setActiveFilter("All");
      return;
    }

    // Check whether the category actually exists.
    const categoryExists =
      categories.some(
        (category) =>
          category === categoryFromUrl
      );

    if (categoryExists) {
      setActiveFilter(categoryFromUrl);
    } else {
      // Invalid category -> All
      setActiveFilter("All");
    }
  }, [searchParams, categories]);


  // ==========================================================================
  // UPDATE SEARCH FROM URL
  // ==========================================================================

  useEffect(() => {
    const currentSearch =
      searchParams.get("search") || "";

    setSearch(currentSearch);
  }, [searchParams]);


  // ==========================================================================
  // SCROLL SELECTED CATEGORY INTO VIEW
  // ==========================================================================

  useEffect(() => {
    const container =
      categoryStripRef.current;

    const activeButton =
      categoryRefs.current[activeFilter];

    if (!container || !activeButton) {
      return;
    }

    // Wait until the DOM has completed rendering.
    const frame = requestAnimationFrame(() => {
      const containerRect =
        container.getBoundingClientRect();

      const buttonRect =
        activeButton.getBoundingClientRect();

      const currentScrollTop =
        container.scrollTop;

      const buttonTop =
        buttonRect.top -
        containerRect.top;

      const buttonBottom =
        buttonRect.bottom -
        containerRect.top;

      const visibleTop = 0;

      const visibleBottom =
        container.clientHeight;

      // --------------------------------------------------------------
      // Button is above visible area
      // --------------------------------------------------------------

      if (buttonTop < visibleTop) {
        container.scrollTo({
          top:
            currentScrollTop +
            buttonTop -
            8,
          behavior: "smooth",
        });

        return;
      }

      // --------------------------------------------------------------
      // Button is below visible area
      // --------------------------------------------------------------

      if (
        buttonBottom >
        visibleBottom
      ) {
        container.scrollTo({
          top:
            currentScrollTop +
            buttonBottom -
            visibleBottom +
            8,
          behavior: "smooth",
        });
      }
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [activeFilter, categories]);


  // ==========================================================================
  // CATEGORY CLICK
  // ==========================================================================

  const handleCategoryChange = (category) => {
    setActiveFilter(category);

    const params =
      new URLSearchParams(searchParams);

    if (category === "All") {
      params.delete("category");
    } else {
      params.set(
        "category",
        category
      );
    }

    const queryString =
      params.toString();

    navigate(
      queryString
        ? `/all-courses?${queryString}`
        : "/all-courses",
      {
        replace: true,
      }
    );
  };


  // ==========================================================================
  // SEARCH CHANGE
  // ==========================================================================

  const handleSearchChange = (value) => {
    setSearch(value);

    const params =
      new URLSearchParams(searchParams);

    if (value.trim()) {
      params.set(
        "search",
        value
      );
    } else {
      params.delete("search");
    }

    const queryString =
      params.toString();

    navigate(
      queryString
        ? `/all-courses?${queryString}`
        : "/all-courses",
      {
        replace: true,
      }
    );
  };


  // ==========================================================================
  // FILTERED & SORTED COURSES
  // ==========================================================================

  const filtered = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    const list =
      activeCourses.filter((c) => {
        // Category filter
        const matchCat =
          activeFilter === "All" ||
          c.category === activeFilter;

        // Search filter
        const matchSearch =
          !searchText ||
          c.title
            ?.toLowerCase()
            .includes(searchText) ||
          c.courseCode
            ?.toLowerCase()
            .includes(searchText);

        return (
          matchCat &&
          matchSearch
        );
      });

    return list.sort((a, b) => {
      // --------------------------------------------------------------
      // Title sorting
      // --------------------------------------------------------------

      if (sortBy === "Title") {
        return (
          a.title || ""
        ).localeCompare(
          b.title || ""
        );
      }

      // --------------------------------------------------------------
      // Popular/category sorting
      // --------------------------------------------------------------

      const idxA =
        PREFERRED_ORDER.indexOf(
          a.category
        );

      const idxB =
        PREFERRED_ORDER.indexOf(
          b.category
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
    });
  }, [
    activeCourses,
    activeFilter,
    search,
    sortBy,
  ]);


  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="vac-root">

      {/* ================================================================
          MOBILE NAVBAR
      ================================================================ */}

      <MobileNavbar
        courses={courses}
      />


      {/* ================================================================
          SEARCH BAR
      ================================================================ */}

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
            onChange={(e) =>
              handleSearchChange(
                e.target.value
              )
            }
          />


          {search && (
            <button
              type="button"
              className="vac-search-clear"
              onClick={() =>
                handleSearchChange("")
              }
              aria-label="Clear search"
            >
              ✕
            </button>
          )}

        </div>
      </div>


      {/* ================================================================
          CATEGORY SECTION
      ================================================================ */}

      <div className="vac-category-section">

        <div className="vac-category-title">
          Categories
        </div>


        <div
          ref={categoryStripRef}
          className="vac-filter-strip"
        >

          {categories.map((cat) => {
            const isActive =
              activeFilter === cat;

            return (
              <button
                key={cat}

                ref={(element) => {
                  if (element) {
                    categoryRefs.current[cat] =
                      element;
                  } else {
                    delete categoryRefs.current[cat];
                  }
                }}

                type="button"

                className={`vac-filter-btn ${
                  isActive
                    ? "active"
                    : ""
                }`}

                onClick={() =>
                  handleCategoryChange(cat)
                }

                aria-pressed={isActive}
              >

                {/* Category Icon */}

                <span className="vac-filter-icon">
                  <CategoryIcon
                    category={cat}
                  />
                </span>


                {/* Category Name */}

                <span className="vac-filter-text">
                  {cat}
                </span>


                {/* Active Check */}

                {isActive && (
                  <span className="vac-filter-check">
                    ✓
                  </span>
                )}

              </button>
            );
          })}

        </div>
      </div>


      {/* ================================================================
          COUNT + SORT
      ================================================================ */}

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
              Sort by: Popular
            </option>

            <option value="Title">
              Sort by: Title
            </option>
          </select>

        </div>
      </div>


      {/* ================================================================
          COURSE LIST
      ================================================================ */}

      <div className="vac-course-list">

        {filtered.length === 0 ? (

          <div className="vac-empty">
            No courses found.
            Try a different search
            or filter.
          </div>

        ) : (

          filtered.map((c) => {

            const price =
              getPriceDisplay(c);

            const orig =
              getOrigPrice(c);

            const saving =
              getSaving(c);


            // Dynamic backend image/icon

            const categoryImgSrc =
              c.categoryImage ||
              c.categoryIcon ||
              c.image ||
              c.icon;


            const categoryColor =
              getCategoryColor(
                c.category
              );


            return (

              <div
                key={c._id}
                className="vac-course-card vac-course-item-clickable"
                onClick={() =>
                  navigate(
                    `/course/${c.slug}`
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" ||
                    e.key === " "
                  ) {
                    navigate(
                      `/course/${c.slug}`
                    );
                  }
                }}
              >

                {/* ======================================================
                    ACCENT STRIP
                ====================================================== */}

                <div
                  className="vac-card-accent-bar"
                  style={{
                    backgroundColor:
                      categoryColor,
                  }}
                />


                <div className="vac-card-main">


                  {/* ====================================================
                      CATEGORY AVATAR
                  ==================================================== */}

                  <div className="vac-card-avatar">

                    {categoryImgSrc ? (

                      <img
                        src={categoryImgSrc}
                        alt={
                          c.category ||
                          c.title
                        }
                        className="vac-card-backend-img"
                      />

                    ) : (

                      <CategoryIcon
                        category={
                          c.category
                        }
                      />

                    )}

                  </div>


                  {/* ====================================================
                      BODY
                  ==================================================== */}

                  <div className="vac-card-content">


                    {/* ==================================================
                        TITLE + PRICE
                    ================================================== */}

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


                    {/* ==================================================
                        META TAGS
                    ================================================== */}

                    <div className="vac-course-meta">


                      {/* Duration */}

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


                      {/* Delivery Method */}

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


                      {/* Location */}

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


                      {/* Saving */}

                      {saving && (
                        <span className="vac-meta-tag vac-save-tag">
                          {saving}
                        </span>
                      )}

                    </div>


                    {/* ==================================================
                        ACTION BUTTONS
                    ================================================== */}

                    <div className="vac-course-actions">


                      {/* Book Now */}

                      <button
                        type="button"
                        className="vac-btn-book"
                        onClick={(e) => {
                          e.stopPropagation();

                          setSelectedCourse(
                            c
                          );
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


                      {/* Details */}

                      <button
                        type="button"
                        className="vac-btn-details"
                        onClick={(e) => {
                          e.stopPropagation();

                          navigate(
                            `/course/${c.slug}`
                          );
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


      {/* ================================================================
          STICKY BOTTOM NAVIGATION
      ================================================================ */}

      <div className="vac-sticky-wrapper">

        <div className="vac-sticky">


          {/* Enroll */}

          <button
            type="button"
            className="vac-sticky-call"
            onClick={() =>
              navigate("/book-now")
            }
          >
            Enroll Now
          </button>


          {/* WhatsApp */}

          <a
            href="https://wa.me/611300976097"
            className="vac-sticky-wa"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Us"
          >

            <span>
              <i className="fa-brands fa-whatsapp"></i>
            </span>

          </a>

        </div>

      </div>


      {/* ================================================================
          BOOKING MODAL
      ================================================================ */}

      {selectedCourse && (
        <BookingModal
          course={selectedCourse}
          onClose={() =>
            setSelectedCourse(null)
          }
        />
      )}

    </div>
  );
}