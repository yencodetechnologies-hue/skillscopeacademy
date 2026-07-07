import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PublicNavbar from "../PublicNavbar";
import Footer from "./Footer";
import CourseCard from "../course/CourseCard";
import "../../styles/AllCourses.css";
import { API_URL } from "../../data/service";
import { ACTIVE_COURSES_URL, filterActiveCourses } from "../../utils/courseStatus";
import ViewAllCoursesMobile from "../mobile/components/ViewAllCoursesMobile";
// ── Mobile detection hook ─────────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= breakpoint
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}
// ─────────────────────────────────────────────────────────────────────────────

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isMobile = useIsMobile();

  // URL-ல இருந்து category param எடு
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category");
  const searchQuery = params.get("search") || "";

  useEffect(() => {
    fetch(ACTIVE_COURSES_URL(API_URL))
      .then(res => res.json())
      .then(data => {
        setCourses(filterActiveCourses(data));
        setLoading(false);
      });
  }, []);

  // ── Mobile view ───────────────────────────────────────────────────────────
  if (isMobile) {
    return <ViewAllCoursesMobile courses={courses} />;
  }

  // ── Desktop view (original — untouched) ──────────────────────────────────

  // Category + Search filter
  const filtered = courses.filter(c => {
    const matchCat = !selectedCategory || c.category === selectedCategory;
    const matchSearch = !searchQuery || 
                        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.courseCode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section>
      <PublicNavbar courses={courses} />
      <div className="all-courses-wrapper">
        <div className="all-courses-header">
          <h2>{selectedCategory ? selectedCategory : "All Courses"}</h2>
          <p>{filtered.length} course{filtered.length !== 1 ? "s" : ""} found</p>
        </div>

        {loading ? (
          <div className="all-courses-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="course-card-skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-courses">No courses found.</div>
        ) : (
          <div className="all-courses-grid">
            {filtered.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </section>
  );
}

export default AllCourses;