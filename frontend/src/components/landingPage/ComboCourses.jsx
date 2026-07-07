import { useEffect, useState } from "react"
import PublicNavbar from "../PublicNavbar"
import Footer from "./Footer"
import CourseCard from "../course/CourseCard"
import "../../styles/AllCourses.css"
import { API_URL } from "../../data/service"
import { filterActiveCourses } from "../../utils/courseStatus"

function ComboCourses() {
    const [courses, setCourses] = useState([])
    const [allCourses, setAllCourses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API_URL}/api/courses?status=Active`)
            .then(res => res.json())
            .then(data => {
                const list = filterActiveCourses(Array.isArray(data) ? data : [])
                setAllCourses(list)
                const combo = list.filter(
                    (c) =>
                        c?.comboEnabled === true ||
                        c?.category?.toLowerCase().includes("combo")
                )
                setCourses(combo)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <section>
            <PublicNavbar courses={allCourses} />
            <div className="all-courses-wrapper">
                <div className="all-courses-header">
                    <h2>Combo Courses</h2>
                    <p>
                        {loading
                            ? "Loading combo offers..."
                            : `Save more with our package deals — ${courses.length} package${courses.length !== 1 ? "s" : ""} available`}
                    </p>
                </div>

                {loading ? (
                    <div className="all-courses-grid">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="course-card-skeleton" />
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="no-courses">
                        No combo offers available right now. Please check back soon.
                    </div>
                ) : (
                    <div className="all-courses-grid">
                        {courses.map(course => (
                            <CourseCard key={course._id} course={course} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </section>
    )
}

export default ComboCourses
