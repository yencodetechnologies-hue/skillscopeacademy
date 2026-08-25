import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import "./CompanyCourses.css";

import { API_URL } from "../../data/service";
import { ACTIVE_COURSES_URL } from "../../utils/courseStatus";
import CourseCard from "../course/CourseCard";

export default function CompanyCourses() {
    // =========================================================
    // BASIC STATE
    // =========================================================

    const [courses, setCourses] = useState([]);
    const [browseCourses, setBrowseCourses] = useState([]);

    const [categoryList, setCategoryList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const [dashboardData, setDashboardData] = useState({
        enrolledCourses: [],
    });

    const [enrolledCourseDetails, setEnrolledCourseDetails] = useState([]);

    const [showAssessment, setShowAssessment] = useState(false);

    const [paymentData, setPaymentData] = useState({});

    const [userDetails, setUserDetails] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const location = useLocation();

    const [searchParams, setSearchParams] = useSearchParams();

    // =========================================================
    // GET USER
    // =========================================================

    const getStoredUser = () => {
        try {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                return null;
            }

            return JSON.parse(storedUser);
        } catch (err) {
            console.error("Invalid user data in localStorage:", err);
            return null;
        }
    };

    const user = getStoredUser();

    // =========================================================
    // UPDATE USER DETAILS
    // =========================================================

    useEffect(() => {
        setUserDetails({
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
        });
    }, []);

    // =========================================================
    // NORMALIZE COURSE RESPONSE
    // =========================================================

    const normalizeCourses = (response) => {
        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response?.courses)) {
            return response.courses;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (Array.isArray(response?.results)) {
            return response.results;
        }

        return [];
    };

    // =========================================================
    // NORMALIZE CATEGORY RESPONSE
    // =========================================================

    const normalizeCategories = (response) => {
        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response?.categories)) {
            return response.categories;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (Array.isArray(response?.results)) {
            return response.results;
        }

        return [];
    };

    // =========================================================
    // GET COURSE CATEGORY NAME
    // =========================================================

    const getCourseCategory = (course) => {
        if (!course) {
            return "";
        }

        if (typeof course.category === "string") {
            return course.category;
        }

        if (course.category?.name) {
            return course.category.name;
        }

        if (course.categoryName) {
            return course.categoryName;
        }

        if (course.category?.title) {
            return course.category.title;
        }

        return "";
    };

    // =========================================================
    // GET COURSE TITLE
    // =========================================================

    const getCourseTitle = (course) => {
        if (!course) {
            return "";
        }

        return (
            course.title ||
            course.name ||
            course.courseName ||
            course.courseTitle ||
            ""
        );
    };

    // =========================================================
    // FETCH COURSES
    // =========================================================
    //
    // IMPORTANT:
    // Courses are fetched independently.
    // They should NOT depend on studentId.
    // =========================================================

    const fetchCourses = async () => {
        try {
            console.log("Fetching active courses...");

            const response = await fetch(
                ACTIVE_COURSES_URL(API_URL)
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch courses: ${response.status}`
                );
            }

            const data = await response.json();

            console.log("Active courses response:", data);

            const normalizedCourses = normalizeCourses(data);

            console.log(
                "Normalized courses:",
                normalizedCourses
            );

            setCourses(normalizedCourses);
            setBrowseCourses(normalizedCourses);

            return normalizedCourses;
        } catch (err) {
            console.error("Course fetch error:", err);

            // -------------------------------------------------
            // FALLBACK TO /api/courses
            // -------------------------------------------------

            try {
                console.log(
                    "Trying fallback /api/courses..."
                );

                const response = await fetch(
                    `${API_URL}/api/courses`
                );

                if (!response.ok) {
                    throw new Error(
                        `Fallback courses API failed: ${response.status}`
                    );
                }

                const data = await response.json();

                console.log(
                    "Fallback courses response:",
                    data
                );

                const normalizedCourses =
                    normalizeCourses(data);

                console.log(
                    "Fallback normalized courses:",
                    normalizedCourses
                );

                setCourses(normalizedCourses);
                setBrowseCourses(normalizedCourses);

                return normalizedCourses;
            } catch (fallbackError) {
                console.error(
                    "Fallback course fetch error:",
                    fallbackError
                );

                setCourses([]);
                setBrowseCourses([]);

                throw fallbackError;
            }
        }
    };

    // =========================================================
    // FETCH CATEGORIES
    // =========================================================

    const fetchCategories = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/categories`
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch categories: ${response.status}`
                );
            }

            const data = await response.json();

            console.log("Categories response:", data);

            const categories =
                normalizeCategories(data);

            setCategoryList(categories);

            return categories;
        } catch (err) {
            console.error(
                "Category fetch error:",
                err
            );

            setCategoryList([]);

            return [];
        }
    };

    // =========================================================
    // FETCH DASHBOARD
    // =========================================================
    //
    // Dashboard is optional.
    // It must NOT prevent courses from loading.
    // =========================================================

    const fetchDashboard = async () => {
        const studentId =
            user?.id ||
            user?._id ||
            user?.studentId;

        if (!studentId) {
            console.log(
                "No student ID found. Skipping dashboard API."
            );

            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/student/dashboard/${studentId}`
            );

            if (!response.ok) {
                console.warn(
                    "Dashboard API failed:",
                    response.status
                );

                return;
            }

            const dashboard = await response.json();

            console.log(
                "Dashboard response:",
                dashboard
            );

            setDashboardData(dashboard);

            const enrolled =
                Array.isArray(
                    dashboard?.enrolledCourses
                )
                    ? dashboard.enrolledCourses
                    : [];

            setEnrolledCourseDetails(enrolled);
        } catch (err) {
            console.error(
                "Dashboard fetch error:",
                err
            );

            setDashboardData({
                enrolledCourses: [],
            });

            setEnrolledCourseDetails([]);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        let mounted = true;

        const loadPage = async () => {
            try {
                setLoading(true);
                setError(null);

                // ------------------------------------------------
                // IMPORTANT:
                // Load courses independently from dashboard.
                // ------------------------------------------------

                await Promise.all([
                    fetchCourses(),
                    fetchCategories(),
                    fetchDashboard(),
                ]);
            } catch (err) {
                console.error(
                    "CompanyCourses page loading error:",
                    err
                );

                if (mounted) {
                    setError(
                        "Unable to load courses. Please try again."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadPage();

        return () => {
            mounted = false;
        };
    }, []);

    // =========================================================
    // ASSESSMENT COMPLETE
    // =========================================================

    const handleAssessmentComplete = async () => {
        setShowAssessment(false);

        // Refresh dashboard only.
        // Courses are already independent.
        await fetchDashboard();
    };

    // =========================================================
    // USED CATEGORY NAMES
    // =========================================================

    const usedCategoryNames = useMemo(() => {
        const names = new Set();

        browseCourses.forEach((course) => {
            const category =
                getCourseCategory(course);

            if (category) {
                names.add(category);
            }
        });

        return names;
    }, [browseCourses]);

    // =========================================================
    // SORTED CATEGORIES
    // =========================================================

    const sortedCategories = useMemo(() => {
        const result = ["All"];

        // First use admin category ordering
        categoryList.forEach((category) => {
            const name =
                typeof category === "string"
                    ? category
                    : category?.name ||
                      category?.title ||
                      "";

            if (
                name &&
                usedCategoryNames.has(name) &&
                !result.includes(name)
            ) {
                result.push(name);
            }
        });

        // Add categories that exist in courses
        // but are missing from /api/categories
        browseCourses.forEach((course) => {
            const category =
                getCourseCategory(course);

            if (
                category &&
                !result.includes(category)
            ) {
                result.push(category);
            }
        });

        return result;
    }, [
        categoryList,
        browseCourses,
        usedCategoryNames,
    ]);

    // =========================================================
    // FILTER COURSES
    // =========================================================

    const filtered = useMemo(() => {
        const searchText =
            search.trim().toLowerCase();

        const result = browseCourses.filter(
            (course) => {
                const title =
                    getCourseTitle(course).toLowerCase();

                const category =
                    getCourseCategory(course);

                const matchesSearch =
                    !searchText ||
                    title.includes(searchText);

                const matchesCategory =
                    selectedCategory === "All" ||
                    category === selectedCategory;

                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );

        // ------------------------------------------------------
        // SEARCH SORT
        // ------------------------------------------------------

        if (searchText) {
            result.sort((a, b) => {
                const aTitle =
                    getCourseTitle(a).toLowerCase();

                const bTitle =
                    getCourseTitle(b).toLowerCase();

                const aStarts =
                    aTitle.startsWith(searchText);

                const bStarts =
                    bTitle.startsWith(searchText);

                if (aStarts && !bStarts) {
                    return -1;
                }

                if (!aStarts && bStarts) {
                    return 1;
                }

                return 0;
            });
        }

        return result;
    }, [
        browseCourses,
        search,
        selectedCategory,
    ]);

    // =========================================================
    // DEBUG
    // =========================================================

    useEffect(() => {
        console.log(
            "===================================="
        );

        console.log(
            "Total courses:",
            courses.length
        );

        console.log(
            "Browse courses:",
            browseCourses
        );

        console.log(
            "Filtered courses:",
            filtered
        );

        console.log(
            "Selected category:",
            selectedCategory
        );

        console.log(
            "===================================="
        );
    }, [
        courses,
        browseCourses,
        filtered,
        selectedCategory,
    ]);

    // =========================================================
    // ERROR
    // =========================================================

    if (error && !loading && browseCourses.length === 0) {
        return (
            <div className="cr-wrapper">
                <p className="cr-page-label">
                    Courses
                </p>

                <div className="cr-empty">
                    {error}

                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                setLoading(true);
                                setError(null);

                                await Promise.all([
                                    fetchCourses(),
                                    fetchCategories(),
                                ]);
                            } catch (err) {
                                setError(
                                    "Unable to load courses. Please try again."
                                );
                            } finally {
                                setLoading(false);
                            }
                        }}
                        style={{
                            marginTop: "15px",
                            padding: "10px 18px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="cr-wrapper">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <p className="cr-page-label">
                Courses
            </p>

            <p className="cr-page-subtitle">
                Browse available training courses.
                Contact the academy to enrol your
                employees.
            </p>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
                <div className="cr-loading">
                    Loading courses...
                </div>
            ) : browseCourses.length === 0 ? (
                <div className="cr-empty">
                    No courses available.
                </div>
            ) : (
                <div className="mc-browse">

                    {/* =========================================
                        SEARCH
                    ========================================= */}

                    <div className="mc-search-wrap">
                        <span className="mc-search-icon">
                            🔍
                        </span>

                        <input
                            className="mc-search"
                            type="text"
                            placeholder="Search for courses..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    {/* =========================================
                        CATEGORIES
                    ========================================= */}

                    {sortedCategories.length > 0 && (
                        <div className="mc-categories">
                            {sortedCategories.map(
                                (category) => (
                                    <button
                                        key={category}
                                        type="button"
                                        className={`
                                            mc-category-btn
                                            ${
                                                selectedCategory ===
                                                category
                                                    ? "active"
                                                    : ""
                                            }
                                        `}
                                        onClick={() =>
                                            setSelectedCategory(
                                                category
                                            )
                                        }
                                    >
                                        {category}
                                    </button>
                                )
                            )}
                        </div>
                    )}

                    {/* =========================================
                        COURSE GRID
                    ========================================= */}

                    {filtered.length === 0 ? (
                        <div className="cr-empty">
                            No courses found
                            {search
                                ? ` for "${search}"`
                                : ""}
                            .
                        </div>
                    ) : (
                        <div className="mc-grid">
                            {filtered.map(
                                (course) => {
                                    const courseId =
                                        course?._id ||
                                        course?.id ||
                                        course?.courseId;

                                    return (
                                        <CourseCard
                                            key={courseId}
                                            course={course}
                                            fromPortal={true}
                                        />
                                    );
                                }
                            )}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}