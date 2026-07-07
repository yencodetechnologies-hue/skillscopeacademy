import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../../styles/SessionsBar.css"
import { API_URL } from "../../data/service"

// Spot count → type
function getSpotsType(spotsLeft) {
    if (spotsLeft === null || spotsLeft === undefined) return "ok"
    if (spotsLeft <= 3)  return "low"
    if (spotsLeft === 0) return "full"
    return "ok"
}

function getSpotsLabel(spotsLeft) {
    if (spotsLeft === null || spotsLeft === undefined) return "Available"
    if (spotsLeft === 0) return "Full"
    return `${spotsLeft} spots`
}

// Format date → { day, mon }
function formatDate(dateStr) {
    const d   = new Date(dateStr)
    const day = d.getDate().toString()
    const mon = d.toLocaleString("en-AU", { month: "short" })
    return { day, mon }
}

function SessionsBar() {
    const navigate = useNavigate()
    const [sessions, setSessions] = useState([])
    const [loading,  setLoading]  = useState(true)

    useEffect(() => {
        axios.get(`${API_URL}/api/schedules/upcoming?limit=10`)
            .then(res => setSessions(res.data))
            .catch(err => console.error("SessionsBar fetch error:", err))
            .finally(() => setLoading(false))
    }, [])

    // Don't render bar if no sessions
    if (!loading && sessions.length === 0) return null

    return (
        <div className="sb-bar">
            <div className="sb-label">Don't miss out</div>

            <div className="sb-scroll">
                <div className="sb-marquee">
                    {/* Loading skeletons */}
                    {loading && Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="sb-chip sb-chip--skeleton">
                            <div className="sb-skeleton-date" />
                            <div className="sb-skeleton-info">
                                <div className="sb-skeleton-line sb-skeleton-line--title" />
                                <div className="sb-skeleton-line sb-skeleton-line--sub" />
                            </div>
                            <div className="sb-skeleton-pill" />
                        </div>
                    ))}

                    {/* Actual sessions duplicated for infinite scroll */}
                    {!loading && [...sessions, ...sessions, ...sessions].map((s, i) => {
                        return (
                            <div
                                key={`${s.sessionId || i}-${i}`}
                                className="sb-chip"
                                onClick={() =>  navigate(s.course.slug
                                    ? `/book-now/course/${s.course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.sessionId}&date=${s.date}&time=${s.startTime}`
                                    : `/book-now?courseId=${s.course.id}&scheduleId=${s.scheduleId}&sessionId=${s.sessionId}&date=${s.date}&time=${s.startTime}`
                                )}
                            >
                                <div className={`sb-date ${s.isSunday ? "sb-date--sunday" : ""}`}>
                                    <div className="sb-day">{s.day}</div>
                                    <div className="sb-mon">{s.mon}</div>
                                </div>

                                <div className="sb-info">
                                    <div className="sb-course">{s.course.title}</div>
                                    <div className="sb-detail">
                                        {s.startTime} {s.location && s.location.toLowerCase() !== "face to face" ? `· ${s.location}` : ""} {s.course.price ? `· $${s.course.price}` : ""}
                                    </div>
                                </div>

                                <div className={`sb-spots sb-spots--${s.spotsType}`}>
                                    <button>Book</button>
                                    <p>{s.spotsLabel}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default SessionsBar