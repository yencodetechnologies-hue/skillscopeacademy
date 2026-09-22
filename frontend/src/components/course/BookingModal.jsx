import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { API_URL } from "../../data/service"
import "./BookingModal.css"

export function getBookingType(course) {
    const pt = course?.pricingType || (course?.experienceBasedBooking ? "experience" : "standard")
    if (pt === "experience") return "experience"
    if (pt === "slbl" || course?.slblPrice) return "slbl"

    const bypassKeywords = ["excavator", "haul truck", "skid steer"]
    const isBypass = bypassKeywords.some(kw => course?.title?.toLowerCase().includes(kw))
    if (isBypass) return "experience"
    
    return "standard"
}

export function getBookingOptions(course) {
    const type = getBookingType(course)

    if (type === "experience") {
        return [
            {
                id: "with-experience",
                label: "With Experience",
                price: course.withExperiencePrice || course.comboPrice || course.sellingPrice,
                originalPrice: course.withExperienceOriginal || course.originalPrice,
                dur: course.duration || "1 day",
                description: "Already have experience in this field",
                isVoc: false,
            },
            {
                id: "without-experience",
                label: "Without Experience",
                price: course.withoutExperiencePrice || course.comboPrice || course.sellingPrice,
                originalPrice: course.withoutExperienceOriginal || course.originalPrice,
                dur: course.duration || "1 day",
                description: "No prior experience needed",
                isVoc: false,
            },
            {
                id: "voc",
                label: "VOC",
                price: course.vocPrice || course.sellingPrice,
                originalPrice: course.withoutExperienceOriginal || course.originalPrice,
                dur: "Half day",
                description: "Recognition of prior learning",
                isVoc: true,
            },
        ]
    }

    if (type === "slbl") {
        return [
            {
                id: "slbl",
                label: "SL + BL",
                price: course.slblPrice,
                originalPrice: course.slblStrikePrice,
                dur: course.duration || "1 day",
                description: "Slewing & non-slewing combined",
                isVoc: false,
            },
            {
                id: "sl",
                label: "SL or BL",
                price: course.slSinglePrice || course.sellingPrice,
                originalPrice: course.slSingleStrikePrice || course.originalPrice,
                dur: course.duration || "1 day",
                description: "Single licence — SL or BL",
                isVoc: false,
            },
            {
                id: "voc",
                label: "VOC",
                price: course.vocPrice || course.sellingPrice,
                originalPrice: course.slSingleStrikePrice || course.originalPrice,
                dur: "Half day",
                description: "Recognition of prior learning",
                isVoc: true,
            },
        ]
    }

    return [
        {
            id: "standard",
            label: "Standard",
            price: course.sellingPrice,
            originalPrice: course.originalPrice,
            dur: course.duration || "1 day",
            description: "Full course enrollment",
            isVoc: false,
        },
        {
            id: "voc",
            label: "VOC",
            price: course.vocPrice || course.sellingPrice,
            originalPrice: course.originalPrice,
            dur: "Half day",
            description: "Recognition of prior learning",
            isVoc: true,
        },
    ]
}

