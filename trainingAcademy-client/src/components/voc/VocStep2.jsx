import { useEffect, useMemo, useRef, useState } from "react"
import axios from "axios"
import "./VocStep2.css"
import { API_URL } from "../../data/service"



// Last-resort fallback so the form is still usable even if /api/courses fails.
const FALLBACK_COURSES = [
    "Conduct Telescopic materials handler operations",
    "Operate an order picking forklift truck",
    "Operate a counterbalance forklift",
    "Operate a reach forklift",
    "Conduct slinging and rigging",
    "Dogging",
    "Basic rigging",
    "Intermediate rigging",
    "Operate elevated work platform",
]

// Generate dates from today for next 90 days (weekdays only)
// Ensuring we respect Sydney time (AEST/AEDT) so "today" rolls over correctly.
function generateDates() {
    const dates = []
    
    // Get current time in Sydney
    const sydneyTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" }))
    sydneyTime.setHours(0, 0, 0, 0) // Start from beginning of Sydney today

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for (let i = 0; i < 90; i++) {
        const d = new Date(sydneyTime)
        d.setDate(sydneyTime.getDate() + i)
        const day = d.getDay()
        if (day !== 0) { // exclude Sunday
            dates.push(`${days[day]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`)
        }
    }
    return dates
}

const DATE_OPTIONS = generateDates()

