import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PublicNavbar from "../PublicNavbar";
import Footer from "./Footer";
import CourseCard from "../course/CourseCard";

import "../../styles/AllCourses.css";

import { API_URL } from "../../data/service";
import {
  ACTIVE_COURSES_URL,
  filterActiveCourses,
} from "../../utils/courseStatus";

import ViewAllCoursesMobile from "../mobile/components/ViewAllCoursesMobile";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Detection Hook
// ─────────────────────────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= breakpoint
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Icon Based On Category Title
// ─────────────────────────────────────────────────────────────────────────────

function getCategoryIcon(category) {
  if (!category) {
    return "📚";
  }

  const title = category.toLowerCase().trim();

  // ─────────────────────────────────────────────────────────────
  // Web / Software / Programming
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("development") ||
    title.includes("programming") ||
    title.includes("coding") ||
    title.includes("software") ||
    title.includes("web")
  ) {
    return "💻";
  }

  // ─────────────────────────────────────────────────────────────
  // Data Science / Analytics
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("data science") ||
    title.includes("data analytics") ||
    title.includes("analytics") ||
    title.includes("data")
  ) {
    return "📊";
  }

  // ─────────────────────────────────────────────────────────────
  // AI / Machine Learning
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("artificial intelligence") ||
    title.includes("machine learning") ||
    title.includes("deep learning") ||
    title.includes(" ai") ||
    title.startsWith("ai")
  ) {
    return "🤖";
  }

  // ─────────────────────────────────────────────────────────────
  // Business
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("business") ||
    title.includes("entrepreneur") ||
    title.includes("entrepreneurship") ||
    title.includes("startup")
  ) {
    return "💼";
  }

  // ─────────────────────────────────────────────────────────────
  // Management
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("management") ||
    title.includes("manager") ||
    title.includes("project management")
  ) {
    return "📋";
  }

  // ─────────────────────────────────────────────────────────────
  // Marketing
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("marketing") ||
    title.includes("digital marketing") ||
    title.includes("seo") ||
    title.includes("social media") ||
    title.includes("advertising")
  ) {
    return "📢";
  }

  // ─────────────────────────────────────────────────────────────
  // Finance
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("finance") ||
    title.includes("financial") ||
    title.includes("banking") ||
    title.includes("investment")
  ) {
    return "💰";
  }

  // ─────────────────────────────────────────────────────────────
  // Accounting
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("accounting") ||
    title.includes("accountant") ||
    title.includes("bookkeeping")
  ) {
    return "🧾";
  }

  // ─────────────────────────────────────────────────────────────
  // HR
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("human resource") ||
    title.includes("hr ") ||
    title === "hr" ||
    title.startsWith("hr/")
  ) {
    return "👥";
  }

  // ─────────────────────────────────────────────────────────────
  // Design
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("design") ||
    title.includes("ui/ux") ||
    title.includes("ux") ||
    title.includes("graphic") ||
    title.includes("creative")
  ) {
    return "🎨";
  }

  // ─────────────────────────────────────────────────────────────
  // Cyber Security
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("cyber") ||
    title.includes("security") ||
    title.includes("ethical hacking") ||
    title.includes("penetration testing")
  ) {
    return "🔐";
  }

  // ─────────────────────────────────────────────────────────────
  // Networking
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("network") ||
    title.includes("networking")
  ) {
    return "🌐";
  }

  // ─────────────────────────────────────────────────────────────
  // Cloud / DevOps
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("cloud") ||
    title.includes("aws") ||
    title.includes("azure") ||
    title.includes("devops")
  ) {
    return "☁️";
  }

  // ─────────────────────────────────────────────────────────────
  // Database
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("database") ||
    title.includes("sql") ||
    title.includes("mongodb") ||
    title.includes("mysql")
  ) {
    return "🗄️";
  }

  // ─────────────────────────────────────────────────────────────
  // Mobile
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("mobile") ||
    title.includes("android") ||
    title.includes("ios") ||
    title.includes("flutter") ||
    title.includes("react native")
  ) {
    return "📱";
  }

  // ─────────────────────────────────────────────────────────────
  // Testing / QA
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("testing") ||
    title.includes("quality assurance") ||
    title.includes("qa")
  ) {
    return "🧪";
  }

  // ─────────────────────────────────────────────────────────────
  // Education / Training
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("education") ||
    title.includes("training") ||
    title.includes("teaching") ||
    title.includes("learning")
  ) {
    return "🎓";
  }

  // ─────────────────────────────────────────────────────────────
  // Communication / Language
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("communication") ||
    title.includes("english") ||
    title.includes("language")
  ) {
    return "💬";
  }

  // ─────────────────────────────────────────────────────────────
  // Leadership
  // ─────────────────────────────────────────────────────────────

  if (
    title.includes("leadership") ||
    title.includes("leader")
  ) {
    return "🏆";
  }

  // ─────────────────────────────────────────────────────────────
  // Default
  // ─────────────────────────────────────────────────────────────

  return "📚";
}

