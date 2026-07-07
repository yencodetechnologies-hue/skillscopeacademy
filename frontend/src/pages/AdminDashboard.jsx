// import { useState, useEffect } from "react"
// import "../styles/AdminDashboard.css"
// import VOCStatsCard from "../components/voc/VocStatsCard"
// import QuickActions from "../components/QuickActions"
// import { API_URL } from "../data/service"

// function AdminDashboard() {

//     const [bookings, setBookings] = useState({})
//     const [currentDate, setCurrentDate] = useState(new Date())
//     const [vocStats, setVocStats] = useState({ pending: 0, verified: 0, total: 0 })

//     const fetchBookings = async (date) => {
//         try {
//             const isoDate = new Date(date).toISOString()
//             const response = await fetch(`${API_URL}/api/flow/weekly?date=${encodeURIComponent(isoDate)}`)
//             if (!response.ok) throw new Error("Failed to load booking counts")
//             const data = await response.json()
//             setBookings(data.counts || {})
//         } catch (error) {
//             console.error("Admin dashboard weekly bookings error:", error)
//             setBookings({})
//         }
//     }

//     const fetchVocStats = async () => {
//         try {
//             const res = await fetch(`${API_URL}/api/voc/stats`)
//             if (!res.ok) throw new Error("Failed to load VOC stats")
//             const data = await res.json()
//             setVocStats({
//                 pending:  data.pending  || 0,
//                 verified: data.verified || 0,
//                 total:    data.total    || 0,
//             })
//         } catch (error) {
//             console.error("Admin dashboard VOC stats error:", error)
//             setVocStats({ pending: 0, verified: 0, total: 0 })
//         }
//     }

//     useEffect(() => {
//         fetchBookings(currentDate)
//     }, [currentDate])

//     useEffect(() => {
//         fetchVocStats()
//     }, [])

//     const getWeek = (date) => {
//         const start = new Date(date)
//         const day = start.getDay()
//         const diff = start.getDate() - day + (day === 0 ? -6 : 1)
//         start.setDate(diff)
//         let week = []
//         for (let i = 0; i < 7; i++) {
//             let d = new Date(start)
//             d.setDate(start.getDate() + i)
//             week.push(d)
//         }
//         return week
//     }

//     const week = getWeek(currentDate)
//     const start = week[0]
//     const end = week[6]
//     const range = `${start.getDate()} ${start.toLocaleString("en", { month: "short" })} - ${end.getDate()} ${end.toLocaleString("en", { month: "short" })} ${end.getFullYear()}`

//     const prevWeek = () => {
//         const newDate = new Date(currentDate)
//         newDate.setDate(currentDate.getDate() - 7)
//         setCurrentDate(newDate)
//     }

//     const nextWeek = () => {
//         const newDate = new Date(currentDate)
//         newDate.setDate(currentDate.getDate() + 7)
//         setCurrentDate(newDate)
//     }

//     return (
//         <section>
//             <div>
//                 <div className="calandar-div">

//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className="calander-dates">
//                         <h3>📅 Bookings This Week</h3>
//                         <div className="week-navigation">
//                             <button onClick={prevWeek}>‹</button>
//                             <span>{range}</span>
//                             <button onClick={nextWeek}>›</button>
//                         </div>
//                     </div>

//                     <div style={{ overflowX: "auto" }}>
//                         <div style={{
//                             display: "grid",
//                             gridTemplateColumns: "repeat(7,1fr)",
//                             gap: "15px",
//                             marginTop: "20px",
//                             minWidth: "460px"
//                         }}>
//                             {week.map((day) => {
//                                 const y = day.getFullYear()
//                                 const m = String(day.getMonth() + 1).padStart(2, "0")
//                                 const d = String(day.getDate()).padStart(2, "0")
//                                 const formatted = `${y}-${m}-${d}`
//                                 const count = bookings[formatted] || 0
//                                 return (
//                                     <div className="calandar-dates" key={formatted}>
//                                         <p className="calendar-day">
//                                             {day.toLocaleDateString("en-US", { weekday: "short" })}
//                                         </p>
//                                         <h3>{day.getDate()}</h3>
//                                         <p className="booking-count">{count}</p>
//                                     </div>
//                                 )
//                             })}
//                         </div>
//                     </div>

