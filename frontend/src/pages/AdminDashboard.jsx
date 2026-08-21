import {
    useState,
    useEffect,
    useRef,
    useCallback,
} from "react";

import "../styles/AdminDashboard.css";
import VOCStatsCard from "../components/voc/VocStatsCard";
import QuickActions from "../components/QuickActions";
import { API_URL } from "../data/service";

const PAGE_SIZE = 3;

/* =========================================================
   DAILY STUDENTS MODAL
========================================================= */

function DailyStudentsModal({
    date,
    anchorRef,
    onClose,
    onMouseEnter,
    onMouseLeave,
}) {
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const modalRef = useRef(null);

    /* =====================================================
       FETCH DAILY STUDENTS
    ===================================================== */

    const fetchStudents = useCallback(
        async (p) => {
            if (!date) return;

            setLoading(true);

            try {
                const res = await fetch(
                    `${API_URL}/api/flow/daily-students?date=${date}&page=${p}&limit=${PAGE_SIZE}`
                );

                if (!res.ok) {
                    throw new Error(
                        "Failed to fetch daily students"
                    );
                }

                const data = await res.json();

                setStudents(data.data || []);
                setTotalPages(
                    data.totalPages || 1
                );
                setTotal(data.total || 0);
            } catch (error) {
                console.error(
                    "Daily students fetch error:",
                    error
                );

                setStudents([]);
                setTotalPages(1);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        },
        [date]
    );

    useEffect(() => {
        setPage(1);
        fetchStudents(1);
    }, [date, fetchStudents]);

    useEffect(() => {
        if (page !== 1) {
            fetchStudents(page);
        }
    }, [page, fetchStudents]);

    /* =====================================================
       MODAL POSITION
    ===================================================== */

    const [pos, setPos] = useState({
        top: 0,
        left: 0,
    });

    useEffect(() => {
        if (anchorRef?.current) {
            const rect =
                anchorRef.current.getBoundingClientRect();

            const modalW = 720;

            let left =
                rect.left + window.scrollX;

            if (
                left + modalW >
                window.innerWidth - 10
            ) {
                left =
                    window.innerWidth -
                    modalW -
                    10;
            }

            setPos({
                top:
                    rect.bottom +
                    window.scrollY +
                    6,

                left: Math.max(10, left),
            });
        }
    }, [anchorRef]);

    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDate = (d) => {
        if (!d) return "—";

        const [y, m, day] = d.split("-");

        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        return `${parseInt(day)} ${
            months[parseInt(m) - 1]
        } ${y}`;
    };

    return (
        <div
            ref={modalRef}
            className="daily-modal"
            style={{
                top: pos.top,
                left: pos.left,
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* HEADER */}

            <div className="daily-modal-header">
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    <span className="daily-modal-title">
                        📅 {formatDate(date)}
                    </span>

                    <span className="daily-modal-count">
                        {total} booking
                        {total !== 1 ? "s" : ""}
                    </span>
                </div>

                <button
                    className="daily-modal-close"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>

            {/* CONTENT */}

            {loading ? (
                <div className="daily-modal-loading">
                    Loading...
                </div>
            ) : students.length === 0 ? (
                <div className="daily-modal-empty">
                    No bookings for this date.
                </div>
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
                                    <tr
                                        key={
                                            s.bookingId
                                        }
                                    >
                                        <td>
                                            <span className="booking-id-chip">
                                                {
                                                    s.bookingId
                                                }
                                            </span>
                                        </td>

                                        <td className="name-cell">
                                            {s.name}
                                        </td>

                                        <td className="email-cell">
                                            {s.email}
                                        </td>

                                        <td>
                                            {s.phone}
                                        </td>

                                        <td>
                                            <span
                                                className={`type-badge type-${(
                                                    s.type || ""
                                                ).toLowerCase()}`}
                                            >
                                                {s.type}
                                            </span>
                                        </td>

                                        <td>
                                            {
                                                s.courseScheduleDate
                                            }
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge status-${s.status}`}
                                            >
                                                {s.status ===
                                                "active"
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="daily-modal-pagination">
                            <button
                                onClick={() =>
                                    setPage((p) =>
                                        Math.max(
                                            1,
                                            p - 1
                                        )
                                    )
                                }
                                disabled={
                                    page === 1
                                }
                            >
                                ‹ Prev
                            </button>

                            <span>
                                Page {page} of{" "}
                                {totalPages}
                            </span>

                            <button
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(
                                            totalPages,
                                            p + 1
                                        )
                                    )
                                }
                                disabled={
                                    page ===
                                    totalPages
                                }
                            >
                                Next ›
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard() {
    const [bookings, setBookings] = useState({});

    const [currentDate, setCurrentDate] =
        useState(new Date());

    /* =====================================================
       VOC STATS
    ===================================================== */

    const [vocStats, setVocStats] = useState({
        pending: 0,
        verified: 0,
        total: 0,

        // Total students for each city
        sydney: 0,
        adelaide: 0,
    });

    const [modalDate, setModalDate] =
        useState(null);

    const dayRefs = useRef({});

    const hideTimerRef = useRef(null);

    /* =====================================================
       FETCH WEEKLY BOOKINGS
    ===================================================== */

    const fetchBookings = async (date) => {
        try {
            const isoDate =
                new Date(date).toISOString();

            const response = await fetch(
                `${API_URL}/api/flow/weekly?date=${encodeURIComponent(
                    isoDate
                )}`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load booking counts"
                );
            }

            const data =
                await response.json();

            console.log(
                "Weekly booking data:",
                data
            );

            setBookings(
                data.counts || {}
            );
        } catch (error) {
            console.error(
                "Admin dashboard weekly bookings error:",
                error
            );

            setBookings({});
        }
    };

    /* =========================================================
       FETCH TOTAL CITY COUNT

       IMPORTANT:

       We DO NOT filter registerDate by today's date.

       Example:

       Sydney:
       21/08/2026 -> 3 records
       20/08/2026 -> 1 record

       Total Sydney = 4

       We use API "total" because the API itself may paginate
       the returned data.
    ========================================================= */

    const fetchCityCount = async (city) => {
        try {
            const url =
                `${API_URL}/api/students` +
                `?preferredCity=${encodeURIComponent(
                    city
                )}` +
                `&page=1&limit=10000`;

            console.log(
                "========================================"
            );

            console.log(
                `FETCHING ${city.toUpperCase()} COUNT`
            );

            console.log(
                "URL:",
                url
            );

            const response =
                await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Failed to load ${city} students`
                );
            }

            const data =
                await response.json();

            console.log(
                `${city} API RESPONSE:`,
                data
            );

            const students =
                Array.isArray(data.data)
                    ? data.data
                    : [];

            /*
             * VERY IMPORTANT
             *
             * If backend returns:
             *
             * {
             *   data: [...],
             *   total: 4
             * }
             *
             * use total = 4.
             *
             * This prevents pagination from making
             * the count incorrect.
             */

            let cityCount = 0;

            if (
                typeof data.total ===
                    "number" &&
                data.total >= 0
            ) {
                cityCount =
                    data.total;
            } else if (
                typeof data.total ===
                    "string" &&
                data.total.trim() !== ""
            ) {
                cityCount =
                    Number(data.total);
            } else {
                cityCount =
                    students.length;
            }

            /*
             * Safety fallback
             */

            if (
                !Number.isFinite(cityCount)
            ) {
                cityCount =
                    students.length;
            }

            console.log(
                `${city} DATA LENGTH:`,
                students.length
            );

            console.log(
                `${city} API TOTAL:`,
                data.total
            );

            console.log(
                `✅ FINAL ${city.toUpperCase()} COUNT:`,
                cityCount
            );

            console.log(
                "========================================"
            );

            return cityCount;
        } catch (error) {
            console.error(
                `❌ ${city} count error:`,
                error
            );

            return 0;
        }
    };

    /* =========================================================
       FETCH VOC STATS + CITY COUNTS
    ========================================================= */

    const fetchVocStats = async () => {
        try {
            /* =================================================
               1. VOC STATS
            ================================================= */

            const vocResponse =
                await fetch(
                    `${API_URL}/api/voc/stats`
                );

            if (!vocResponse.ok) {
                throw new Error(
                    "Failed to load VOC stats"
                );
            }

            const vocData =
                await vocResponse.json();

            console.log(
                "VOC STATS:",
                vocData
            );

            /* =================================================
               2. SYDNEY
            ================================================= */

            const sydneyCount =
                await fetchCityCount(
                    "Sydney"
                );

            /* =================================================
               3. ADELAIDE
            ================================================= */

            const adelaideCount =
                await fetchCityCount(
                    "Adelaide"
                );

            /* =================================================
               4. FINAL RESULT
            ================================================= */

            console.log(
                "========================================"
            );

            console.log(
                "FINAL DASHBOARD COUNTS"
            );

            console.log(
                "Sydney:",
                sydneyCount
            );

            console.log(
                "Adelaide:",
                adelaideCount
            );

            console.log(
                "========================================"
            );

            /* =================================================
               5. SET STATE
            ================================================= */

            setVocStats({
                pending:
                    vocData.pending || 0,

                verified:
                    vocData.verified || 0,

                total:
                    vocData.total || 0,

                sydney:
                    sydneyCount,

                adelaide:
                    adelaideCount,
            });
        } catch (error) {
            console.error(
                "Admin dashboard VOC/student stats error:",
                error
            );

            setVocStats({
                pending: 0,
                verified: 0,
                total: 0,
                sydney: 0,
                adelaide: 0,
            });
        }
    };

    /* =========================================================
       EFFECTS
    ========================================================= */

    useEffect(() => {
        fetchBookings(currentDate);
    }, [currentDate]);

    useEffect(() => {
        fetchVocStats();
    }, []);

    /* =========================================================
       GET WEEK
    ========================================================= */

    const getWeek = (date) => {
        const start =
            new Date(date);

        const day =
            start.getDay();

        const diff =
            start.getDate() -
            day +
            (day === 0 ? -6 : 1);

        start.setDate(diff);

        const week = [];

        for (
            let i = 0;
            i < 7;
            i++
        ) {
            const d =
                new Date(start);

            d.setDate(
                start.getDate() + i
            );

            week.push(d);
        }

        return week;
    };

    const week =
        getWeek(currentDate);

    const start =
        week[0];

    const end =
        week[6];

    const range = `${start.getDate()} ${start.toLocaleString(
        "en",
        {
            month: "short",
        }
    )} - ${end.getDate()} ${end.toLocaleString(
        "en",
        {
            month: "short",
        }
    )} ${end.getFullYear()}`;

    /* =========================================================
       WEEK NAVIGATION
    ========================================================= */

    const prevWeek = () => {
        const d =
            new Date(currentDate);

        d.setDate(
            d.getDate() - 7
        );

        setCurrentDate(d);

        setModalDate(null);
    };

    const nextWeek = () => {
        const d =
            new Date(currentDate);

        d.setDate(
            d.getDate() + 7
        );

        setCurrentDate(d);

        setModalDate(null);
    };

    /* =========================================================
       MODAL HOVER
    ========================================================= */

    const scheduleHide = () => {
        hideTimerRef.current =
            setTimeout(() => {
                setModalDate(null);
            }, 250);
    };

    const cancelHide = () => {
        clearTimeout(
            hideTimerRef.current
        );
    };

    const handleDayMouseEnter = (
        formatted,
        count
    ) => {
        if (count === 0) return;

        cancelHide();

        setModalDate(
            formatted
        );
    };

    /* =========================================================
       RETURN
    ========================================================= */

    return (
        <section
            style={{
                position: "relative",
            }}
        >
            <div>

                {/* =================================================
                    VOC + SYDNEY + ADELAIDE
                ================================================= */}

                <VOCStatsCard
                    pending={
                        vocStats.pending
                    }

                    verified={
                        vocStats.verified
                    }

                    sydney={
                        vocStats.sydney
                    }

                    adelaide={
                        vocStats.adelaide
                    }
                />

                {/* =================================================
                    WEEKLY BOOKINGS
                ================================================= */}

                <div className="calandar-div">

                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "center",
                        }}
                        className="calander-dates"
                    >
                        <h3>
                            📅 Bookings This
                            Week
                        </h3>

                        <div className="week-navigation">

                            <button
                                onClick={
                                    prevWeek
                                }
                            >
                                ‹
                            </button>

                            <span>
                                {range}
                            </span>

                            <button
                                onClick={
                                    nextWeek
                                }
                            >
                                ›
                            </button>

                        </div>
                    </div>

                    <div
                        style={{
                            overflowX:
                                "auto",
                        }}
                    >
                        <div
                            style={{
                                display:
                                    "grid",
                                gridTemplateColumns:
                                    "repeat(7, 1fr)",
                                gap: "15px",
                                marginTop:
                                    "20px",
                                minWidth:
                                    "460px",
                            }}
                        >
                            {week.map(
                                (day) => {

                                    const y =
                                        day.getFullYear();

                                    const m =
                                        String(
                                            day.getMonth() +
                                                1
                                        ).padStart(
                                            2,
                                            "0"
                                        );

                                    const d =
                                        String(
                                            day.getDate()
                                        ).padStart(
                                            2,
                                            "0"
                                        );

                                    const formatted =
                                        `${y}-${m}-${d}`;

                                    const count =
                                        bookings[
                                            formatted
                                        ] || 0;

                                    const isActive =
                                        modalDate ===
                                        formatted;

                                    const hasBookings =
                                        count > 0;

                                    if (
                                        !dayRefs
                                            .current[
                                            formatted
                                        ]
                                    ) {
                                        dayRefs.current[
                                            formatted
                                        ] = {
                                            current:
                                                null,
                                        };
                                    }

                                    return (
                                        <div
                                            className={`calandar-dates day-cell${
                                                hasBookings
                                                    ? " day-hoverable"
                                                    : ""
                                            }${
                                                isActive
                                                    ? " day-active"
                                                    : ""
                                            }`}
                                            key={
                                                formatted
                                            }
                                            ref={(
                                                el
                                            ) => {
                                                if (
                                                    !dayRefs
                                                        .current[
                                                        formatted
                                                    ]
                                                ) {
                                                    dayRefs.current[
                                                        formatted
                                                    ] = {};
                                                }

                                                dayRefs
                                                    .current[
                                                    formatted
                                                ].current =
                                                    el;
                                            }}
                                            onMouseEnter={() =>
                                                handleDayMouseEnter(
                                                    formatted,
                                                    count
                                                )
                                            }
                                            onMouseLeave={
                                                scheduleHide
                                            }
                                        >
                                            <p className="calendar-day">
                                                {day.toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        weekday:
                                                            "short",
                                                    }
                                                )}
                                            </p>

                                            <h3>
                                                {day.getDate()}
                                            </h3>

                                            <p className="booking-count">
                                                {count}
                                            </p>

                                            {hasBookings && (
                                                <span className="day-hint">
                                                    View
                                                </span>
                                            )}
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </div>

                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <QuickActions />

            </div>

            {/* =====================================================
                DAILY STUDENT MODAL
            ===================================================== */}

            {modalDate && (
                <DailyStudentsModal
                    date={
                        modalDate
                    }

                    anchorRef={
                        dayRefs.current[
                            modalDate
                        ]
                    }

                    onClose={() =>
                        setModalDate(
                            null
                        )
                    }

                    onMouseEnter={
                        cancelHide
                    }

                    onMouseLeave={
                        scheduleHide
                    }
                />
            )}

        </section>
    );
}

export default AdminDashboard;