// ─────────────────────────────────────────────────────────────────────────────
// All Courses
// ─────────────────────────────────────────────────────────────────────────────

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const isMobile = useIsMobile();

  // ───────────────────────────────────────────────────────────────────────────
  // URL Parameters
  // ───────────────────────────────────────────────────────────────────────────

  const params = new URLSearchParams(location.search);

  const selectedCategory = params.get("category");

  const searchQuery = params.get("search") || "";

  // ───────────────────────────────────────────────────────────────────────────
  // Fetch Courses
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          ACTIVE_COURSES_URL(API_URL)
        );

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();

        const activeCourses = filterActiveCourses(data);

        setCourses(activeCourses);
      } catch (error) {
        console.error(
          "Error fetching courses:",
          error
        );

        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Get Unique Categories
  // ───────────────────────────────────────────────────────────────────────────

  const categories = [
    ...new Set(
      courses
        .map((course) => course.category)
        .filter(
          (category) =>
            category &&
            typeof category === "string" &&
            category.trim() !== ""
        )
    ),
  ];

  // ───────────────────────────────────────────────────────────────────────────
  // Category Click
  // ───────────────────────────────────────────────────────────────────────────

  const handleCategoryClick = (category) => {
    const searchParams = new URLSearchParams(
      location.search
    );

    if (category === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }

    const queryString = searchParams.toString();

    navigate(
      queryString
        ? `${location.pathname}?${queryString}`
        : location.pathname
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Mobile View
  // ───────────────────────────────────────────────────────────────────────────

  if (isMobile) {
    return (
      <ViewAllCoursesMobile
        courses={courses}
      />
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Filter Courses
  // ───────────────────────────────────────────────────────────────────────────

  const filtered = courses.filter((course) => {
    // Category filter
    const matchCategory =
      !selectedCategory ||
      course.category === selectedCategory;

    // Search filter
    const search = searchQuery.toLowerCase();

    const matchSearch =
      !searchQuery ||
      course.title
        ?.toLowerCase()
        .includes(search) ||
      course.courseCode
        ?.toLowerCase()
        .includes(search);

    return matchCategory && matchSearch;
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <section className="all-courses-page">

      {/* ================================================================
          NAVBAR
      ================================================================ */}

      <PublicNavbar courses={courses} />

      <div className="all-courses-wrapper">

        {/* ================================================================
            CATEGORY SECTION
        ================================================================ */}

        <div className="course-category-section">

          <div className="course-category-list">

            {/* ============================================================
                ALL COURSES
            ============================================================ */}

            <button
              type="button"
              className={`course-category-item ${
                !selectedCategory
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleCategoryClick("All")
              }
            >

              <span className="category-icon">
                📚
              </span>

              <span className="category-name">
                All Courses
              </span>

            </button>

            {/* ============================================================
                CATEGORIES
            ============================================================ */}

            {categories.map((category) => (

              <button
                type="button"
                key={category}
                className={`course-category-item ${
                  selectedCategory === category
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleCategoryClick(category)
                }
              >

                <span className="category-icon">
                  {getCategoryIcon(category)}
                </span>

                <span className="category-name">
                  {category}
                </span>

              </button>

            ))}

          </div>

        </div>

        {/* ================================================================
            COURSE HEADER
        ================================================================ */}

        <div className="all-courses-header">

          <div>

            <h2>
              {selectedCategory ||
                "All Courses"}
            </h2>

            <p>
              {filtered.length} course
              {filtered.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>

          </div>

        </div>

        {/* ================================================================
            LOADING
        ================================================================ */}

        {loading ? (

          <div className="all-courses-grid">

            {Array.from({
              length: 8,
            }).map((_, index) => (

              <div
                key={index}
                className="course-card-skeleton"
              />

            ))}

          </div>

        ) : filtered.length === 0 ? (

          /* ================================================================
             NO COURSES
          ================================================================ */

          <div className="no-courses">
            No courses found.
          </div>

        ) : (

          /* ================================================================
             COURSE CARDS
          ================================================================ */

          <div className="all-courses-grid">

            {filtered.map((course) => (

              <CourseCard
                key={course._id}
                course={course}
              />

            ))}

          </div>

        )}

      </div>

      {/* ================================================================
          FOOTER
      ================================================================ */}

      <Footer />

    </section>
  );
}

export default AllCourses;