function VocStep2({ courses, setCourses, onNext, onBack, preselectedCourseId }) {

    const [selected, setSelected] = useState("")
    const [openDate, setOpenDate] = useState(null) // index of open date dropdown

    // Dynamic courses pulled from /api/courses (mirrors CourseSelection.jsx).
    const [dbCourses, setDbCourses] = useState([])
    const [coursesLoading, setCoursesLoading] = useState(true)

    // Track whether we've already auto-added the deep-linked course so the
    // user can freely remove it without us re-adding it on every re-render.
    const seededRef = useRef(false)

    useEffect(() => {
        let alive = true
        axios.get(`${API_URL}/api/courses?status=Active`)
            .then(res => {
                if (!alive) return
                const list = Array.isArray(res.data) ? res.data : []
                setDbCourses(list)
            })
            .catch(() => { if (alive) setDbCourses([]) })
            .finally(() => { if (alive) setCoursesLoading(false) })
        return () => { alive = false }
    }, [])

    // Auto-seed the cart with the course the user clicked on the Course card
    // (or "Already Trained? Book VOC" on the Course Details page). For courses
    // that have variants we seed with the safer default — Without Experience
    // / Single License — so the user still picks the variant explicitly if
    // they want the alternative.
    useEffect(() => {
        if (seededRef.current) return
        if (!preselectedCourseId) return
        if (dbCourses.length === 0) return
        if (courses.length > 0) { seededRef.current = true; return }

        const match = dbCourses.find(c => String(c._id) === String(preselectedCourseId))
        if (!match?.title) return

        const pt = match.pricingType || (match.experienceBasedBooking ? "experience" : "standard")
        let seedName = match.title
        if (pt === "experience") seedName = `${match.title} (Without Experience)`
        else if (pt === "slbl")  seedName = `${match.title} (Single License)`

        const vPrice = match.vocPrice || match.sellingPrice || 150
        seededRef.current = true
        setCourses([{ name: seedName, price: vPrice, date: "" }])
    }, [preselectedCourseId, dbCourses, courses.length, setCourses])

    // Group titles by category and store their vocPrice
    const groupedTitles = useMemo(() => {
        if (dbCourses.length === 0) return null
        const groups = {}
        for (const c of dbCourses) {
            if (!c?.title) continue
            const cat = (typeof c.category === "string" && c.category)
                ? c.category
                : (c.category?.name || "Other")
            if (!groups[cat]) groups[cat] = new Set()

            const pt = c.pricingType || (c.experienceBasedBooking ? "experience" : "standard")
            const vPrice = c.vocPrice || c.sellingPrice || 150

            if (pt === "experience") {
                groups[cat].add(JSON.stringify({ name: `${c.title} (With Experience)`, price: vPrice }))
                groups[cat].add(JSON.stringify({ name: `${c.title} (Without Experience)`, price: vPrice }))
            } else if (pt === "slbl") {
                groups[cat].add(JSON.stringify({ name: `${c.title} (Single License)`, price: vPrice }))
                groups[cat].add(JSON.stringify({ name: `${c.title} (Both Licenses)`, price: vPrice }))
            } else {
                groups[cat].add(JSON.stringify({ name: c.title, price: vPrice }))
            }
        }
        const out = {}
        Object.keys(groups).sort().forEach(cat => {
            out[cat] = [...groups[cat]].map(s => JSON.parse(s)).sort((a, b) => a.name.localeCompare(b.name))
        })
        return out
    }, [dbCourses])

    const total = courses.reduce((sum, c) => sum + (Number(c.price) || 150), 0)

    const addCourse = () => {
        if (!selected) return
        const item = JSON.parse(selected)
        setCourses(prev => [...prev, { name: item.name, price: item.price, date: "" }])
        setSelected("")
    }

    const removeCourse = (i) => {
        setCourses(prev => prev.filter((_, idx) => idx !== i))
    }

    const setDate = (i, date) => {
        setCourses(prev => prev.map((c, idx) => idx === i ? { ...c, date } : c))
        setOpenDate(null)
    }

    const handleNext = () => {
        if (courses.length === 0) {
            alert("Please add at least one course.")
            return
        }
        for (const c of courses) {
            if (!c.date) {
                alert(`Please select a date for: ${c.name}`)
                return
            }
        }
        onNext()
    }

    // Determine display price (if only one item selected, show its price, else show default)
    const displayPrice = selected ? JSON.parse(selected).price : (courses[0]?.price || 150)

    return (
        <div className="v2-wrap">

            {/* Dark header */}
            <div className="v2-header">
                <h2 className="v2-header-title">Course Selection</h2>
                <p className="v2-header-sub">
                    Select the courses you wish to renew — <span className="v2-price-highlight">${displayPrice} per course</span>
                </p>
            </div>

            {/* Body */}
            <div className="v2-body">

                {/* Course picker */}
                <label className="v2-label">CHOOSE A COURSE</label>
                <div className="v2-select-wrap">
                    <select
                        className="v2-select"
                        value={selected}
                        onChange={e => setSelected(e.target.value)}
                        disabled={coursesLoading}
                    >
                        <option value="">
                            {coursesLoading ? "Loading courses..." : "Select a course to add..."}
                        </option>

                        {groupedTitles
                            ? Object.entries(groupedTitles).map(([cat, titles]) => (
                                <optgroup key={cat} label={cat}>
                                    {titles.map(t => <option key={t.name} value={JSON.stringify(t)}>{t.name}</option>)}
                                </optgroup>
                            ))
                            : FALLBACK_COURSES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))
                        }
                    </select>
                    <span className="v2-chevron">▾</span>
                </div>

                <button className="v2-add-btn" onClick={addCourse}>
                    + &nbsp; Add Course
                </button>

                {/* Course list */}
                {courses.length === 0 ? (
                    <div className="v2-empty-box">
                        <span className="v2-empty-icon">📅</span>
                        <p className="v2-empty-text">No courses selected yet</p>
                        <p className="v2-empty-hint">Add courses from the dropdown above</p>
                    </div>
                ) : (
                    <div className="v2-course-list">
                        {courses.map((c, i) => (
                            <div key={i} className="v2-course-card">
                                <div className="v2-course-top">
                                    <div className="v2-course-info">
                                        <span className="v2-course-check">✔</span>
                                        <div>
                                            <p className="v2-course-name">{c.name}</p>
                                            <p className="v2-course-price">${Number(c.price || 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <button className="v2-delete-btn" onClick={() => removeCourse(i)}>🗑</button>
                                </div>

                                {/* Date picker */}
                                <div className="v2-date-section">
                                    <label className="v2-date-label">SELECT COURSE DATE *</label>
                                    <div className="v2-date-select-wrap">
                                        <div
                                            className="v2-date-trigger"
                                            onClick={() => setOpenDate(openDate === i ? null : i)}
                                        >
                                            <span className={c.date ? "v2-date-value" : "v2-date-placeholder"}>
                                                {c.date || "Choose an available date..."}
                                            </span>
                                            <span className="v2-chevron">▾</span>
                                        </div>

                                        {openDate === i && (
                                            <div className="v2-date-dropdown">
                                                {DATE_OPTIONS.map(d => (
                                                    <div
                                                        key={d}
                                                        className={`v2-date-option ${c.date === d ? "v2-date-selected" : ""}`}
                                                        onClick={() => setDate(i, d)}
                                                    >
                                                        {d}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {!c.date && (
                                        <p className="v2-date-warning">⚠ Please select a date to continue</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="v2-footer">
                    <div className="v2-total">
                        <p className="v2-total-label">TOTAL ({courses.length} COURSE{courses.length !== 1 ? "S" : ""})</p>
                        <p className="v2-total-amount">${total.toFixed(2)}</p>
                    </div>
                    <div className="v2-footer-btns">
                        <button className="v2-back-btn" onClick={onBack}>‹ &nbsp; BACK</button>
                        <button className="v2-next-btn" onClick={handleNext}>
                            CONTINUE TO PAYMENT &nbsp; ›
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default VocStep2