//                 </div>
//                 <VOCStatsCard
//                     pending={vocStats.pending}
//                     verified={vocStats.verified}
//                     total={vocStats.total}
//                 />
//                 <QuickActions />
//             </div>
//         </section>
//     )
// }

// export default AdminDashboard

import { useState, useEffect, useRef, useCallback } from "react"
import "../styles/AdminDashboard.css"
import VOCStatsCard from "../components/voc/VocStatsCard"
import QuickActions from "../components/QuickActions"
import { API_URL } from "../data/service"

const PAGE_SIZE = 3

function DailyStudentsModal({ date, anchorRef, onClose, onMouseEnter, onMouseLeave }) {
    const [students, setStudents] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const modalRef = useRef(null)

    const fetchStudents = useCallback(async (p) => {
        if (!date) return
        setLoading(true)
        try {
            const res = await fetch(
                `${API_URL}/api/flow/daily-students?date=${date}&page=${p}&limit=${PAGE_SIZE}`
            )
            const data = await res.json()
            setStudents(data.data || [])
            setTotalPages(data.totalPages || 1)
            setTotal(data.total || 0)
        } catch (e) {
            console.error("Daily students fetch error:", e)
        } finally {
            setLoading(false)
        }
    }, [date])

    useEffect(() => { setPage(1); fetchStudents(1) }, [date, fetchStudents])
    useEffect(() => { fetchStudents(page) }, [page, fetchStudents])

    const [pos, setPos] = useState({ top: 0, left: 0 })
    useEffect(() => {
        if (anchorRef?.current) {
            const rect = anchorRef.current.getBoundingClientRect()
            const modalW = 720
            let left = rect.left + window.scrollX
            if (left + modalW > window.innerWidth - 10) left = window.innerWidth - modalW - 10
            setPos({ top: rect.bottom + window.scrollY + 6, left: Math.max(10, left) })
        }
    }, [anchorRef])

    const formatDate = (d) => {
        if (!d) return "—"
        const [y, m, day] = d.split("-")
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`
    }

    return (
        <div
            ref={modalRef}
            className="daily-modal"
            style={{ top: pos.top, left: pos.left }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="daily-modal-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="daily-modal-title">📅 {formatDate(date)}</span>
                    <span className="daily-modal-count">{total} booking{total !== 1 ? "s" : ""}</span>
                </div>
                <button className="daily-modal-close" onClick={onClose}>✕</button>
            </div>

            {loading ? (
                <div className="daily-modal-loading">Loading...</div>
            ) : students.length === 0 ? (
                <div className="daily-modal-empty">No bookings for this date.</div>
            ) : (
                <>
                    <div className="daily-modal-table-wrap">
                        <table className="daily-modal-table">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Type</th>
                                    <th>Course Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s) => (
                                    <tr key={s.bookingId}>
                                        <td><span className="booking-id-chip">{s.bookingId}</span></td>
                                        <td className="name-cell">{s.name}</td>
                                        <td className="email-cell">{s.email}</td>
                                        <td>{s.phone}</td>
                                        <td>
                                            <span className={`type-badge type-${(s.type || "").toLowerCase()}`}>
                                                {s.type}
                                            </span>
                                        </td>
                                        <td>{s.courseScheduleDate}</td>
                                        <td>
                                            <span className={`status-badge status-${s.status}`}>
                                                {s.status === "active" ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="daily-modal-pagination">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                ‹ Prev
                            </button>
                            <span>Page {page} of {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                                Next ›
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

function AdminDashboard() {
    const [bookings, setBookings] = useState({})
    const [currentDate, setCurrentDate] = useState(new Date())
    const [vocStats, setVocStats] = useState({ pending: 0, verified: 0, total: 0 })
    const [modalDate, setModalDate] = useState(null)
    const dayRefs = useRef({})
    const hideTimerRef = useRef(null)

    const fetchBookings = async (date) => {
        try {
            const isoDate = new Date(date).toISOString()
            const response = await fetch(`${API_URL}/api/flow/weekly?date=${encodeURIComponent(isoDate)}`)
            if (!response.ok) throw new Error("Failed to load booking counts")
            const data = await response.json()
            setBookings(data.counts || {})
        } catch (error) {
            console.error("Admin dashboard weekly bookings error:", error)
            setBookings({})
        }
    }

    const fetchVocStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/voc/stats`)
            if (!res.ok) throw new Error("Failed to load VOC stats")
            const data = await res.json()
            setVocStats({ pending: data.pending || 0, verified: data.verified || 0, total: data.total || 0 })
        } catch (error) {
            setVocStats({ pending: 0, verified: 0, total: 0 })
        }
    }

    useEffect(() => { fetchBookings(currentDate) }, [currentDate])
    useEffect(() => { fetchVocStats() }, [])

    const getWeek = (date) => {
        const start = new Date(date)
        const day = start.getDay()
        const diff = start.getDate() - day + (day === 0 ? -6 : 1)
        start.setDate(diff)
        let week = []
        for (let i = 0; i < 7; i++) {
            let d = new Date(start); d.setDate(start.getDate() + i); week.push(d)
        }
        return week
    }

    const week = getWeek(currentDate)
    const start = week[0], end = week[6]
    const range = `${start.getDate()} ${start.toLocaleString("en", { month: "short" })} - ${end.getDate()} ${end.toLocaleString("en", { month: "short" })} ${end.getFullYear()}`

    const prevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); setModalDate(null) }
    const nextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); setModalDate(null) }

    const scheduleHide = () => { hideTimerRef.current = setTimeout(() => setModalDate(null), 250) }
    const cancelHide = () => clearTimeout(hideTimerRef.current)

    const handleDayMouseEnter = (formatted, count) => {
        if (count === 0) return
        cancelHide()
        setModalDate(formatted)
    }

    return (
        <section style={{ position: "relative" }}>
            <div>
                <div className="calandar-div">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className="calander-dates">
                        <h3>📅 Bookings This Week</h3>
                        <div className="week-navigation">
                            <button onClick={prevWeek}>‹</button>
                            <span>{range}</span>
                            <button onClick={nextWeek}>›</button>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "15px", marginTop: "20px", minWidth: "460px" }}>
                            {week.map((day) => {
                                const y = day.getFullYear()
                                const m = String(day.getMonth() + 1).padStart(2, "0")
                                const d = String(day.getDate()).padStart(2, "0")
                                const formatted = `${y}-${m}-${d}`
                                const count = bookings[formatted] || 0
                                const isActive = modalDate === formatted
                                const hasBookings = count > 0

                                if (!dayRefs.current[formatted]) dayRefs.current[formatted] = { current: null }

                                return (
                                    <div
                                        className={`calandar-dates day-cell${hasBookings ? " day-hoverable" : ""}${isActive ? " day-active" : ""}`}
                                        key={formatted}
                                        ref={el => { if (!dayRefs.current[formatted]) dayRefs.current[formatted] = {}; dayRefs.current[formatted].current = el }}
                                        onMouseEnter={() => handleDayMouseEnter(formatted, count)}
                                        onMouseLeave={scheduleHide}
                                    >
                                        <p className="calendar-day">{day.toLocaleDateString("en-US", { weekday: "short" })}</p>
                                        <h3>{day.getDate()}</h3>
                                        <p className="booking-count">{count}</p>
                                        {hasBookings && <span className="day-hint">View</span>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <VOCStatsCard pending={vocStats.pending} verified={vocStats.verified} total={vocStats.total} />
                <QuickActions />
            </div>

            {modalDate && (
                <DailyStudentsModal
                    date={modalDate}
                    anchorRef={dayRefs.current[modalDate]}
                    onClose={() => setModalDate(null)}
                    onMouseEnter={cancelHide}
                    onMouseLeave={scheduleHide}
                />
            )}
        </section>
    )
}

export default AdminDashboard