// ─────────────────────────────────────────────────────────────
// Per-slot price resolver
//
// Each time slot (session) can carry its own price override fields
// (sellingPrice/originalPrice, withExperiencePrice/..., slblPrice/...,
// vocPrice, etc). This picks the right pair for whichever booking
// option is currently selected, falling back to the course-level
// price when the slot has no override.
// ─────────────────────────────────────────────────────────────
function getSessionPriceForOption(session, selectedId, course) {
    const s = session?.pricing || session || {}

    const fallback = (...vals) => vals.find(v => v !== undefined && v !== null && v !== "")

    switch (selectedId) {
        case "with-experience":
            return {
                price: fallback(s.withExperiencePrice, course.withExperiencePrice, course.comboPrice, course.sellingPrice),
                originalPrice: fallback(s.withExperienceOriginal, course.withExperienceOriginal, course.originalPrice),
            }
        case "without-experience":
            return {
                price: fallback(s.withoutExperiencePrice, course.withoutExperiencePrice, course.comboPrice, course.sellingPrice),
                originalPrice: fallback(s.withoutExperienceOriginal, course.withoutExperienceOriginal, course.originalPrice),
            }
        case "slbl":
            return {
                price: fallback(s.slblPrice, course.slblPrice),
                originalPrice: fallback(s.slblStrikePrice, course.slblStrikePrice),
            }
        case "sl":
            return {
                price: fallback(s.slSinglePrice, course.slSinglePrice, course.sellingPrice),
                originalPrice: fallback(s.slSingleStrikePrice, course.slSingleStrikePrice, course.originalPrice),
            }
        case "voc":
            return {
                price: fallback(s.vocPrice, course.vocPrice, course.sellingPrice),
                originalPrice: fallback(s.originalPrice, course.originalPrice),
            }
        case "standard":
        default:
            return {
                price: fallback(s.sellingPrice, course.sellingPrice),
                originalPrice: fallback(s.originalPrice, course.originalPrice),
            }
    }
}

