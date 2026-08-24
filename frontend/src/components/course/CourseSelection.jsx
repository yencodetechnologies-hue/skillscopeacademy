import { useEffect, useRef, useState } from "react"
import axios from "axios"
import "../../styles/CourseSelection.css"
import { API_URL } from "../../data/service"
import { filterActiveScheduleSlots } from "../../utils/sessionStatus"
import { filterActiveCourses } from "../../utils/courseStatus"
import { colors } from "../../constants/theme"

// ─── Pricing variants ────────────────────────────────────────────────────────
// A "variant" = a sub-option of a course shown in the dropdown. For
// experience-based courses we offer With Experience / Without Experience; for
// SL+BL courses we offer Single License / Both Licenses. Standard courses have
// a single, unnamed variant.
//
// Each variant carries its own price so the dropdown can display it inline
// and so the caller can persist the selected variant on the course object
// (as `__variant`) — `getCoursePrice` then prefers the variant over the URL
// `?type=` fallback.
const getCourseVariants = (course) => {
    if (!course) return []
    const pt = course.pricingType || (course.experienceBasedBooking ? "experience" : "standard")

    const params = new URLSearchParams(window.location.search)
    const bookingType = params.get("type")

    if (pt === "experience") {
        return [
            { variant: "with-experience",    label: "With Experience",    price: Number(course.withExperiencePrice || 0) },
            { variant: "without-experience", label: "Without Experience", price: Number(course.withoutExperiencePrice || 0) },
        ]
    }
    if (pt === "slbl") {
        return [
            { variant: "sl",   label: "Single License",   price: Number(course.slSinglePrice || 0) },
            { variant: "slbl", label: "Both Licenses (SL + BL)", price: bookingType === "sl" ? Number(course.slSinglePrice || 0) : Number(course.slblPrice || 0) },
        ]
    }
    return [{ variant: null, label: null, price: Number(course.sellingPrice || 0) }]
}

const COMPANY_SELECTION_STORAGE_KEY = "company_course_selection";

const saveCompanySelection = (courses) => {
    try {
        sessionStorage.setItem(
            COMPANY_SELECTION_STORAGE_KEY,
            JSON.stringify(courses || [])
        );
    } catch (error) {
        console.error("Failed to save company selection:", error);
    }
};

const loadCompanySelection = () => {
    try {
        const saved = sessionStorage.getItem(
            COMPANY_SELECTION_STORAGE_KEY
        );

        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Failed to load company selection:", error);
        return [];
    }
};

const variantKey = (courseId, variant) => variant ? `${courseId}|${variant}` : String(courseId)

