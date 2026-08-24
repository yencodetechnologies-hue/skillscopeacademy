import { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import "./CompanyCourses.css";

import { API_URL } from "../../data/service";
import { ACTIVE_COURSES_URL } from "../../utils/courseStatus";
import { cdnImage } from "../../utils/cdnImage";

// Make sure this path matches your actual CourseCard file
import CourseCard from "../course/CourseCard";

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

    

    const location = useLocation();

    const [searchParams, setSearchParams] =
        useSearchParams();

    // =========================================================
    // TAB
    // =========================================================





    
    const [browseCourses, setBrowseCourses] =
        useState([]);

    const [categoryList, setCategoryList] =
        useState([]);


    const [error, setError] =
        useState(null);

    const [paymentData, setPaymentData] =
        useState({});


    // =========================================================
    // USER
    // =========================================================

    let user = null;

    try {

        const storedUser =
            localStorage.getItem("user");

        user =
            storedUser
                ? JSON.parse(storedUser)
                : null;

    } catch (error) {

        console.error(
            "Invalid user data in localStorage:",
            error
        );

        user = null;
    }


    const [userDetails, setUserDetails] =
        useState({
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
        });


    // =========================================================
    // FETCH DATA
    // =========================================================

    const fetchData = async () => {

        try {

            setLoading(true);
            setError(null);

            const studentId =
                user?.id ||
                user?._id ||
                user?.studentId;


            if (!studentId) {

                throw new Error(
                    "Student ID not found. Please login again."
                );
            }


            // =================================================
            // API REQUESTS
            // =================================================

            const [
                dashRes,
                coursesRes,
                catsRes,
            ] = await Promise.all([

                fetch(
                    `${API_URL}/api/student/dashboard/${studentId}`
                ),

                fetch(
                    `${API_URL}/api/courses`
                ),

                fetch(
                    `${API_URL}/api/categories`
                ),
            ]);


            // =================================================
            // CHECK RESPONSES
            // =================================================

            if (!dashRes.ok) {

                throw new Error(
                    "Failed to fetch dashboard data"
                );
            }

            if (!coursesRes.ok) {

                throw new Error(
                    "Failed to fetch courses"
                );
            }

            if (!catsRes.ok) {

                throw new Error(
                    "Failed to fetch categories"
                );
            }


            // =================================================
            // PARSE JSON
            // =================================================

            const dash =
                await dashRes.json();

            const coursesResponse =
                await coursesRes.json();

            const categoriesResponse =
                await catsRes.json();


            // =================================================
            // NORMALIZE COURSES RESPONSE
            // =================================================

            const courses =
                Array.isArray(coursesResponse)
                    ? coursesResponse
                    : coursesResponse?.courses ||
                      coursesResponse?.data ||
                      [];


            // =================================================
            // NORMALIZE CATEGORIES
            // =================================================

            const categories =
                Array.isArray(categoriesResponse)
                    ? categoriesResponse
                    : categoriesResponse?.categories ||
                      categoriesResponse?.data ||
                      [];


            // =================================================
            // SET DATA
            // =================================================

            setDashboardData(dash);

            setBrowseCourses(courses);

            setCategoryList(categories);

            setEnrolledCourseDetails(
                Array.isArray(dash?.enrolledCourses)
                    ? dash.enrolledCourses
                    : []
            );


        } catch (err) {

            console.error(
                "CompanyCourses fetch error:",
                err
            );


            // Don't show error for missing enrollment data
            if (
                !err.message?.includes(
                    "Student ID"
                )
            ) {

                setDashboardData({
                    enrolledCourses: [],
                });

                setEnrolledCourseDetails([]);

                // Keep course list usable if possible
                setBrowseCourses([]);

                setCategoryList([]);

            } else {

                setError(
                    err.message
                );
            }

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        fetchData();

    }, []);


    // =========================================================
    // ASSESSMENT COMPLETE
    // =========================================================

    const handleAssessmentComplete = () => {

        setShowAssessment(false);

        fetchData();
    };


    // =========================================================
    // FILTER COURSES
    // =========================================================

    const filtered = browseCourses
        .filter((course) => {

            const searchText =
                search
                    .trim()
                    .toLowerCase();


            const title =
                course?.title ||
                course?.name ||
                "";


            const matchesSearch =
                !searchText ||
                title
                    .toLowerCase()
                    .includes(searchText);


            const matchesCategory =
                selectedCategory === "All" ||
                course?.category ===
                    selectedCategory;


            return (
                matchesSearch &&
                matchesCategory
            );
        })
        .sort((a, b) => {

            if (!search.trim()) {
                return 0;
            }


            const searchText =
                search
                    .trim()
                    .toLowerCase();


            const aTitle =
                (
                    a?.title ||
                    a?.name ||
                    ""
                ).toLowerCase();


            const bTitle =
                (
                    b?.title ||
                    b?.name ||
                    ""
                ).toLowerCase();


            const aStarts =
                aTitle.startsWith(
                    searchText
                );

            const bStarts =
                bTitle.startsWith(
                    searchText
                );


            if (
                aStarts &&
                !bStarts
            ) {
                return -1;
            }


            if (
                !aStarts &&
                bStarts
            ) {
                return 1;
            }


            return 0;
        });


    // =========================================================
    // USED CATEGORIES
    // =========================================================

    const usedCategoryNames =
        new Set(
            browseCourses
                .map(
                    (course) =>
                        course?.category
                )
                .filter(Boolean)
        );


    // =========================================================
    // SORT CATEGORIES USING ADMIN ORDER
    // =========================================================

    const sortedCategories = [

        "All",

        ...categoryList
            .map(
                (category) =>
                    category?.name
            )
            .filter(
                (name) =>
                    name &&
                    usedCategoryNames.has(
                        name
                    )
            ),
    ];


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (
            <div className="cr-wrapper">

                <p className="cr-page-label">
                    Courses
                </p>

                <div className="cr-empty">

                    {error}

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
                SEARCH
            ================================================= */}

            {/* <div className="cr-search-wrap">

                <div className="cr-search-box">

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >

                        <circle
                            cx="11"
                            cy="11"
                            r="8"
                        />

                        <path
                            d="M21 21l-4.35-4.35"
                        />

                    </svg>


                    <input
                        className="cr-search-input"
                        type="text"
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>

            </div> */}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

                <div className="cr-loading">

                    Loading courses...

                </div>

            ) : filtered.length === 0 ? (

                <div className="cr-empty">

                    No courses found.

                </div>

            ) : (

                <div className="mc-browse">


                    {/* =========================================
                        SECOND SEARCH
                    ========================================= */}

                    <div className="mc-search-wrap">

                        <span className="mc-search-icon">
                            🔍
                        </span>

                        <input
                            className="mc-search"
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


                    {/* =========================================
                        COURSE GRID
                    ========================================= */}

                    <div className="mc-grid">

                        {filtered.map(
                            (course) => (

                                <CourseCard
                                    key={
                                        course?._id ||
                                        course?.id
                                    }
                                    course={course}
                                    fromPortal={true}
                                />

                            )
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}