export default function BookingModal({ course, onClose, initialSelection = null, extraQueryParams = "" }) {
    const navigate = useNavigate()
    const options  = getBookingOptions(course)
    
    const [selected, setSelected] = useState(initialSelection)
    const [step, setStep]         = useState("options") // "options" | "schedule"
    const [shake,    setShake]    = useState(false)
    const [showErr,  setShowErr]  = useState(false)

    // Real time-slot data fetched from the schedules API
    const [fetchedSessions, setFetchedSessions] = useState([])
    const [loadingSessions, setLoadingSessions] = useState(false)
    const [sessionsError, setSessionsError]     = useState(null)

    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedSession, setSelectedSession] = useState(null)

    // ─────────────────────────────────────────────
    // FETCH REAL TIME SLOTS FOR THIS COURSE
    // ─────────────────────────────────────────────
    useEffect(() => {
        if (!course?._id) return

        let cancelled = false
        setLoadingSessions(true)
        setSessionsError(null)

        axios
            .get(`${API_URL}/api/schedules/course/${course._id}`)
            .then((res) => {
                if (cancelled) return

                const todayYMD = new Date().toISOString().split("T")[0]
                const sessions = []

                ;(res.data || []).forEach((schedule) => {
                    const dateStr = schedule?.date
                        ? new Date(schedule.date).toISOString().split("T")[0]
                        : null

                    if (!dateStr || dateStr < todayYMD) return // skip past dates

                    ;(schedule.sessions || []).forEach((session) => {
                        // Only show active, bookable slots
                        if (session.status && session.status !== "Active") return

                        sessions.push({
                            id: session._id,
                            date: dateStr,
                            startTime: session.startTime || "",
                            endTime: session.endTime || "",
                            time:
                                session.startTime && session.endTime
                                    ? `${session.startTime} – ${session.endTime}`
                                    : session.startTime || "",
                            availableSlots:
                                typeof session.availableSlots === "number"
                                    ? session.availableSlots
                                    : null,
                            preferredCity: Array.isArray(session.preferredCity)
                                ? session.preferredCity
                                : [],
                            sessionType: session.sessionType,
                            // per-slot pricing fields live directly on the session
                            pricing: session,
                        })
                    })
                })

                // Sort chronologically by date then start time
                sessions.sort((a, b) => {
                    if (a.date !== b.date) return a.date < b.date ? -1 : 1
                    return (a.startTime || "").localeCompare(b.startTime || "")
                })

                setFetchedSessions(sessions)
            })
            .catch((err) => {
                if (cancelled) return
                console.error("Fetch course sessions error:", err)
                setSessionsError("Could not load available dates.")
                setFetchedSessions([])
            })
            .finally(() => {
                if (!cancelled) setLoadingSessions(false)
            })

        return () => {
            cancelled = true
        }
    }, [course?._id])

    if (!course) return null;
    const selectedOption = options.find(o => o.id === selected)

    // Use real fetched sessions when we have them; otherwise fall back to
    // whatever was passed in via `course.sessions`, and finally to a
    // generated placeholder range so the modal never breaks.
    const usingRealSessions = fetchedSessions.length > 0
    const sourceSessions = usingRealSessions
        ? fetchedSessions
        : (course.sessions && course.sessions.length > 0 ? course.sessions : [])

    // Generate upcoming dates dynamically from whichever source is available
    const generateUpcomingDates = () => {
        if (sourceSessions.length > 0) {
            const uniqueDates = [...new Set(sourceSessions.map(s => s.date))].sort()
            return uniqueDates.map(dateStr => {
                const d = new Date(dateStr)
                return {
                    dateString: dateStr,
                    dayName: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
                    dayNum: d.getDate(),
                    monthName: d.toLocaleDateString("en-US", { month: "short" })
                }
            })
        }

        if (loadingSessions) return []

        // Placeholder fallback only if nothing real is available at all
        const dates = []
        const start = new Date()
        for (let i = 0; i < 7; i++) {
            const d = new Date(start)
            d.setDate(d.getDate() + i)
            const dateString = d.toISOString().split("T")[0]
            dates.push({
                dateString,
                dayName: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
                dayNum: d.getDate(),
                monthName: d.toLocaleDateString("en-US", { month: "short" })
            })
        }
        return dates
    }

    const availableDates = generateUpcomingDates()

    // Default the selected date to the first date that actually has slots,
    // once we know what's available (real sessions or fallback).
    useEffect(() => {
        if (selectedDate) return
        if (availableDates.length > 0) {
            setSelectedDate(availableDates[0].dateString)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableDates.length])

    const getSessionsForDate = (dateStr) => {
        if (!dateStr) return []

        if (sourceSessions.length > 0) {
            return sourceSessions
                .filter(s => s.date === dateStr)
                .map(s => {
                    const { price, originalPrice } = getSessionPriceForOption(s, selected, course)
                    return {
                        id: s.id || `${dateStr}-${s.startTime}`,
                        time: s.time || (s.startTime && s.endTime ? `${s.startTime} – ${s.endTime}` : s.startTime),
                        price: price ?? selectedOption?.price ?? 0,
                        strikePrice: originalPrice ?? selectedOption?.originalPrice ?? course?.originalPrice,
                        availableSlots: s.availableSlots,
                        preferredCity: s.preferredCity || [],
                    }
                })
        }

        // No real slots found for this course — last-resort placeholder
        return [
            { id: `${dateStr}-1`, time: "17:00 – 23:00", price: selectedOption?.price || 165, strikePrice: selectedOption?.originalPrice || course?.originalPrice || 220, availableSlots: null, preferredCity: [] }
        ]
    }

    const currentSessions = getSessionsForDate(selectedDate)

    // The actual amount to charge is whatever the CHOSEN time slot costs
    // (per-slot pricing can override the course-level default), not the
    // generic option price shown in step 1. Falls back to the option price
    // until a specific slot has been picked.
    const selectedSlotData = currentSessions.find(s => s.id === selectedSession)
    const displayPrice = selectedSlotData ? selectedSlotData.price : selectedOption?.price
    const displayStrikePrice = selectedSlotData ? selectedSlotData.strikePrice : selectedOption?.originalPrice

    const handleContinue = () => {
        if (!selected) {
            setShowErr(true)
            setShake(true)
            setTimeout(() => setShake(false), 400)
            return
        }
        setStep("schedule")
    }

 const handleFinalBook = () => {
    const base = course.slug
        ? `/book-now/course/${course.slug}`
        : `/book-now?courseId=${course._id}`

    const sessionParam = selectedSession ? `&sessionId=${selectedSession}` : ""
    const dateParam = selectedDate ? `&date=${selectedDate}` : ""
    // ✅ Pass the exact chosen slot price and strike price
    const priceParam = displayPrice != null ? `&price=${displayPrice}` : ""
    const strikeParam = displayStrikePrice != null ? `&strikePrice=${displayStrikePrice}` : ""

    const join = (qs) => {
        const hasQ = base.includes("?")
        const sep = hasQ ? "&" : "?"
        const params = [qs, extraQueryParams.replace(/^&/, ""), sessionParam, dateParam, priceParam, strikeParam].filter(Boolean).join("&")
        return params ? `${base}${sep}${params}` : base
    }

    const routes = {
        "with-experience":    join("type=with-experience"),
        "without-experience": join("type=without-experience"),
        "slbl":               join("type=slbl"),
        "sl":                 join("type=sl"),
        "bl":                 join("type=bl"),
        "voc":                `/voc?courseId=${course._id}${dateParam}${sessionParam}${priceParam}${extraQueryParams}`,
        "standard":           join(""), 
    }
    onClose()
    navigate(routes[selected] || join(""))
}

    return (
        <div className="cc-modal-overlay" onClick={onClose}>
            <div className={`cc-modal ${shake ? "cc-modal--shake" : ""}`} onClick={e => e.stopPropagation()}>

                {/* HEADER */}
                <div className="cc-modal-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {step === "schedule" && (
                            <button className="cc-modal-back-btn" onClick={() => setStep("options")}>
                                <i className="fa-solid fa-arrow-left" /> Back
                            </button>
                        )}
                        <div>
                            <div className="cc-modal-title">{course.title}</div>
                            <div className="cc-modal-sub">
                                {step === "options" ? "Select your booking option" : "Choose date & time"}
                            </div>
                        </div>
                    </div>
                    <button className="cc-modal-close" onClick={onClose}>✕</button>
                </div>

                {/* BODY CONTENT */}
                {step === "options" ? (
                    <div className="cc-modal-options">
                        {options.map(opt => {
                            const activePrice = opt.price || 0;
                            const strikePrice = opt.originalPrice || course?.originalPrice || 1000;
                            const saving = strikePrice > activePrice ? strikePrice - activePrice : 0;

                            return (
                                <div
                                    key={opt.id}
                                    className={`cc-modal-option ${selected === opt.id ? "cc-modal-option--active" : ""} ${showErr && !selected ? "cc-modal-option--error" : ""}`}
                                    onClick={() => {
                                        setSelected(opt.id)
                                        setShowErr(false)
                                        setShake(false)
                                    }}
                                >
                                    <div className="cc-mo-left">
                                        <div className="cc-mo-radio">
                                            {selected === opt.id && <div className="cc-mo-radio-dot" />}
                                        </div>
                                        <div>
                                            <div className="cc-mo-label">{opt.label}</div>
                                            <div className="cc-mo-desc">{opt.description}</div>
                                        </div>
                                    </div>

                                    <div className="cc-mo-toggle-wrapper">
                                        <span className="cc-mo-toggle-strike">${strikePrice}</span>
                                        <div className="cc-mo-toggle-pill">
                                            <span className="cc-mo-toggle-price">${activePrice}</span>
                                            {saving > 0 && (
                                                <span className="cc-mo-toggle-save">SAVE ${saving}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {showErr && !selected && (
                            <div className="cc-modal-err">
                                <i className="fa-solid fa-triangle-exclamation" />
                                Please select an option to continue
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="cc-modal-schedule-body">
                        {/* Top Selected Option Summary Pill matching reference[cite: 4] */}
                        <div className="cc-schedule-selected-pill">
                            <span className="cc-ssp-label">{selectedOption?.label}</span>
                            <span className="cc-ssp-price">${displayPrice || 0}</span>
                        </div>

                        {/* Date Picker Section */}
                        <div className="cc-schedule-section">
                            <div className="cc-schedule-section-title">Select a date</div>

                            {loadingSessions && availableDates.length === 0 ? (
                                <div className="cc-no-sessions">Loading available dates…</div>
                            ) : (
                                <>
                                    <div className="cc-date-cards-container">
                                        {availableDates.map(item => {
                                            const isSelected = selectedDate === item.dateString
                                            return (
                                                <button
                                                    key={item.dateString}
                                                    type="button"
                                                    className={`cc-date-card ${isSelected ? "cc-date-card--active" : ""}`}
                                                    onClick={() => {
                                                        setSelectedDate(item.dateString)
                                                        setSelectedSession(null)
                                                    }}
                                                >
                                                    <span className="cc-dc-day">{item.dayName}</span>
                                                    <span className="cc-dc-num">{item.dayNum}</span>
                                                    <span className="cc-dc-month">{item.monthName}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <div className="cc-date-slider-indicator">
                                        <span className="cc-dsi-bar" />
                                    </div>
                                </>
                            )}

                            {sessionsError && (
                                <div className="cc-modal-err">
                                    <i className="fa-solid fa-triangle-exclamation" />
                                    {sessionsError}
                                </div>
                            )}
                        </div>

                        {/* Timeslots Section matching reference[cite: 4] */}
                        <div className="cc-schedule-section">
                            <div className="cc-schedule-section-title">
                                {selectedDate
                                    ? `Sessions on ${new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`
                                    : "Sessions"}
                            </div>
                            <div className="cc-timeslots-container">
                                {currentSessions.length > 0 ? (
                                    currentSessions.map(session => {
                                        const isSessionSelected = selectedSession === session.id
                                        const isFull = session.availableSlots === 0
                                        return (
                                            <div
                                                key={session.id}
                                                className={`cc-timeslot-box ${isSessionSelected ? "cc-timeslot-box--active" : ""} ${isFull ? "cc-timeslot-box--full" : ""}`}
                                                onClick={() => {
                                                    if (isFull) return
                                                    setSelectedSession(session.id)
                                                }}
                                            >
                                                <div className="cc-tb-left">
                                                    <i className="fa-regular fa-clock cc-tb-clock" />
                                                    <span className="cc-tb-time">{session.time}</span>
                                                    <div className="cc-tb-prices">
                                                        <span className="cc-tb-price">${session.price}</span>
                                                        {session.strikePrice && (
                                                            <span className="cc-tb-strike">${session.strikePrice}</span>
                                                        )}
                                                    </div>
                                                    {session.preferredCity?.length > 0 && (
                                                        <span className="cc-tb-city">
                                                            📍 {session.preferredCity.join(", ")}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="cc-tb-seats">
                                                    {isFull
                                                        ? "Fully booked"
                                                        : typeof session.availableSlots === "number"
                                                            ? `${session.availableSlots} seats available`
                                                            : "Seats available"}
                                                </span>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="cc-no-sessions">No sessions available for this date.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* FOOTER */}
                <div className="cc-modal-footer">
                    <div className="cc-modal-total">
                        <span>Total</span>
                        <strong>{selectedOption ? `$${displayPrice || 0}` : "—"}</strong>
                    </div>
                    {step === "options" ? (
                        <button className="cc-modal-confirm" onClick={handleContinue}>
                            Continue <i className="fa-regular fa-circle-right" />
                        </button>
                    ) : (
                        <button className="cc-modal-confirm" onClick={handleFinalBook}>
                            Book Now {selectedOption ? `— ${selectedOption.label}` : ""}
                            <i className="fa-regular fa-circle-right" />
                        </button>
                    )}
                    <button className="cc-modal-cancel" onClick={onClose}>Cancel</button>
                </div>

            </div>
        </div>
    )
}