function CourseDropdown({ groupedCourses, value, onChange, placeholder = "Select Course", getCoursePrice, enrollmentType }) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const ref = useRef(null)

    const filterCourses = (courses) => {
        return courses.filter(c =>
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const allCourses = Object.values(groupedCourses).flat()
    const selected = allCourses.find(c => c._id === value?.courseId)
    const variantLabel = value?.variant
        ? ` (${(getCourseVariants(selected).find(v => v.variant === value.variant) || {}).label || ""})`
        : ""
    const isAgent = String(enrollmentType || "").toLowerCase() === "agent" || enrollmentType === "Agent"
    const label = selected
        ? `${selected.courseCode} - ${selected.title}${variantLabel}${isAgent ? "" : ` - $${getCoursePrice(selected)}`}`
        : placeholder

    return (
        <div className="cs-dropdown" ref={ref}>
            <div
                className={`cs-dropdown__trigger ${open ? "cs-dropdown__trigger--open" : ""}`}
                onClick={() => setOpen(p => !p)}
            >
                <span className={selected ? "cs-dropdown__value" : "cs-dropdown__placeholder"}>{label}</span>
                <span className="cs-dropdown__arrow">{open ? "▲" : "▼"}</span>
            </div>

            {open && (
                <div className="cs-dropdown__menu">
                    {/* 🔍 SEARCH BOX INSIDE DROPDOWN */}
                    <div style={{ padding: "8px", borderBottom: "1px solid #f1f5f9" }}>
                        <input
                            type="text"
                            placeholder="Search course..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                fontSize: "13px",
                                outline: "none",
                                boxSizing: "border-box",
                                background: colors.slate50
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {Object.entries(groupedCourses).map(([category, catCourses]) => {

                        const filteredCourses = filterCourses(catCourses)

                        if (filteredCourses.length === 0) return null

                        return (
                            <div key={category}>
                                <div className="cs-dropdown__group-label">{category}</div>

                                {filteredCourses.flatMap(course => {
                                    const variants = getCourseVariants(course)

                                    return variants.map(v => {
                                        const k = variantKey(course._id, v.variant)

                                        const optionLabel = v.label
                                            ? `${course.courseCode} - ${course.title} (${v.label})${isAgent ? "" : ` - $${v.price}`}`
                                            : `${course.courseCode} - ${course.title}${isAgent ? "" : ` - $${v.price}`}`

                                        return (
                                            <div
                                                key={k}
                                                className="cs-dropdown__option"
                                                onClick={() => {
                                                    onChange(course._id, v.variant)
                                                    setOpen(false)
                                                    setSearchTerm("")
                                                }}
                                            >
                                                {optionLabel}
                                            </div>
                                        )
                                    })
                                })}
                            </div>
                        )
                    })}

                    {/* ❗ NO RESULTS */}
                    {Object.values(groupedCourses).flat().filter(c =>
                        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 && (
                        <div style={{ padding: "10px", textAlign: "center", color: colors.textIcon }}>
                            No courses found
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function AddCourseButton({ groupedCourses, onAdd, enrollmentType }) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const filterCourses = (courses) => {
        return courses.filter(c =>
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    const isAgent = String(enrollmentType || "").toLowerCase() === "agent" || enrollmentType === "Agent"

    const handleSelect = (courseId, variant) => {
        onAdd(courseId, variant)
        setOpen(false)
        setSearchTerm("")
    }

    return (
        <div className="form-group" ref={ref} style={{ position: "relative" }}>
            <button
                type="button"
                className="add-course-btn"
                onClick={() => {
                    setOpen(p => !p)
                    setSearchTerm("")
                }}
            >
                {open ? "✕ Cancel" : "+ Add Course"}
            </button>

            {open && (
                <div className="cs-dropdown__menu add-course-dropdown">

                    {/* 🔍 SEARCH BOX */}
                    <div style={{ padding: "8px" }}>
                        <input
                            type="text"
                            placeholder="Search course..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="cs-dropdown-search"
                        />
                    </div>

                    {/* CATEGORY LOOP */}
                    {Object.entries(groupedCourses).map(([category, catCourses]) => {

                        const filteredCourses = filterCourses(catCourses)

                        if (filteredCourses.length === 0) return null

                        return (
                            <div key={category}>
                                <div className="cs-dropdown__group-label">{category}</div>

                                {filteredCourses.flatMap(course => {
                                    const variants = getCourseVariants(course)

                                    return variants.map(v => {
                                        const k = variantKey(course._id, v.variant)

                                        const optionLabel = v.label
                                            ? `${course.courseCode} - ${course.title} (${v.label})${isAgent ? "" : ` - $${v.price}`}`
                                            : `${course.courseCode} - ${course.title}${isAgent ? "" : ` - $${v.price}`}`

                                        return (
                                            <div
                                                key={k}
                                                className="cs-dropdown__option"
                                                onClick={() => handleSelect(course._id, v.variant)}
                                            >
                                                {optionLabel}
                                            </div>
                                        )
                                    })
                                })}
                            </div>
                        )
                    })}

                    {/* NO RESULTS */}
                    {Object.values(groupedCourses).flat().length > 0 &&
                        Object.values(groupedCourses).flat().filter(c =>
                            c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
                        ).length === 0 && (
                            <div style={{ padding: "10px", textAlign: "center", color: colors.textIcon }}>
                                No courses found
                            </div>
                        )}
                </div>
            )}
        </div>
    )
}

// ✅ Calendar Date Picker Component
function CalendarDatePicker({ groupedSlots, selectedSession, onSelectSession }) {
    const [calOpen, setCalOpen] = useState(false)
    const [currentYear, setCurrentYear] = useState(() => {
        const dates = Object.keys(groupedSlots)
        if (dates.length > 0) return new Date(dates[0]).getFullYear()
        return new Date().getFullYear()
    })
    const [currentMonth, setCurrentMonth] = useState(() => {
        const dates = Object.keys(groupedSlots)
        if (dates.length > 0) return new Date(dates[0]).getMonth()
        return new Date().getMonth()
    })
    const [selectedDate, setSelectedDate] = useState(null)
    const calRef = useRef(null)

    const availableDateKeys = Object.keys(groupedSlots)

    useEffect(() => {
        const handler = (e) => {
            if (calRef.current && !calRef.current.contains(e.target)) setCalOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    // Sync local selectedDate with the session date passed from parent
    useEffect(() => {
        if (selectedSession?.date) {
            setSelectedDate(selectedSession.date)
        }
    }, [selectedSession?.date])

    // ✅ Reset when groupedSlots changes (different course selected), unless
    // the parent has already supplied a selected session/date to show.
useEffect(() => {
    if (availableDateKeys.length === 0) {
        setSelectedDate(null);
        return;
    }

    const savedDate = selectedSession?.date;

    // If we already have a saved date, restore it
    if (
        savedDate &&
        availableDateKeys.includes(savedDate)
    ) {
        setSelectedDate(savedDate);

        const d = new Date(savedDate);
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());

        return;
    }

    // Otherwise show the first available date's sessions,
    // but KEEP ALL dates visible in the date list.
    const firstDate = availableDateKeys[0];

    setSelectedDate(firstDate);

    const d = new Date(firstDate);
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());

}, [
    JSON.stringify(availableDateKeys),
    selectedSession?.date
]);
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
        else setCurrentMonth(m => m - 1)
    }
    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
        else setCurrentMonth(m => m + 1)
    }

    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    const calDays = []
    for (let i = 0; i < firstDay; i++) calDays.push(null)
    for (let d = 1; d <= daysInMonth; d++) calDays.push(d)

    const formatKey = (d) => {
        const date = new Date(currentYear, currentMonth, d)
        return date.toISOString().split("T")[0]
    }

    const pickDate = (key) => {
        setSelectedDate(key)
        setCalOpen(false)
    }

    const sessionsForDate = selectedDate ? (groupedSlots[selectedDate] || []) : []
    const allSessions = sessionsForDate.flatMap(slot =>
        (slot.sessions || [])
            .filter((s) => s.status === "Active")
            .map(session => ({ ...session, date: slot.date, slotDate: slot.date }))
    )

    return (
        <div>
            {/* ✅ Select Date Button */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div ref={calRef} style={{ position: "relative" }}>
                    {calOpen && (
                        <div className="cs-cal-popup">
                            <div className="cs-cal-header">
                                <button className="cs-cal-nav" onClick={prevMonth} type="button">‹</button>
                                <span className="cs-cal-month">{monthNames[currentMonth]} {currentYear}</span>
                                <button className="cs-cal-nav" onClick={nextMonth} type="button">›</button>
                            </div>
                            <div className="cs-cal-grid">
                                {dayNames.map(d => (
                                    <div key={d} className="cs-cal-dayname">{d}</div>
                                ))}
                                {calDays.map((d, i) => {
                                    if (!d) return <div key={`e-${i}`} />
                                    const key = formatKey(d)
                                    const avail = availableDateKeys.includes(key)
                                    const isSel = selectedDate === key
                                    return (
                                        <div
                                            key={key}
                                            className={`cs-cal-day ${avail ? "cs-cal-day--avail" : ""} ${isSel ? "cs-cal-day--selected" : ""}`}
                                            onClick={() => avail && pickDate(key)}
                                        >
                                            {d}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {selectedDate && (
                    <button
                        className="cs-cal-clear"
                        onClick={() => setSelectedDate(null)}
                        type="button"
                    >
                        ✕ Clear
                    </button>
                )}
            </div>

            {/* ✅ Date Chip Scroll — no date selected: all dates, selected: only selected */}
           <div className="cs-date-scroll">
    {availableDateKeys.map(key => {
        const d = new Date(key);
        const slots = groupedSlots[key] || [];
        const totalSessions = slots.reduce(
            (total, slot) => total + (slot.sessions?.length || 0),
            0
        );

        return (
            <div
                key={key}
                className={`cs-date-chip ${
                    selectedDate === key
                        ? "cs-date-chip--active"
                        : ""
                }`}
                onClick={() => setSelectedDate(key)}
            >
                <div className="cs-date-chip__day">
                    {d.toLocaleDateString("en-AU", {
                        weekday: "short"
                    })}
                </div>

                <div className="cs-date-chip__date">
                    {d.toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short"
                    })}
                </div>

                <div className="cs-date-chip__slots">
                    {totalSessions} session
                    {totalSessions !== 1 ? "s" : ""}
                </div>
            </div>
        );
    })}
</div>

            {/* ✅ Sessions for selected date */}
            {selectedDate && allSessions.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>
                        Sessions on {new Date(selectedDate).toLocaleDateString("en-AU", {
                            weekday: "long", day: "numeric", month: "long", year: "numeric"
                        })}
                    </p>
                    <div className="slots-grid">
                        {allSessions.map((session, idx) => {
                            const isFull = (session.availableSlots ?? session.maxCapacity) === 0
                            const isActive = selectedSession?._id === session._id
                            return (
                                <div
                                    key={idx}
                                    className={`slot-card ${isActive ? "active" : ""} ${isFull ? "slot-card--full" : ""}`}
                                    onClick={() => !isFull && onSelectSession({ ...session, date: selectedDate })}
                                    style={isFull ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                                >
                                    <div className="slot-time">🕒 {session.startTime} - {session.endTime}</div>
                                    <p className="spots">
                                        {isFull ? "Full" : (session.availableSlots <= 3 ? "Filling Fast" : "Seats Available")}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

function LockedBookingSummary({ course, session, linkMeta }) {
    const dateStr = session?.date
        ? new Date(session.date).toLocaleDateString("en-AU", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "Date to be confirmed"

    return (
        <div className="cs-locked-booking">
            <p className="cs-locked-booking__badge">Company booking link</p>
            <p className="cs-locked-booking__hint">
                Your company has already selected this course and session. Complete your details to enrol.
            </p>
            <div className="cs-locked-booking__card">
                <p className="cs-locked-booking__label">Course</p>
                <p className="cs-locked-booking__value">
                    {course?.title || linkMeta?.courseName || "—"}
                </p>
                {(course?.courseCode || linkMeta?.courseCode) && (
                    <p className="cs-locked-booking__meta">
                        {course?.courseCode || linkMeta?.courseCode}
                    </p>
                )}
            </div>
            <div className="cs-locked-booking__card">
                <p className="cs-locked-booking__label">Session</p>
                <p className="cs-locked-booking__value">{dateStr}</p>
                {(session?.startTime || linkMeta?.startTime) && (
                    <p className="cs-locked-booking__meta">
                        {session?.startTime || linkMeta?.startTime}
                        {" – "}
                        {session?.endTime || linkMeta?.endTime}
                    </p>
                )}
            </div>
            {linkMeta?.remaining != null && (
                <p className="cs-locked-booking__slots">
                    {linkMeta.remaining} of {linkMeta.maxUses} seat{linkMeta.maxUses !== 1 ? "s" : ""} remaining on this link
                </p>
            )}
        </div>
    )
}

function CourseSelection({
     enrollmentType, 
    setEnrollmentType, 
    selectedSession, 
    setSelectedSession, 
    selectedCourse, 
    setSelectedCourse, 
    hideEnrollmentType, 
    selectedCourses, 
    setSelectedCourses, 
    isCompanyEnroll, 
    bookingLinkData = null, 
}) {

     const getLoggedInUser = () => {
        try {
            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                return null;
            }

            return JSON.parse(storedUser);
        } catch (error) {
            console.error("Failed to parse logged-in user:", error);
            return null;
        }
    };

     const loggedInUser = getLoggedInUser();

     
     const isCompanyRole =
        String(loggedInUser?.role || "").trim().toLowerCase() === "company";

         if (isCompanyRole && enrollmentType !== "company") {
            setEnrollmentType("company");
        }
      useEffect(() => {
        if (isCompanyRole && enrollmentType !== "company") {
            setEnrollmentType("company");
        }
    }, [isCompanyRole, enrollmentType, setEnrollmentType]);

    const [courses, setCourses] = useState([])
    const [activeCourseIds, setActiveCourseIds] = useState(null)
    const [slots, setSlots] = useState([])
    const [courseSlots, setCourseSlots] = useState({})
    const [collapsedCourses, setCollapsedCourses] = useState({})
    const [categoryList, setCategoryList] = useState([]) // ✅ Store categories for ordering
    const [loadingSlots, setLoadingSlots] = useState(false)
    const processedUrlSession = useRef(false)



    const params = new URLSearchParams(window.location.search)
    const bookingType    = params.get("type")
    const paramCourseId  = params.get("courseId")
    const paramSessionId = params.get("sessionId")

    const isCompany =
    enrollmentType === "company" || isCompanyRole;


    const useMultiCourseFlow = isCompany && !isCompanyEnroll
    const isLockedBookingLink = !!(bookingLinkData?.token && bookingLinkData?.courseId)

        // Restore company course/date/time after returning to this page
useEffect(() => {
    if (!isCompany || !useMultiCourseFlow) return;

    const savedCourses = loadCompanySelection();

    if (savedCourses.length > 0) {
        setSelectedCourses(savedCourses);

        const collapsed = {};

        savedCourses.forEach((item) => {
            if (item.session?._id) {
                collapsed[item.uid] = true;
            }
        });

        setCollapsedCourses(collapsed);
    }
}, [isCompany, useMultiCourseFlow, setSelectedCourses]);

useEffect(() => {
    if (!useMultiCourseFlow) return;

    saveCompanySelection(selectedCourses || []);
}, [selectedCourses, useMultiCourseFlow]);  

    // ============================================================
    // COMPANY FLOW:
    // When switching from Individual -> Company, move the currently
    // selected course into selectedCourses.
    //
    // No date/time is auto-picked here. If the user had already
    // manually picked a real session in the individual flow, that
    // carries over as-is (shown collapsed/confirmed). Otherwise the
    // entry is added with no session, and its calendar is populated
    // with the course's available dates so the user picks one
    // themselves.
    // ============================================================
    useEffect(() => {
        if (!useMultiCourseFlow) return
        if (!selectedCourse?._id) return

        const courseId = selectedCourse._id

        const alreadyExists = (selectedCourses || []).some(
            sc =>
                String(sc.course?._id) === String(courseId) &&
                (sc.course?.__variant || null) === (selectedCourse.__variant || null)
        )
        if (alreadyExists) return

        const uid = `${courseId}_${selectedCourse.__variant || "default"}_${Date.now()}`

        // Only carry over a session the user had already manually
        // selected — never auto-pick one.
        const sessionToUse = selectedSession?._id ? selectedSession : null

        setSelectedCourses(prev => [
            {
                course: selectedCourse,
                session: sessionToUse,
                quantity: 1,
                uid,
            },
            ...(prev || []),
        ])

        // Only collapse (show confirmed date) if the user had already
        // picked a real session — otherwise leave the calendar open
        // so they can choose a date.
        if (sessionToUse) {
            setCollapsedCourses(prev => ({ ...prev, [uid]: true }))
        }

        // Populate this course's available dates so the (open) calendar
        // has data for the user to pick from.
        axios.get(`${API_URL}/api/schedules/course/${courseId}`)
            .then(res => {
                setCourseSlots(prev => ({
                    ...prev,
                    [courseId]: filterActiveScheduleSlots(res.data),
                }))
            })
            .catch(err => console.log(err))
    }, [
        useMultiCourseFlow,
        selectedCourse?._id,
        selectedCourse?.__variant,
    ])

    // Resolution order:
    //   1. course.__variant (the user's explicit pick from the new variant dropdown)
    //   2. URL ?type=… (legacy deep-link behaviour)
    //   3. Default (without-experience / single-license / sellingPrice)
    const getCoursePrice = (course) => {
        if (!course) return 0
        const pt = course.pricingType || (course.experienceBasedBooking ? "experience" : "standard")
        const v  = course.__variant || null

        if (pt === "slbl") {
            if (v === "slbl" || (v == null && bookingType === "slbl")) return bookingType === "sl" ? (course.slSinglePrice || 0) : (course.slblPrice || 0)
            return course.slSinglePrice || 0
        }
        if (pt === "experience") {
            if (v === "with-experience"    || (v == null && bookingType === "with-experience"))    return course.withExperiencePrice || 0
            if (v === "without-experience" || (v == null && bookingType === "without-experience")) return course.withoutExperiencePrice || 0
            return course.withoutExperiencePrice || course.withExperiencePrice || 0
        }
        return course.sellingPrice || 0
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories first for ordering
                const catRes = await axios.get(`${API_URL}/api/categories`)
                setCategoryList(catRes.data.filter(c => c.active !== false))

                const res = await axios.get(`${API_URL}/api/courses?status=Active`)
                const fetchedCourses = filterActiveCourses(res.data)
                setCourses(fetchedCourses)

                // Fetch active course IDs separately — don't let it break the courses list
                try {
                    const idsRes = await axios.get(`${API_URL}/api/schedules/active-course-ids`)
                    setActiveCourseIds(idsRes.data?.length > 0 ? idsRes.data : null)
                } catch {
                    setActiveCourseIds(null) // fallback: show all courses
                }

                if (paramCourseId && !bookingLinkData?.courseId) {
                    const selected = fetchedCourses.find(c => c._id === paramCourseId)
                    if (selected) {
                        setSelectedCourse(selected)
                        setLoadingSlots(true)
                        try {
                            const slotRes = await axios.get(`${API_URL}/api/schedules/course/${paramCourseId}`)
                            const fetchedSlots = filterActiveScheduleSlots(slotRes.data)
                            setSlots(fetchedSlots)

                            if (paramSessionId) {
                                let matched = null
                                fetchedSlots.forEach(slot => {
                                    slot.sessions?.forEach(session => {
                                        if (String(session._id) === String(paramSessionId)) {
                                            matched = { ...session, date: slot.date }
                                        }
                                    })
                                })
                                if (matched) {
                                    // Pre-select the date only; the user must pick a timing
                                    setSelectedSession({ date: matched.date })
                                }
                            }
                        } finally {
                            setLoadingSlots(false)
                        }
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }
        fetchData()
    }, [])

    useEffect(() => {
        if (!useMultiCourseFlow && selectedCourse?._id && slots.length === 0) {
            axios.get(`${API_URL}/api/schedules/course/${selectedCourse._id}`)
                .then(res => setSlots(filterActiveScheduleSlots(res.data)))
                .catch(err => console.log(err))
        }
    }, [selectedCourse])

    // ✅ Handle paramSessionId independent of paramCourseId (works with slugs)
    useEffect(() => {
        if (paramSessionId && slots.length > 0 && !processedUrlSession.current) {
            let matched = null
            slots.forEach(slot => {
                slot.sessions?.forEach(session => {
                    if (String(session._id) === String(paramSessionId)) {
                        matched = { ...session, date: slot.date }
                    }
                })
            })
            if (matched) {
                // Pre-select the date only; the user must pick a timing
                setSelectedSession({ date: matched.date })
                processedUrlSession.current = true
            }
        }
    }, [slots, paramSessionId])

    const handleCourseChange = async (courseId, variant = null) => {
        if (!courseId) { setSelectedCourse(null); setSlots([]); return }
        const selected = courses.find(c => c._id === courseId)
        if (!selected) return
        // Persist the variant (with-experience / without-experience / sl / slbl)
        // alongside the course object so price math downstream stays consistent.
        setSelectedCourse({ ...selected, __variant: variant })
        setSelectedSession(null)
        setLoadingSlots(true)
        try {
            const res = await axios.get(`${API_URL}/api/schedules/course/${courseId}`)
            setSlots(filterActiveScheduleSlots(res.data))
        } catch (err) {
            console.log(err)
        } finally {
            setLoadingSlots(false)
        }
    }

    // ✅ groupedSlots — date-wise
    const groupedSlots = slots.reduce((acc, slot) => {
        const date = slot.date
        if (!acc[date]) acc[date] = []
        acc[date].push(slot)
        return acc
    }, {})

    // ============================================================
    // ADD COURSE (company multi-course flow)
    // No date/time is auto-picked here. The course is added with an
    // empty session and its available dates are loaded so the open
    // calendar shows them — the user selects the date/time themselves.
    // ============================================================
    const handleCompanyCourseAdd = async (courseId, variant = null) => {
        if (!courseId) return

        const selected = courses.find(
            c => String(c._id) === String(courseId)
        )

        if (!selected) return

        // Prevent duplicate course + variant
        const exists = (selectedCourses || []).some(
            sc =>
                String(sc.course?._id) === String(courseId) &&
                (sc.course?.__variant || null) === (variant || null)
        )

        if (exists) {
            alert("This course is already added.")
            return
        }

        const uid = `${courseId}_${variant || "default"}_${Date.now()}`

        // Add the course immediately with no session — the calendar
        // stays open by default (collapsedCourses has no entry yet)
        // so the user can pick a date as soon as it loads.
        setSelectedCourses(prev => [
            ...(prev || []),
            {
                course: {
                    ...selected,
                    __variant: variant
                },
                session: null,
                quantity: 1,
                uid
            }
        ])

        try {
            const res = await axios.get(
                `${API_URL}/api/schedules/course/${courseId}`
            )

            // Store this course's available dates so the calendar can
            // display them for the user to choose from.
            setCourseSlots(prev => ({
                ...prev,
                [courseId]: filterActiveScheduleSlots(res.data)
            }))
        } catch (err) {
            console.error(
                "Failed to load available dates for course:",
                err
            )
        }
    }

    const handleRemoveCourse = (uid) => {
        setSelectedCourses(prev => prev.filter(sc => sc.uid !== uid))
        setCollapsedCourses(prev => {
            const copy = { ...prev }
            delete copy[uid]
            return copy
        })
    }

    const handleQuantityChange = (uid, qty) => {
        setSelectedCourses(prev => prev.map(sc =>
            sc.uid === uid ? { ...sc, quantity: Math.max(1, Number(qty)) } : sc
        ))
    }

    const handleSessionSelect = (uid, session) => {
        const current = selectedCourses.find(sc => sc.uid === uid)
        if (current?.session?._id === session._id) {
            alert("This session is already selected!")
            return
        }

        const courseId = current?.course._id
        const alreadyTaken = selectedCourses.some(sc =>
            sc.uid !== uid &&
            sc.course._id === courseId &&
            sc.session?._id === session._id
        )

        if (alreadyTaken) {
            alert("This session is already selected for another entry of the same course!")
            return
        }

        setSelectedCourses(prev => prev.map(sc =>
            sc.uid === uid ? { ...sc, session } : sc
        ))
        setCollapsedCourses(prev => ({ ...prev, [uid]: true }))
    }

    const companyTotal = selectedCourses?.reduce((sum, sc) => {
        return sum + (getCoursePrice(sc.course) * sc.quantity)
    }, 0) || 0

    const getCompanyGroupedSlots = (courseId) => {
        const raw = courseSlots[courseId] || []
        return raw.reduce((acc, slot) => {
            const date = slot.date
            if (!acc[date]) acc[date] = []
            acc[date].push(slot)
            return acc
        }, {})
    }

    const filteredCourses = courses

    const groupCoursesByCategory = (courses, categories) => {
        const grouped = {}
        const usedCourseIds = new Set()

        // 1. Process categories from the ordered list (respects Admin reorder)
        if (categories && categories.length > 0) {
            categories.forEach(cat => {
                const catName = cat.name
                const catCourses = courses.filter(c => (c.category?.name || c.category) === catName)
                if (catCourses.length > 0) {
                    // Sort courses within category by sortOrder
                    grouped[catName] = catCourses.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                    catCourses.forEach(c => usedCourseIds.add(c._id))
                }
            })
        }

        // 2. Process any remaining courses (categories not in list, or no category)
        const remainingCourses = courses.filter(c => !usedCourseIds.has(c._id))
        if (remainingCourses.length > 0) {
            remainingCourses.forEach(course => {
                const cat = course.category?.name || course.category || "Other"
                if (!grouped[cat]) grouped[cat] = []
                grouped[cat].push(course)
            })
            // Sort courses in these remaining groups
            Object.keys(grouped).forEach(cat => {
                if (!categories.some(c => c.name === cat)) {
                    grouped[cat].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                }
            })
        }

        return grouped
    }

    const groupedCourses = groupCoursesByCategory(filteredCourses, categoryList)

    // Helper for cart / order-summary rows: append a friendly variant suffix
    // ("With Experience", "Both Licenses", …) to the course title so users can
    // distinguish two cart entries of the same course at a glance.
    const titleWithVariant = (course) => {
        if (!course?.__variant) return course?.title || ""
        const v = getCourseVariants(course).find(x => x.variant === course.__variant)
        return v?.label ? `${course.title} (${v.label})` : course.title
    }

    return (
        <>
            {/* Enrolment Type */}
            {!hideEnrollmentType && (
                <div className="form-group enrollment-type-section">
                    <label className="form-label enrollment-type-title">
                        Enrolment Type <span className="form-required">*</span>
                    </label>

                    <div className="enrol-type-grid">

                        {/* INDIVIDUAL */}
                       <div 
    className={`enrol-type-card ${ 
        enrollmentType === "individual"
            ? "enrol-type-card--active"
            : ""
    } ${isCompanyRole ? "enrol-type-card--disabled" : ""}`} 
    onClick={() => {
        if (isCompanyRole) return;
        setEnrollmentType("individual");
    }}
>
                            <div className="enrol-type-top">

                                <div className="enrol-type-icon enrol-type-icon--individual">
                                    <i className="fa-solid fa-user"></i>
                                </div>

                                <div className="enrol-type-content">
                                    <div className="enrol-type-label">
                                        Individual
                                    </div>

                                    <div className="enrol-type-sub">
                                        Personal enrolment
                                    </div>
                                </div>

                                <div className="enrol-type-radio">
                                    {enrollmentType === "individual" && (
                                        <span className="enrol-type-radio-inner"></span>
                                    )}
                                </div>
                            </div>

                            <div className="enrol-type-badge enrol-type-badge--individual">
                                <i className="fa-regular fa-user"></i>
                                <span>For individual learners</span>
                            </div>
                        </div>


                        {/* COMPANY */}
                        <div 
    className={`enrol-type-card ${ 
        enrollmentType === "company"
            ? "enrol-type-card--active"
            : ""
    }`} 
    onClick={() => setEnrollmentType("company")}
>
                            <div className="enrol-type-top">

                                <div className="enrol-type-icon enrol-type-icon--company">
                                    <i className="fa-solid fa-building"></i>
                                </div>

                                <div className="enrol-type-content">
                                    <div className="enrol-type-label">
                                        Company
                                    </div>

                                    <div className="enrol-type-sub">
                                        Group / corporate booking
                                    </div>
                                </div>

                                <div className="enrol-type-radio">
                                    {enrollmentType === "company" && (
                                        <span className="enrol-type-radio-inner"></span>
                                    )}
                                </div>
                            </div>

                            <div className="enrol-type-badge enrol-type-badge--company">
                                <i className="fa-regular fa-user-group"></i>
                                <span>For teams and organizations</span>
                            </div>
                        </div>

                    </div>

                    <input
                        type="hidden"
                        name="type"
                        value={enrollmentType}
                    />
                </div>
            )}

            {/* ─────────────────────────────────────────────────── */}
            {/* ✅ SIMPLE FLOW — Individual OR Hero-bar Company    */}
            {/* ─────────────────────────────────────────────────── */}
            {!useMultiCourseFlow && (
                <>
                    {isLockedBookingLink ? (
                        <LockedBookingSummary
                            course={selectedCourse}
                            session={selectedSession}
                            linkMeta={bookingLinkData}
                        />
                    ) : (
                    <>
                    <div className="form-group">
                        <label>{isCompany ? "Add Courses" : "Select Course"}</label>
                        <CourseDropdown
                            groupedCourses={groupedCourses}
                            value={selectedCourse?._id ? { courseId: selectedCourse._id, variant: selectedCourse.__variant || null } : null}
                            onChange={handleCourseChange}
                            placeholder="Select Course"
                            getCoursePrice={getCoursePrice}
                            enrollmentType={enrollmentType}
                        />
                    </div>

                    {selectedCourse && (
                        <div className="date-selection-container" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <p className="slot-title" style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>
                                {loadingSlots ? "Loading available dates..." : `Select date for ${selectedCourse.title}`}
                            </p>

                            {loadingSlots ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: colors.textFaint }}>
                                    <div className="loading-spinner-small" style={{ marginBottom: '10px' }}></div>
                                    <p>Checking for upcoming sessions...</p>
                                </div>
                            ) : Object.keys(groupedSlots).length > 0 ? (
                                <CalendarDatePicker
                                    groupedSlots={groupedSlots}
                                    selectedSession={selectedSession}
                                    onSelectSession={setSelectedSession}
                                />
                            ) : (
                                <div style={{ textAlign: 'center', padding: '30px', background: '#fff5f5', borderRadius: '12px', border: '1px solid #feb2b2' }}>
                                    <p style={{ color: '#c53030', fontWeight: '600' }}>No upcoming sessions available for this course.</p>
                                    <p style={{ fontSize: '13px', color: colors.textFaint, marginTop: '5px' }}>Please contact us for more information or try another course.</p>
                                </div>
                            )}
                        </div>
                    )}
                    </>
                    )}
                </>
            )}

            {/* ─────────────────────────────────────────────────── */}
            {/* ✅ MULTI-COURSE FLOW — Dashboard link Company only */}
            {/* ─────────────────────────────────────────────────── */}
            {/* ============================================================
                MULTI-COURSE COMPANY FLOW
                Already selected course appears FIRST.
                + Add Course appears AFTER it.
            ============================================================ */}
            {useMultiCourseFlow && (
                <div className="company-multi-course-flow">

                    {/* ====================================================
                        EXISTING / SELECTED COURSES
                    ==================================================== */}
                    {selectedCourses?.map((sc) => (
                        <div
                            key={sc.uid}
                            className="company-cart-item"
                        >

                            {/* COURSE HEADER */}
                            <div className="company-cart-row">

                                <div className="company-cart-info">
                                    <span className="company-cart-name">
                                        {titleWithVariant(sc.course)}
                                    </span>

                                    <span className="company-cart-price">
                                        ${getCoursePrice(sc.course)} per person
                                    </span>
                                </div>

                                <div className="company-cart-controls">

                                    <label
                                        style={{
                                            fontSize: "12px",
                                            color: colors.textIcon
                                        }}
                                    >
                                        Qty
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={sc.quantity}
                                        className="company-qty-input"
                                        onChange={(e) =>
                                            handleQuantityChange(
                                                sc.uid,
                                                e.target.value
                                            )
                                        }
                                    />

                                    <span className="company-cart-subtotal">
                                        = $
                                        {getCoursePrice(sc.course) *
                                            sc.quantity}
                                    </span>

                                    <button
                                        type="button"
                                        className="company-cart-remove"
                                        onClick={() =>
                                            handleRemoveCourse(sc.uid)
                                        }
                                    >
                                        ✕
                                    </button>

                                </div>
                            </div>

                            {/* =================================================
                                SELECTED SESSION
                            ================================================= */}
                            {collapsedCourses[sc.uid] && sc.session ? (

                                <div
                                    className="company-slot-reopen"
                                    onClick={() =>
                                        setCollapsedCourses(prev => ({
                                            ...prev,
                                            [sc.uid]: false
                                        }))
                                    }
                                >
                                    ✓{" "}
                                    {new Date(
                                        sc.session.date
                                    ).toLocaleDateString("en-AU", {
                                        day: "numeric",
                                        month: "short"
                                    })}{" "}
                                    · {sc.session.startTime} -{" "}
                                    {sc.session.endTime}

                                    <span>
                                        Change date
                                    </span>
                                </div>

                            ) : (

                                /* =================================================
                                   SESSION SELECTION
                                ================================================= */
                                <div className="company-slot-section">

                                    <p className="company-slot-label">
                                        Select date for{" "}
                                        <strong>
                                            {titleWithVariant(sc.course)}
                                        </strong>
                                    </p>

                                    <CalendarDatePicker
                                        groupedSlots={getCompanyGroupedSlots(
                                            sc.course._id
                                        )}
                                        selectedSession={sc.session}
                                        onSelectSession={(session) =>
                                            handleSessionSelect(
                                                sc.uid,
                                                session
                                            )
                                        }
                                    />

                                </div>
                            )}

                        </div>
                    ))}

                    {/* ====================================================
                        ADD COURSE BUTTON
                        ALWAYS AFTER EXISTING COURSES
                    ==================================================== */}
                    <div
                        className="company-add-course-wrapper"
                        style={{
                            marginTop:
                                selectedCourses?.length > 0
                                    ? "20px"
                                    : "0"
                        }}
                    >
                        <AddCourseButton
                            groupedCourses={groupedCourses}
                            onAdd={handleCompanyCourseAdd}
                            enrollmentType={enrollmentType}
                        />
                    </div>

                    {/* ====================================================
                        ORDER SUMMARY
                        AFTER ADD COURSE
                    ==================================================== */}
                    {selectedCourses?.length > 0 && (
                        <div className="company-order-summary">

                            <div className="company-order-title">
                                🧾 Order Summary
                            </div>

                            {selectedCourses.map(sc => (
                                <div
                                    key={sc.uid}
                                    className="company-order-row"
                                >

                                    <span className="company-order-name">
                                        {titleWithVariant(sc.course)}
                                    </span>

                                    <span className="company-order-detail">
                                        {sc.session
                                            ? `${new Date(
                                                  sc.session.date
                                              ).toLocaleDateString(
                                                  "en-AU",
                                                  {
                                                      day: "numeric",
                                                      month: "short"
                                                  }
                                              )} · ${
                                                  sc.session.startTime
                                              } - ${
                                                  sc.session.endTime
                                              }`
                                            : (
                                                <span className="company-order-nodate">
                                                    ⚠ Date not selected
                                                </span>
                                            )}
                                    </span>

                                    <span className="company-order-price">
                                        $
                                        {getCoursePrice(sc.course)}
                                        {" × "}
                                        {sc.quantity}
                                        {" = $"}
                                        {getCoursePrice(sc.course) *
                                            sc.quantity}
                                    </span>

                                </div>
                            ))}

                            <div className="company-order-total">
                                Total:{" "}
                                <strong>
                                    ${companyTotal}
                                </strong>
                            </div>

                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default CourseSelection
