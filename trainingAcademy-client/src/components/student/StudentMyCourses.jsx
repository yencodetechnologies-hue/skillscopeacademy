import { useState, useEffect } from "react";
import "./StudentMyCourses.css";
import "../../styles/StudentDashboard.css";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import LLNDAssessment from "../llnd/LLNDAssessment";
import Payment from "../../components/Payment";
import CourseCard from "../course/CourseCard";
import { API_URL } from "../../data/service";
import { cdnImage } from "../../utils/cdnImage";

export default function StudentMyCourses() {
  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get tab from URL or state, default to "enrolled"
  const tab = searchParams.get("tab") || location.state?.tab || "enrolled";

  const setTab = (newTab) => {
    setSearchParams(prev => {
      prev.set("tab", newTab);
      return prev;
    });
  };
  
  // Sync tab if location state changes (optional, but keeps existing behavior)
  useEffect(() => {
    if (location.state?.tab) {
      setTab(location.state.tab);
    }
  }, [location.state]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDates, setSelectedDates] = useState({});
  const [showAssessment, setShowAssessment] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [browseCourses, setBrowseCourses] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [enrolledCourseDetails, setEnrolledCourseDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState({});

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [userDetails, setUserDetails] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || ""
  });

  const fetchData = async () => {
    try {
      const studentId = user?.id;
      if (!studentId) throw new Error("Student ID not found. Please login again.");

      const [dashRes, coursesRes, catsRes] = await Promise.all([
        fetch(`${API_URL}/api/student/dashboard/${studentId}`),
        fetch(`${API_URL}/api/courses`),
        fetch(`${API_URL}/api/categories`)
      ]);

      if (!dashRes.ok) throw new Error("Failed to fetch dashboard data");
      if (!coursesRes.ok) throw new Error("Failed to fetch courses");
      if (!catsRes.ok) throw new Error("Failed to fetch categories");

      const dash = await dashRes.json();
      const courses = await coursesRes.json();
      const categories = await catsRes.json();

      setDashboardData(dash);
      setBrowseCourses(courses);
      setCategoryList(categories); // Already sorted by 'order' from backend
      setEnrolledCourseDetails(dash.enrolledCourses || []);

    } catch (err) {
      console.error(err);
      // Don't show error for missing enrollment data — just show empty state
      if (!err.message?.includes("Student ID")) {
        setDashboardData({ enrolledCourses: [] });
        setEnrolledCourseDetails([]);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssessmentComplete = () => {
    setShowAssessment(false);
    fetchData();
  };

  const filtered = browseCourses
    .filter((c) => {
      const sSearch = search.toLowerCase();
      const matchesSearch = c.title?.toLowerCase().includes(sSearch);
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!search) return 0;
      const sSearch = search.toLowerCase();
      const aTitle = a.title?.toLowerCase() || "";
      const bTitle = b.title?.toLowerCase() || "";
      
      const aStarts = aTitle.startsWith(sSearch);
      const bStarts = bTitle.startsWith(sSearch);
      
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      return 0;
    });

  // Only show categories that actually have courses, but keep the Admin's 'order'
  const usedCategoryNames = new Set(browseCourses.map(c => c.category).filter(Boolean));
  const sortedCategories = [
    "All", 
    ...categoryList
      .map(cat => cat.name)
      .filter(name => usedCategoryNames.has(name))
  ];

  if (showAssessment) {
    return (
      <LLNDAssessment
        onComplete={handleAssessmentComplete}
        userDetails={{
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
        }}
      />
    );
  }

  if (showPayment && selectedCourse) {
    return (
      <div style={{ padding: "24px" }}>
        <button
          onClick={() => { setShowPayment(false); setSelectedCourse(null); }}
          style={{ marginBottom: 16, cursor: "pointer", padding: "8px 16px" }}
        >
          ← Back
        </button>
        <Payment
          selectedCourse={selectedCourse}
          setUserDetails={setUserDetails}
          setPaymentData={setPaymentData}
          coursePrice={selectedCourse?.sellingPrice || selectedCourse?.price}
          isCompanyEnroll={false}
          triggerValidation={false}
          setIsValid={() => {}}
          onCardPayment={() => {}}
        />
        <div style={{ marginTop: 24, textAlign: "right" }}>
          <button
            className="mc-btn mc-btn--purple"
            onClick={() => {
              setShowPayment(false);
              setSelectedCourse(null);
              fetchData();
            }}
          >
            Submit Payment
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const scoreDisplay = Math.round(dashboardData?.assessmentScore || 0);
  const assessmentPassed = dashboardData?.assessmentPassed;
  const formApproved = dashboardData?.enrollmentFormApproved;
  const paymentVerified = dashboardData?.paymentVerified ?? false;
  const enrollmentType = dashboardData?.enrollmentType || "";
  const isAgent = enrollmentType === "agent" || enrollmentType === "Agent";
  const enrollmentFormSubmitted = dashboardData?.enrollmentFormSubmitted;

  return (
    <div className="mc-wrapper">
      <div className="mc-header">
        <h1 className="mc-title">
          {tab === "enrolled" ? "My Enrolled Courses" : "Browse New Courses"}
        </h1>
        <p className="mc-subtitle">
          {tab === "enrolled" 
            ? "Manage your enrolled courses and certifications" 
            : "Discover new certifications and advance your career"}
        </p>
      </div>

      {assessmentPassed && (
        <div className="mc-banner mc-banner--success">
          <span className="mc-banner__icon">✓</span>
          <div>
            <strong>Pre-Enrollment Assessment Passed</strong>
            <p>Score: {scoreDisplay}% – You can now enroll in courses. You can also retake LLN anytime if you want to improve your result.</p>
          </div>
        </div>
      )}

      {/* Enrollment Form Alert */}
      {assessmentPassed && !enrollmentFormSubmitted && (
        <div className="alert alert-danger" style={{ marginBottom: "14px" }}>
          <div className="alert-icon-wrap">📄</div>
          <div className="alert-body">
            <span className="alert-badge">Action required</span>
            <p className="alert-title">Enrollment Form Required</p>
            <p className="alert-desc">
              Complete your enrollment form to finalize your course registration
            </p>
          </div>
          <button
            className="alert-action-btn"
            onClick={() => {
              navigate("/student/enrollment-form");
            }}
          >
            📝 Complete Form
          </button>
        </div>
      )}

      {assessmentPassed && (
        <div className="mc-banner mc-banner--optional">
          <div className="mc-banner__left">
            <span className="mc-optional-badge">Optional</span>
            <div>
              <strong className="mc-banner__title--purple">LLN Assessment Retake Available</strong>
              <p>You have already passed. Retake anytime if you want to improve your score.</p>
            </div>
          </div>
          <button
            className="mc-btn mc-btn--purple"
            onClick={() => setShowAssessment(true)}
          >
            <span>📖</span> Retake Assessment
          </button>
        </div>
      )}

      {formApproved && (
        <div className="mc-banner mc-banner--success">
          <span className="mc-banner__icon">✓</span>
          <div>
            <strong>Enrollment Form Approved</strong>
            <p>Your enrollment form has been approved.</p>
            <button
              onClick={() => navigate("/student/enrollment-form")}
              className="mc-link"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                font: "inherit",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              View Form
            </button>
          </div>
        </div>
      )}

      {tab === "enrolled" && (
        <div className="mc-enrolled">
          {enrolledCourseDetails?.length === 0 && (
            <p>No enrolled courses found.</p>
          )}
          {enrolledCourseDetails?.map((course, index) => {
            const coursePaymentPaid =
              course.paymentStatus === "success" ||
              course.paymentStatus === "completed";
            const courseLlnDone =
              assessmentPassed || course.llndStatus === "completed";
            const courseFormDone = enrollmentFormSubmitted;
            const courseFormLabel = formApproved
              ? "Approved"
              : courseFormDone
                ? "Submitted"
                : "Required";

            return (
            <div key={course.flowId || course.courseId || index} className="mc-course-card">
              {course.image && (
                <img
                  src={cdnImage(course.image, { w: 480 })}
                  alt={course.courseName}
                  className="mc-course-card__img"
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div className="mc-course-card__body">
                <div className="mc-course-card__top">
                  <div>
                    <h3 className="mc-course-card__title">{course.courseName}</h3>
                  </div>
                  <div className="mc-course-card__badges">
                    <span className="mc-badge status-active">Active</span>
                    {isAgent ? (
                      <span className="mc-badge status-active">Payment: N/A</span>
                    ) : (
                      <span className={`mc-badge ${coursePaymentPaid || paymentVerified ? "status-active" : "status-pending"}`}>
                        Payment: {coursePaymentPaid || paymentVerified ? "Paid" : "Pending"}
                      </span>
                    )}
                    <span className={`mc-badge ${courseLlnDone ? "status-completed" : "status-pending"}`}>
                      LLN: {courseLlnDone ? "Completed" : "Pending"}
                    </span>
                    <span className={`mc-badge ${formApproved ? "status-approved" : courseFormDone ? "status-completed" : "status-pending"}`}>
                      Form: {courseFormLabel}
                    </span>
                  </div>
                </div>

                <div className="mc-course-card__progress-section">
                  <div className="mc-course-card__progress-label">
                    <span>Overall Progress</span>
                    <span className="mc-course-card__progress-pct">10%</span>
                  </div>
                  <div className="mc-progress-bar">
                    <div className="mc-progress-bar__fill" style={{ width: "10%" }} />
                  </div>
                </div>

                {course.sessionDate && (
                  <div className="mc-course-card__schedule">
                    <h4 className="mc-schedule-title">📅 Your Booked Session</h4>
                    <div className="mc-schedule-row">
                      <span className="mc-schedule-date">
                        📆 {new Date(course.sessionDate).toLocaleDateString("en-AU", {
                          weekday: "short", day: "numeric", month: "short", year: "numeric"
                        })}
                      </span>
                      {course.startTime && course.endTime && (
                        <span className="mc-schedule-time">
                          🕐 {course.startTime} – {course.endTime}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {!course.sessionDate && (
                  <p className="mc-no-schedule">No session booked yet. Contact us for details.</p>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {tab === "browse" && (
        <div className="mc-browse">
          <div className="mc-search-wrap">
            <span className="mc-search-icon">🔍</span>
            <input
              className="mc-search"
              placeholder="Search for courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mc-categories">
            {sortedCategories.map((cat) => (
              <button
                key={cat}
                className={`mc-category-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="mc-grid">
            {filtered.map((course) => (
              <CourseCard key={course._id} course={course} fromPortal={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}