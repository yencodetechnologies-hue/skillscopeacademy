import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../../styles/SessionsBar.css"
import { API_URL } from "../../data/service"

const FALLBACK = [
    { scheduleId: "6a79767da99dce108b4c15a0", sessionId: "6a79767da99dce108b4c15a1", date: "2026-08-11T00:00:00.000Z", day: "11", mon: "Aug", course: { id: "c1", slug: "conduct-civil-construction-excavator-operations-training-syd", title: "Excavator Operations Training", price: 220 }, startTime: "13:27", location: "Sefton", spotsType: "ok", spotsLabel: "8 spots" },
    { scheduleId: "6a79767da99dce108b4c15a2", sessionId: "6a79767da99dce108b4c15a3", date: "2026-08-12T00:00:00.000Z", day: "12", mon: "Aug", course: { id: "c2", slug: "working-at-heights", title: "Working at Heights", price: 250 }, startTime: "08:30", location: "Sefton", spotsType: "low", spotsLabel: "2 left" },
]

function SessionsBar() {
    const navigate = useNavigate()
    const [sessions, setSessions] = useState([])
    const [selectedCourse, setSelectedCourse] = useState("") // Empty initially so no dates show by default
    const [selectedDateKey, setSelectedDateKey] = useState(null)
    const [selectedTimeId, setSelectedTimeId] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`${API_URL}/api/schedules/upcoming?limit=12`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : []
                setSessions(data.length > 0 ? data : FALLBACK)
            })
            .catch(() => setSessions(FALLBACK))
            .finally(() => setLoading(false))
    }, [])

    const slugify = (text) => {
        if (!text) return "course"
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/[\s\W-]+/g, "-")
    }

    const handleSlotClick = (s) => {
        const slotId = s.sessionId || s.scheduleId
        setSelectedTimeId(slotId)

        const slug = s.course?.slug || slugify(s.course?.title)
        
        const queryParams = new URLSearchParams({
            scheduleId: s.scheduleId || "",
            sessionId: s.sessionId || "",
            date: s.date || "",
            time: s.startTime || s.time || "",
            step: "2"
        }).toString();

        setTimeout(() => {
            navigate(`/book-now/course/${slug}?${queryParams}`)
        }, 150)
    }

    const coursesList = useMemo(() => {
        const map = new Map()
        sessions.forEach(s => {
            if (s.course?.title) map.set(s.course.title, s.course)
        })
        return Array.from(map.values())
    }, [sessions])

    const filteredSessions = useMemo(() => {
        if (!selectedCourse) return []
        if (selectedCourse === "ALL") return sessions
        return sessions.filter(s => s.course?.title === selectedCourse)
    }, [sessions, selectedCourse])

    const datesMap = useMemo(() => {
        const map = new Map()
        filteredSessions.forEach(s => {
            const key = `${s.day}-${s.mon}`
            if (!map.has(key)) {
                map.set(key, {
                    key,
                    day: s.day,
                    mon: s.mon,
                    isSunday: s.isSunday,
                    sessions: []
                })
            }
            map.get(key).sessions.push(s)
        })
        return Array.from(map.values())
    }, [filteredSessions])

    const activeDateObj = useMemo(() => {
        if (!selectedDateKey) return null
        return datesMap.find(d => d.key === selectedDateKey) || null
    }, [datesMap, selectedDateKey])

    if (loading) {
        return (
            <div className="sb-section">
                <div className="sb-container">
                    <div className="sb-skeleton-header" />
                    <div className="sb-date-grid">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="sb-date-card sb-card--skeleton" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <section className="sb-section">
            <div className="sb-container">
                <div className="sb-filter-bar">
                    <div className="sb-header">
                        <span className="sb-badge">Fast Booking</span>
                        <h2 className="sb-title">Select Date & Timing</h2>
                    </div>

                    <div className="sb-dropdown-wrapper">
                        <label htmlFor="course-select" className="sb-dropdown-label">Select Course:</label>
                        <div className="sb-select-custom">
                            <select
                                id="course-select"
                                value={selectedCourse}
                                onChange={(e) => {
                                    setSelectedCourse(e.target.value)
                                    setSelectedDateKey(null)
                                    setSelectedTimeId(null)
                                }}
                            >
                                <option value="" disabled>-- Please Choose a Course --</option>
                                {/* <option value="ALL">All Available Courses ({coursesList.length})</option> */}
                                {coursesList.map((c, idx) => (
                                    <option key={idx} value={c.title}>{c.title}</option>
                                ))}
                            </select>
                            <span className="sb-select-arrow">▼</span>
                        </div>
                    </div>
                </div>

                {/* Initial State: Prompt Box when no course is chosen */}
                {!selectedCourse ? (
                    <div className="sb-prompt-box">
                        <div className="sb-prompt-icon">📚</div>
                        <h3 className="sb-prompt-title">Please Select a Course</h3>
                        {/* <p className="sb-prompt-text">
                            Select a course from the dropdown above to view all upcoming available dates and time slots.
                        </p> */}
                    </div>
                ) : (
                    <>
                        {/* Step 1: Choose Date */}
                        <div className="sb-step-wrapper">
                            <span className="sb-step-label">Step 1: Choose a Date</span>
                            {datesMap.length > 0 ? (
                                <div className="sb-date-grid">
                                    {datesMap.map((d) => {
                                        const isSelected = d.key === selectedDateKey
                                        return (
                                            <div
                                                key={d.key}
                                                className={`sb-date-card ${isSelected ? "sb-date-card--active" : ""}`}
                                                onClick={() => {
                                                    setSelectedDateKey(isSelected ? null : d.key)
                                                    setSelectedTimeId(null)
                                                }}
                                            >
                                                <div className={`sb-date-badge ${d.isSunday ? "sb-date-badge--sunday" : ""}`}>
                                                    <span className="sb-day">{d.day}</span>
                                                    <span className="sb-mon">{d.mon}</span>
                                                </div>
                                                <div className="sb-date-info">
                                                    <span className="sb-date-action-text">
                                                        {isSelected ? "Selected" : "Click to view times"}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="sb-empty-state">No dates available for this course.</div>
                            )}
                        </div>

                        {/* Step 2: Choose Time Slot */}
                        {activeDateObj && (
                            <div className="sb-step-wrapper sb-fade-in">
                                <span className="sb-step-label">
                                    Step 2: Select Time for {activeDateObj.day} {activeDateObj.mon}
                                </span>

                                <div className="sb-slots-grid">
                                    {activeDateObj.sessions.map((s, idx) => {
                                        const currentId = s.sessionId || s.scheduleId || idx
                                        const isTimeSelected = selectedTimeId === currentId

                                        return (
                                            <div
                                                key={currentId}
                                                className={`sb-time-card ${isTimeSelected ? "sb-time-card--active" : ""}`}
                                                onClick={() => handleSlotClick(s)}
                                            >
                                                <div className="sb-time-primary">
                                                    <span className="sb-time-text">{s.startTime || s.time}</span>
                                                    <span className="sb-time-course">{s.course?.title}</span>
                                                </div>

                                                <div className="sb-time-details">
                                                    {s.location && s.location.toLowerCase() !== "face to face" && (
                                                        <span className="sb-loc-text">📍 {s.location}</span>
                                                    )}
                                                    {s.course?.price && (
                                                        <span className="sb-price-text">${s.course.price}</span>
                                                    )}
                                                </div>

                                                <div className="sb-time-action">
                                                    <span className={`sb-status-pill sb-status--${s.spotsType}`}>
                                                        {s.spotsLabel}
                                                    </span>
                                                    <span className="sb-arrow-btn">➔</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    )
}

export default SessionsBar