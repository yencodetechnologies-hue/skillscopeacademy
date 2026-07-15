import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "../../styles/SessionsBar.css"
import { API_URL } from "../../data/service"

const FALLBACK = [
    { day: "19", mon: "Jul", course: { title: "Working at Heights" },          startTime: "8:00am", location: "Sefton", spotsType: "ok",  spotsLabel: "8 spots"  },
    { day: "21", mon: "Jul", course: { title: "Confined Space Entry" },        startTime: "8:30am", location: "Sefton", spotsType: "low", spotsLabel: "2 left"   },
    { day: "22", mon: "Jul", course: { title: "Forklift Licence" },            startTime: "7:30am", location: "Sefton", spotsType: "ok",  spotsLabel: "12 spots" },
    { day: "23", mon: "Jul", course: { title: "First Aid (HLTAID011)" },       startTime: "8:00am", location: "Sefton", spotsType: "ok",  spotsLabel: "10 spots" },
    { day: "24", mon: "Jul", course: { title: "Traffic Control" },             startTime: "7:30am", location: "Sefton", spotsType: "low", spotsLabel: "3 left"   },
    { day: "25", mon: "Jul", course: { title: "EWP Boom Lift Licence" },       startTime: "8:00am", location: "Sefton", spotsType: "ok",  spotsLabel: "6 spots"  },
    { day: "26", mon: "Jul", course: { title: "Asbestos Awareness" },          startTime: "9:00am", location: "Sefton", spotsType: "ok",  spotsLabel: "15 spots" },
    { day: "28", mon: "Jul", course: { title: "Skid Steer Loader Licence" },   startTime: "7:30am", location: "Sefton", spotsType: "low", spotsLabel: "1 left"   },
]

function SessionsBar() {
    const navigate  = useNavigate()
    const [sessions, setSessions] = useState([])
    const [loading,  setLoading]  = useState(true)
    const trackRef  = useRef(null)
    const rafRef    = useRef(null)
    const posRef    = useRef(0)

    useEffect(() => {
        axios.get(`${API_URL}/api/schedules/upcoming?limit=12`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : []
                setSessions(data.length > 0 ? data : FALLBACK)
            })
            .catch(() => setSessions(FALLBACK))
            .finally(() => setLoading(false))
    }, [])

    // JS-driven marquee — immune to CSS animation bugs
    useEffect(() => {
        if (loading || sessions.length === 0) return
        const track = trackRef.current
        if (!track) return

        let paused = false
        const speed = 0.6  // px per frame

        const animate = () => {
            if (!paused) {
                posRef.current -= speed
                // Reset when first half scrolled out
                const half = track.scrollWidth / 2
                if (Math.abs(posRef.current) >= half) posRef.current = 0
                track.style.transform = `translateX(${posRef.current}px)`
            }
            rafRef.current = requestAnimationFrame(animate)
        }
        rafRef.current = requestAnimationFrame(animate)

        const pause  = () => { paused = true }
        const resume = () => { paused = false }
        track.addEventListener("mouseenter", pause)
        track.addEventListener("mouseleave", resume)

        return () => {
            cancelAnimationFrame(rafRef.current)
            track.removeEventListener("mouseenter", pause)
            track.removeEventListener("mouseleave", resume)
        }
    }, [sessions, loading])

    if (loading) return (
        <div className="sb-bar">
            <div className="sb-header">
                <div className="sb-label">Don't miss out</div>
                <div className="sb-heading">Upcoming Courses</div>
            </div>
            <div className="sb-scroll">
                <div className="sb-track">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="sb-chip sb-chip--skeleton">
                            <div className="sb-skeleton-date" />
                            <div className="sb-skeleton-info">
                                <div className="sb-skeleton-line sb-skeleton-line--title" />
                                <div className="sb-skeleton-line sb-skeleton-line--sub" />
                            </div>
                            <div className="sb-skeleton-pill" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    // Double the list for seamless loop
    const looped = [...sessions, ...sessions]

    return (
        <div className="sb-bar">
            <div className="sb-header">
                <div className="sb-label">Don't miss out</div>
                <div className="sb-heading">Upcoming Courses</div>
            </div>

            <div className="sb-scroll">
                <div className="sb-track" ref={trackRef}>
                    {looped.map((s, i) => (
                        <div
                            key={i}
                            className="sb-chip"
                            onClick={() => {
                                if (s.course?.slug) {
                                    navigate(`/book-now/course/${s.course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.sessionId}&date=${s.date}&time=${s.startTime}`)
                                } else if (s.course?.id) {
                                    navigate(`/book-now?courseId=${s.course.id}&scheduleId=${s.scheduleId}&sessionId=${s.sessionId}&date=${s.date}&time=${s.startTime}`)
                                } else {
                                    navigate("/courses")
                                }
                            }}
                        >
                            <div className={`sb-date${s.isSunday ? " sb-date--sunday" : ""}`}>
                                <div className="sb-day">{s.day}</div>
                                <div className="sb-mon">{s.mon}</div>
                            </div>

                            <div className="sb-info">
                                <div className="sb-course">{s.course?.title}</div>
                                <div className="sb-detail">
                                    {s.startTime}
                                    {s.location && s.location.toLowerCase() !== "face to face" ? ` · ${s.location}` : ""}
                                    {s.course?.price ? ` · $${s.course.price}` : ""}
                                </div>
                            </div>

                            <div className={`sb-spots sb-spots--${s.spotsType}`}>
                                <button onClick={e => e.stopPropagation()}>Book</button>
                                <p>{s.spotsLabel}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SessionsBar