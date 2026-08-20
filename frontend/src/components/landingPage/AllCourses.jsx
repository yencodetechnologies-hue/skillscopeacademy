import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import PublicNavbar from "../PublicNavbar";
import Footer from "./Footer";
import CourseCard from "../course/CourseCard";
import Hero from "./Hero"

import "../../styles/AllCourses.css";

import { API_URL } from "../../data/service";
import {
  ACTIVE_COURSES_URL,
  filterActiveCourses,
} from "../../utils/courseStatus";

import ViewAllCoursesMobile from "../mobile/components/ViewAllCoursesMobile";

// ============================================================
// React Icon
// Only All Courses uses this icon
// ============================================================

import { FaThLarge } from "react-icons/fa";

// ============================================================
// CDN IMAGE
// Same utility used in your HomePage
// ============================================================

import { cdnImage } from "../../utils/cdnImage";

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
// All Courses
// ─────────────────────────────────────────────────────────────────────────────

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // CATEGORY DATA
  // ============================================================

  const [dbCategories, setDbCategories] = useState(null);

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
  // Fetch Categories
  //
  // Same API used by your HomePage
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let alive = true;

    axios
      .get(`${API_URL}/api/categories`)
      .then((res) => {
        if (!alive) return;

        setDbCategories(
          Array.isArray(res.data)
            ? res.data
            : []
        );
      })
      .catch((error) => {
        console.error(
          "Error fetching categories:",
          error
        );

        if (alive) {
          setDbCategories([]);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Course Image By Category
  //
  // Fallback if category does not have an image
  // ───────────────────────────────────────────────────────────────────────────

  const courseImgByCat = useMemo(() => {
    return courses.reduce((acc, course) => {
      if (!course?.category) {
        return acc;
      }

      const key =
        typeof course.category === "string"
          ? course.category
          : course.category?.name || "";

      if (
        key &&
        !acc[key] &&
        course.image
      ) {
        acc[key] = course.image;
      }

      return acc;
    }, {});
  }, [courses]);

  // ───────────────────────────────────────────────────────────────────────────
  // Get Categories
  //
  // Prefer database categories.
  // Fallback to course categories if API has no data.
  // ───────────────────────────────────────────────────────────────────────────

  const categories = useMemo(() => {
    // ==========================================================
    // Database Categories
    // ==========================================================

    if (
      Array.isArray(dbCategories) &&
      dbCategories.length > 0
    ) {
      return dbCategories
        .filter(
          (category) =>
            category &&
            category.active !== false &&
            category.name
        )
        .sort(
          (a, b) =>
            (a.order || 0) -
            (b.order || 0)
        )
        .map((category) => ({
          name: category.name,

          image:
            category.image ||
            courseImgByCat[category.name] ||
            "",
        }));
    }

    // ==========================================================
    // Fallback - Categories From Courses
    // ==========================================================

    return [
      ...new Map(
        courses
          .filter((course) => course?.category)
          .map((course) => {
            const key =
              typeof course.category === "string"
                ? course.category
                : course.category?.name || "";

            return [
              key,
              {
                name: key,
                image: course.image || "",
              },
            ];
          })
      ).values(),
    ]
      .filter((category) => category.name)
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }, [
    dbCategories,
    courses,
    courseImgByCat,
  ]);

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
      searchParams.set(
        "category",
        category
      );
    }

    const queryString =
      searchParams.toString();

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
    const search =
      searchQuery.toLowerCase();

    const matchSearch =
      !searchQuery ||
      course.title
        ?.toLowerCase()
        .includes(search) ||
      course.courseCode
        ?.toLowerCase()
        .includes(search);

    return (
      matchCategory &&
      matchSearch
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <section className="all-courses-page">

      {/* ================================================================
          NAVBAR
      ================================================================ */}

      <div className="site-header">
            {/* <TopNav /> */}
            <PublicNavbar courses={courses} />
             {/* {marqueeContent && (
              <div className="announcement-bar">
                <p>{marqueeContent}</p>
              </div>
            )} */}
          </div>
          <Hero />

      <div className="all-courses-wrapper">

        {/* ================================================================
            CATEGORY SECTION
        ================================================================ */}

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
        !selectedCategory ? "active" : ""
      }`}
      onClick={() => handleCategoryClick("All")}
    >
      <span className="category-icon">
        <FaThLarge />
      </span>

      <span className="category-name">
        All Courses
      </span>
    </button>


    {/* ============================================================
        DATABASE CATEGORIES
    ============================================================ */}

    {categories.map((category, index) => {

      const imageUrl = category.image
        ? cdnImage(category.image, { w: 160 })
        : "";

      return (
        <button
          type="button"
          key={`${category.name}-${index}`}
          className={`course-category-item ${
            selectedCategory === category.name
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleCategoryClick(category.name)
          }
        >

          {/* ======================================================
              CATEGORY IMAGE
          ====================================================== */}

          {imageUrl ? (
            <span className="category-image-wrapper">
              <img
                src={imageUrl}
                alt={category.name}
                className="category-image"
                loading="lazy"
                decoding="async"
              />
            </span>
          ) : (
            <span className="category-image-wrapper category-image-placeholder">
              <FaThLarge />
            </span>
          )}


          {/* ======================================================
              CATEGORY NAME
          ====================================================== */}

          <span className="category-name">
            {category.name}
          </span>

        </button>
      );
    })}

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