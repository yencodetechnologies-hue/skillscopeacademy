import { useEffect, useState } from "react"
import axios from "axios"
import CourseCard from "./CourseCard"
import "../../styles/CoursesSection.css"
import { API_URL } from "../../data/service"
import { ACTIVE_COURSES_URL, filterActiveCourses } from "../../utils/courseStatus"

function CoursesSection() {
    const [courses, setCourses] = useState([])
    const [categoryOrder, setCategoryOrder] = useState([]) // ✅ from Category model
    const [expanded, setExpanded] = useState({})
    const [activeTab, setActiveTab] = useState(null)

    useEffect(() => {
        // ✅ Fetch both courses and categories in parallel
        Promise.all([
            axios.get(ACTIVE_COURSES_URL(API_URL)),
            axios.get(`${API_URL}/api/categories`),
        ]).then(([coursesRes, catsRes]) => {
            setCourses(filterActiveCourses(coursesRes.data))
            // Category model order (sorted by order field)
            setCategoryOrder(catsRes.data.filter(c => c.active !== false).map(c => c.name))
            // Set first category as active tab
            const firstCat = catsRes.data.find(c => c.active !== false)?.name
            setActiveTab(firstCat || null)
        })
    }, [])

    // ✅ Sort categories by Category model order
    const allCourseCats = [...new Set(courses.map(c => c.category))]
    const categories = categoryOrder.length > 0
        ? categoryOrder.filter(name => allCourseCats.includes(name))
        : allCourseCats

    const toggleShow = (category) => {
        setExpanded(prev => ({
            ...prev,
            [category]: !prev[category]
        }))
    }

    const categoryCourses = courses.filter(c => c.category === activeTab)
    const visibleCourses = expanded[activeTab]
        ? categoryCourses
        : categoryCourses.slice(0, 8)

    return (
        <div className="cs-wrap">
            <section className="cs-section">

                {/* HEADER */}
                <div className="cs-header">
                    <div className="cs-label">All courses</div>
                    <div className="cs-title">Browse &amp; Book</div>
                    <div className="cs-sub">
                        Nationally recognised training. Certificate issued same day. Same-week sessions available.
                    </div>
                </div>

                {/* TAB NAV */}
                 <div className="cs-content-layout">

            {/* LEFT TAB SIDEBAR */}
            <div className="cs-tab-sidebar">
                <div className="cs-tab-heading">
                    <span>Categories</span>
                </div>

                <div className="cs-tab-nav">
                    {categories.map((category) => (
                       <button
    key={category}
    type="button"
    className={`cs-tab-btn ${activeTab === category ? "cs-tab-btn--active" : ""}`}
    onClick={() => setActiveTab(category)}
>
    {activeTab === category && (
        <>
            <span className="cs-notch cs-notch--top" />
            <span className="cs-notch cs-notch--bottom" />
        </>
    )}
    <span className="cs-tab-label">{category}</span>
    <span className="cs-tab-count">
        {courses.filter(course => course.category === category).length}
    </span>
</button>
                    ))}
                </div>
            </div>

            {/* RIGHT COURSE AREA */}
            <div className="cs-course-area">

                {activeTab && (
                    <>
                        <div className="cs-course-header">
                            <div>
                                <span className="cs-course-kicker">
                                    Selected Category
                                </span>

                                <h3>{activeTab}</h3>
                            </div>

                            <span className="cs-course-total">
                                {categoryCourses.length} Courses
                            </span>
                        </div>

                        <div className="cs-panels-wrap">
                        {activeTab && (
                            <div className="cs-grid">
                                {visibleCourses.map(course => (
                                    <CourseCard key={course._id} course={course} />
                                ))}

                                {/* More card */}
                                
                            </div>
                        )}

                        {/* Show more / less */}
                        {categoryCourses.length > 8 && (
                            <div className="cs-show-more-wrap">
                                <button
                                    className="cs-show-more-btn"
                                    onClick={() => toggleShow(activeTab)}
                                >
                                    {expanded[activeTab]
                                        ? "Show Less"
                                        : `See More ${activeTab} →`}
                                </button>
                            </div>
                        )}
                    </div>
                    </>
                )}

            </div>
        </div>

            </section>
        </div>
    )
}

export default CoursesSection