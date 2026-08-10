import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../../styles/SessionsBar.css"
import { API_URL } from "../../data/service"

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];
const MONTH_ABBRS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Strictly parse ISO date strings to eliminate timezone shifts
const parseIsoDate = (dateStr) => {
    if (!dateStr) return null;
    const str = typeof dateStr === "string" ? dateStr : new Date(dateStr).toISOString();
    const datePart = str.split("T")[0]; // E.g., "2026-08-11"
    const parts = datePart.split("-").map(Number);
    if (parts.length < 3) return null;

    const year = parts[0];
    const monthIndex = parts[1] - 1; // 0-based index
    const day = parts[2];

    return {
        year,
        monthIndex,
        day,
        monAbbr: MONTH_ABBRS[monthIndex],
        matchKey: `${year}-${monthIndex}-${day}`
    };
};

function SessionsBar() {
    const navigate = useNavigate()
    const [sessions, setSessions] = useState([])
    const [selectedCourse, setSelectedCourse] = useState("ALL") 
    const [selectedDateKey, setSelectedDateKey] = useState(null)
    const [selectedTimeId, setSelectedTimeId] = useState(null)
    const [loading, setLoading] = useState(true)

    // Calendar view date
    const [currentCalDate, setCurrentCalDate] = useState(new Date())

    useEffect(() => {
        axios.get(`${API_URL}/api/schedules/upcoming?limit=50`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : []
                setSessions(data)

                // Auto-set calendar month to match the earliest session date
                if (data.length > 0 && data[0].date) {
                    const parsed = parseIsoDate(data[0].date)
                    if (parsed) {
                        setCurrentCalDate(new Date(parsed.year, parsed.monthIndex, 1))
                    }
                }
            })
            .catch(err => {
                console.error("❌ Error fetching sessions:", err)
                setSessions([])
            })
            .finally(() => setLoading(false))
    }, [])

    const slugify = (text) => {
        if (!text) return "course"
        return text.toString().toLowerCase().trim().replace(/[\s\W-]+/g, "-")
    }

    // Extract unique course titles for the select dropdown
    const coursesList = useMemo(() => {
        const map = new Map()
        sessions.forEach(item => {
            const title = item.course?.title
            if (title && !map.has(title)) {
                map.set(title, item.course)
            }
        })
        return Array.from(map.values())
    }, [sessions])

    // Group flat sessions into strict date buckets (prevents session merging)
    const datesMap = useMemo(() => {
        const map = new Map()

        const filtered = sessions.filter(s => {
            if (!selectedCourse || selectedCourse === "ALL") return true
            return s.course?.title?.toLowerCase() === selectedCourse.toLowerCase()
        })

        filtered.forEach(session => {
            const parsed = parseIsoDate(session.date)
            if (!parsed) return

            const { matchKey, year, monthIndex, day, monAbbr } = parsed

            if (!map.has(matchKey)) {
                map.set(matchKey, {
                    matchKey,
                    year,
                    monthIndex,
                    day,
                    mon: monAbbr,
                    sessions: []
                })
            }

            // Directly push the session into its specific date bucket
            map.get(matchKey).sessions.push(session)
        })

        return map
    }, [sessions, selectedCourse])

    // Selected date sessions container
    const activeDateObj = useMemo(() => {
        if (!selectedDateKey) return null
        return datesMap.get(selectedDateKey) || null
    }, [datesMap, selectedDateKey])

    // Calendar grid matrix builder
    const calendarDays = useMemo(() => {
        const year = currentCalDate.getFullYear()
        const monthIndex = currentCalDate.getMonth()

        const firstDayIndex = new Date(year, monthIndex, 1).getDay()
        const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate()

        const days = []
        for (let i = 0; i < firstDayIndex; i++) {
            days.push(null)
        }

        for (let d = 1; d <= totalDaysInMonth; d++) {
            const matchKey = `${year}-${monthIndex}-${d}`
            const hasSlots = datesMap.has(matchKey)
            const dateData = hasSlots ? datesMap.get(matchKey) : null

            days.push({
                dayNumber: d,
                matchKey,
                hasSlots,
                slotsCount: dateData ? dateData.sessions.length : 0
            })
        }
        return days
    }, [currentCalDate, datesMap])

    const handlePrevMonth = () => {
        setCurrentCalDate(new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
        setCurrentCalDate(new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() + 1, 1))
    }

    const handleSlotClick = (slot) => {
        setSelectedTimeId(slot.sessionId)

        const slug = slot.course?.slug || slugify(slot.course?.title)
        const queryParams = new URLSearchParams({
            scheduleId: slot.scheduleId || "",
            sessionId: slot.sessionId || "",
            date: slot.date || "",
            time: slot.startTime || "",
            step: "2"
        }).toString();

        setTimeout(() => {
            navigate(`/book-now/course/${slug}?${queryParams}`)
        }, 150)
    }

    if (loading) {
        return (
            <div className="sb-section">
                <div className="sb-container">
                    <div className="sb-grid-layout">
                        <div className="sb-sidebar sb-skeleton-box" />
                        <div className="sb-main-content sb-skeleton-box" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <section className="sb-section">
            <div className="sb-container">
                  <div className="sb-header">
                            <span className="cs-label">Fast Booking</span>
                            <h2 className="cs-title">Select Date & Time</h2>
                        </div>

                <div className="sb-grid-layout">
                    
                    
                    {/* ===== LEFT SIDEBAR: CALENDAR & FILTERS ===== */}
                    <aside className="sb-sidebar">
                      
                        {/* Course Filter Dropdown */}
                        <div className="sb-field-group">
                            <label htmlFor="course-select" className="sb-label">Select Course</label>
                            <div className="sb-select-wrapper">
                                <select
                                    id="course-select"
                                    value={selectedCourse}
                                    onChange={(e) => {
                                        setSelectedCourse(e.target.value)
                                        setSelectedDateKey(null)
                                        setSelectedTimeId(null)
                                    }}
                                >
                                    <option value="ALL">All Courses</option>
                                    {coursesList.map((c, idx) => (
                                        <option key={idx} value={c.title}>{c.title}</option>
                                    ))}
                                </select>
                                <span className="sb-select-chevron">▾</span>
                            </div>
                        </div>

                        {/* Calendar */}
                        <div className="sb-calendar-wrapper">
                            {/* <div className="sb-step-header">
                                <span className="sb-step-num">1</span>
                                <span className="sb-step-title">Choose Date</span>
                            </div> */}

                            <div className="sb-calendar-card">
                                <div className="sb-cal-header">
                                    <button type="button" onClick={handlePrevMonth} className="sb-cal-nav-btn">‹</button>
                                    <span className="sb-cal-month-title">
                                        {MONTH_NAMES[currentCalDate.getMonth()]} {currentCalDate.getFullYear()}
                                    </span>
                                    <button type="button" onClick={handleNextMonth} className="sb-cal-nav-btn">›</button>
                                </div>

                                <div className="sb-cal-weekdays">
                                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                                </div>

                                <div className="sb-cal-grid">
                                    {calendarDays.map((item, index) => {
                                        if (!item) {
                                            return <div key={`empty-${index}`} className="sb-cal-day sb-cal-day--empty" />
                                        }

                                        const isSelected = selectedDateKey === item.matchKey

                                        return (
                                            <button
                                                type="button"
                                                key={item.matchKey}
                                                disabled={!item.hasSlots}
                                                className={`sb-cal-day ${
                                                    item.hasSlots ? "sb-cal-day--available" : "sb-cal-day--disabled"
                                                } ${isSelected ? "sb-cal-day--selected" : ""}`}
                                                onClick={() => {
                                                    const nextKey = isSelected ? null : item.matchKey
                                                    setSelectedDateKey(nextKey)
                                                    setSelectedTimeId(null)
                                                }}
                                            >
                                                <span className="sb-cal-day-num">{item.dayNumber}</span>
                                                {item.hasSlots && <span className="sb-cal-dot" />}
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* <div className="sb-cal-legend">
                                    <div className="sb-legend-item">
                                        <span className="sb-legend-color sb-legend-color--available" />
                                        <span>Available (Green)</span>
                                    </div>
                                    <div className="sb-legend-item">
                                        <span className="sb-legend-color sb-legend-color--selected" />
                                        <span>Selected</span>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </aside>

                    {/* ===== RIGHT CONTENT: TIME SLOTS FOR SELECTED DATE ===== */}
                    <main className="sb-main-content">
                        <div className="sb-step-header">
                            {/* <span className="sb-step-num">2</span> */}
                            <span className="sb-step-title">
                                {activeDateObj 
                                    ? `Available Slots on ${activeDateObj.day} ${activeDateObj.mon} (${activeDateObj.sessions.length})`
                                    : "Available Time Slots"
                                }
                            </span>
                        </div>

                        {!selectedDateKey ? (
                           <div className="sb-prompt-card">
    <div className="sb-prompt-icon">🟡</div>
    <h3>Select an Available Date</h3>
    <p>
        Click any <span className="sb-highlight-badge">highlighted date</span> on the calendar to view its time slots.
    </p>
</div>
                        ) : (
                            <div className="sb-slots-list sb-fade-in">
                                {activeDateObj?.sessions.map((slot) => {
                                    const isTimeSelected = selectedTimeId === slot.sessionId

                                    return (
                                        <div
                                            key={slot.sessionId}
                                            className={`sb-slot-card ${isTimeSelected ? "sb-slot-card--active" : ""}`}
                                            onClick={() => handleSlotClick(slot)}
                                        >
                                            <div className="sb-slot-time-col">
                                                <span className="sb-slot-time">{slot.startTime}</span>
                                                <span className="sb-slot-course-title">{slot.course?.title}</span>
                                            </div>

                                            <div className="sb-slot-info-col">
                                                {slot.location && (
                                                    <span className="sb-slot-tag">📍 {slot.location}</span>
                                                )}
                                                {slot.course?.price && (
                                                    <span className="sb-slot-price">${slot.course.price} AUD</span>
                                                )}
                                            </div>

                                            <div className="sb-slot-cta-col">
                                                <span className={`sb-status-pill sb-status--${slot.spotsType}`}>
                                                    {slot.spotsLabel}
                                                </span>
                                                <button type="button" className="sb-book-btn">
                                                    Book Now <span>➔</span>
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </main>

                </div>
            </div>
        </section>
    )
}

export default SessionsBar