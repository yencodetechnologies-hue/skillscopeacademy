import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/SessionsBar.css";
import { API_URL } from "../../data/service";
import BookingModal from "../course/BookingModal";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_ABBRS = [
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

/* =========================================================
   DATE PARSER
   ========================================================= */

const parseIsoDate = (dateStr) => {
  if (!dateStr) return null;

  const str =
    typeof dateStr === "string"
      ? dateStr
      : new Date(dateStr).toISOString();

  const datePart = str.split("T")[0];

  const parts = datePart.split("-").map(Number);

  if (parts.length < 3) return null;

  const year = parts[0];
  const monthIndex = parts[1] - 1;
  const day = parts[2];

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(monthIndex) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  return {
    year,
    monthIndex,
    day,
    monAbbr: MONTH_ABBRS[monthIndex],
    matchKey: `${year}-${monthIndex}-${day}`,
  };
};

/* =========================================================
   TIME PARSER
   ========================================================= */

const getTimeMinutes = (time) => {
  if (!time) return 0;

  const value = String(time).trim().toUpperCase();

  const match = value.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/
  );

  if (!match) return 0;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3];

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  return hours * 60 + minutes;
};

/* =========================================================
   DISPLAY DATE
   ========================================================= */

const formatSessionDate = (dateStr) => {
  const parsed = parseIsoDate(dateStr);

  if (!parsed) return "";

  return `${parsed.day} ${parsed.monAbbr}`;
};

/* =========================================================
   SLUGIFY
   ========================================================= */

const slugify = (text) => {
  if (!text) return "course";

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-");
};

/* =========================================================
   COMPONENT
   ========================================================= */

function SessionsBar() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);

  const [selectedCourse, setSelectedCourse] =
    useState("ALL");

  const [selectedDateKey, setSelectedDateKey] =
    useState(null);

  const [selectedTimeId, setSelectedTimeId] =
    useState(null);

  const [loading, setLoading] = useState(true);

  const [currentCalDate, setCurrentCalDate] =
    useState(new Date());

  // FIX: modal state now tracks the specific slot that was clicked,
  // instead of a bare boolean that got duplicated once per card in the map().
  const [showModal, setShowModal] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [selectedBookingSlot, setSelectedBookingSlot] = useState(null);
  console.log(selectedBookingSlot,"selectedBookingSlot");

  // FIX: "fromPortal" was referenced in BookingModal's props but never
  // declared anywhere — that was a ReferenceError waiting to crash the
  // component the first time the modal opened. Derive it from the URL
  // instead, which is how this flag is normally passed into the flow.
  const fromPortal = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      new URLSearchParams(window.location.search).get(
        "fromPortal"
      ) === "true"
    );
  }, []);

  /* =========================================================
     FETCH SESSIONS
     ========================================================= */

  useEffect(() => {
    axios
      .get(`${API_URL}/api/schedules/upcoming?limit=50`)
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : [];

        setSessions(data);

        if (data.length > 0 && data[0]?.date) {
          const parsed = parseIsoDate(data[0].date);

          if (parsed) {
            setCurrentCalDate(
              new Date(
                parsed.year,
                parsed.monthIndex,
                1
              )
            );
          }
        }
      })
      .catch((err) => {
        console.error(
          "❌ Error fetching sessions:",
          err
        );

        setSessions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /* =========================================================
     COURSE DROPDOWN LIST
     ========================================================= */

  const coursesList = useMemo(() => {
    const map = new Map();

    sessions.forEach((item) => {
      const title = item.course?.title;

      if (title && !map.has(title)) {
        map.set(title, item.course);
      }
    });

    return Array.from(map.values());
  }, [sessions]);

  /* =========================================================
     FILTER SESSIONS BY COURSE
     ========================================================= */

  const filteredSessions = useMemo(() => {
    let result = [...sessions];

    if (
      selectedCourse &&
      selectedCourse !== "ALL"
    ) {
      result = result.filter(
        (session) =>
          session.course?.title
            ?.trim()
            .toLowerCase() ===
          selectedCourse
            .trim()
            .toLowerCase()
      );
    }

    return result;
  }, [sessions, selectedCourse]);

  /* =========================================================
     GROUP SESSIONS BY EXACT DATE
     ========================================================= */

  const datesMap = useMemo(() => {
    const map = new Map();

    filteredSessions.forEach((session) => {
      if (!session.date) return;

      const parsed = parseIsoDate(session.date);

      if (!parsed) return;

      const {
        matchKey,
        year,
        monthIndex,
        day,
        monAbbr,
      } = parsed;

      if (!map.has(matchKey)) {
        map.set(matchKey, {
          matchKey,
          year,
          monthIndex,
          day,
          mon: monAbbr,
          sessions: [],
        });
      }

      map.get(matchKey).sessions.push(session);
    });

    map.forEach((dateObj) => {
      dateObj.sessions.sort(
        (a, b) =>
          getTimeMinutes(a.startTime) -
          getTimeMinutes(b.startTime)
      );
    });

    return map;
  }, [filteredSessions]);

  /* =========================================================
     ACTIVE SELECTED DATE
     ========================================================= */

  const activeDateObj = useMemo(() => {
    if (!selectedDateKey) return null;

    return datesMap.get(selectedDateKey) || null;
  }, [datesMap, selectedDateKey]);

  /* =========================================================
     VISIBLE SESSIONS
     ========================================================= */

  const visibleSessions = useMemo(() => {
    if (selectedDateKey) {
      return activeDateObj?.sessions || [];
    }

    return [...filteredSessions].sort((a, b) => {
      const dateA = parseIsoDate(a.date);
      const dateB = parseIsoDate(b.date);

      if (!dateA || !dateB) return 0;

      if (dateA.year !== dateB.year) {
        return dateA.year - dateB.year;
      }

      if (
        dateA.monthIndex !== dateB.monthIndex
      ) {
        return (
          dateA.monthIndex -
          dateB.monthIndex
        );
      }

      if (dateA.day !== dateB.day) {
        return dateA.day - dateB.day;
      }

      return (
        getTimeMinutes(a.startTime) -
        getTimeMinutes(b.startTime)
      );
    });
  }, [
    filteredSessions,
    selectedDateKey,
    activeDateObj,
  ]);

  /* =========================================================
     CALENDAR DAYS
     ========================================================= */

  const calendarDays = useMemo(() => {
    const year = currentCalDate.getFullYear();

    const monthIndex =
      currentCalDate.getMonth();

    const firstDayIndex = new Date(
      year,
      monthIndex,
      1
    ).getDay();

    const totalDaysInMonth = new Date(
      year,
      monthIndex + 1,
      0
    ).getDate();

    const days = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    for (
      let d = 1;
      d <= totalDaysInMonth;
      d++
    ) {
      const matchKey =
        `${year}-${monthIndex}-${d}`;

      const hasSlots =
        datesMap.has(matchKey);

      const dateData = hasSlots
        ? datesMap.get(matchKey)
        : null;

      days.push({
        dayNumber: d,
        matchKey,
        hasSlots,
        slotsCount: dateData
          ? dateData.sessions.length
          : 0,
      });
    }

    return days;
  }, [currentCalDate, datesMap]);

  /* =========================================================
     PREVIOUS MONTH
     ========================================================= */

  const handlePrevMonth = () => {
    setCurrentCalDate(
      new Date(
        currentCalDate.getFullYear(),
        currentCalDate.getMonth() - 1,
        1
      )
    );

    setSelectedDateKey(null);
    setSelectedTimeId(null);
  };

  /* =========================================================
     NEXT MONTH
     ========================================================= */

  const handleNextMonth = () => {
    setCurrentCalDate(
      new Date(
        currentCalDate.getFullYear(),
        currentCalDate.getMonth() + 1,
        1
      )
    );

    setSelectedDateKey(null);
    setSelectedTimeId(null);
  };

  /* =========================================================
     SLOT CLICK (navigates to full booking page)
     ========================================================= */

  const handleSlotClick = (slot) => {
    setSelectedTimeId(slot.sessionId);

    const slug =
      slot.course?.slug ||
      slugify(slot.course?.title);

    const queryParams = new URLSearchParams({
      scheduleId: slot.scheduleId || "",
      sessionId: slot.sessionId || "",
      date: slot.date || "",
      time: slot.startTime || "",
      step: "2",
    }).toString();

    setTimeout(() => {
      navigate(
        `/book-now/course/${slug}?${queryParams}`
      );
    }, 150);
  };

  /* =========================================================
     BOOK NOW CLICK (opens modal for this specific slot)
     ========================================================= */

  const handleBookNowClick = (e, slot) => {
    // FIX: without stopPropagation, this click also bubbled up to the
    // card's onClick={() => handleSlotClick(slot)}, so opening the modal
    // ALSO queued a navigate() 150ms later, yanking the user off the page
    // right after the modal appeared.
    e.stopPropagation();
    setSelectedBookingSlot(slot);
    setSelectedOptionId(null);
    setShowModal(true);
  };

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="sb-section">
        <div className="sb-container">
          <div className="sb-grid-layout">

            <div className="sb-sidebar">
              <div className="sb-skeleton-box" />
            </div>

            <div className="sb-main-content">
              <div className="sb-skeleton-box" />
            </div>

          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
     ========================================================= */

  return (
    <section className="sb-section">

      <div className="sb-container">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="sb-header">

          <span className="sb-header-label">
            FAST BOOKING
          </span>

          <h2 className="sb-header-title">
            Select Date & Time
          </h2>

          <p className="sb-header-subtitle">
            Choose your preferred course session
            and book your place.
          </p>

        </div>

        <div className="sb-grid-layout">

          {/* =================================================
              LEFT SIDEBAR
              ================================================= */}

          <aside className="sb-sidebar">

            {/* COURSE DROPDOWN */}

            <div className="sb-field-group">

              <label
                htmlFor="course-select"
                className="sb-label"
              >
                Select Course
              </label>

              <div className="sb-select-wrapper">

                <select
                  id="course-select"
                  value={selectedCourse}
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    setSelectedCourse(value);

                    setSelectedDateKey(null);
                    setSelectedTimeId(null);
                  }}
                >

                  <option value="ALL">
                    All Course
                  </option>

                  {coursesList.map(
                    (course, index) => (
                      <option
                        key={
                          course._id ||
                          index
                        }
                        value={
                          course.title
                        }
                      >
                        {course.title}
                      </option>
                    )
                  )}

                </select>

                <span className="sb-select-chevron">
                  ▾
                </span>

              </div>

            </div>

            {/* =================================================
                CALENDAR
                ================================================= */}

            <div className="sb-calendar-wrapper">

              <div className="sb-calendar-card">

                {/* CALENDAR HEADER */}

                <div className="sb-cal-header">

                  <button
                    type="button"
                    onClick={
                      handlePrevMonth
                    }
                    className="sb-cal-nav-btn"
                    aria-label="Previous month"
                  >
                    ‹
                  </button>

                  <span className="sb-cal-month-title">
                    {
                      MONTH_NAMES[
                        currentCalDate.getMonth()
                      ]
                    }{" "}
                    {
                      currentCalDate.getFullYear()
                    }
                  </span>

                  <button
                    type="button"
                    onClick={
                      handleNextMonth
                    }
                    className="sb-cal-nav-btn"
                    aria-label="Next month"
                  >
                    ›
                  </button>

                </div>

                {/* WEEKDAYS */}

                <div className="sb-cal-weekdays">

                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>

                </div>

                {/* CALENDAR GRID */}

                <div className="sb-cal-grid">

                  {calendarDays.map(
                    (item, index) => {

                      if (!item) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="sb-cal-day sb-cal-day--empty"
                          />
                        );
                      }

                      const isSelected =
                        selectedDateKey ===
                        item.matchKey;

                      return (
                        <button
                          type="button"
                          key={
                            item.matchKey
                          }
                          disabled={
                            !item.hasSlots
                          }
                          className={`
                            sb-cal-day
                            ${
                              item.hasSlots
                                ? "sb-cal-day--available"
                                : "sb-cal-day--disabled"
                            }
                            ${
                              isSelected
                                ? "sb-cal-day--selected"
                                : ""
                            }
                          `}
                          onClick={() => {

                            const nextKey =
                              isSelected
                                ? null
                                : item.matchKey;

                            setSelectedDateKey(
                              nextKey
                            );

                            setSelectedTimeId(
                              null
                            );

                          }}
                        >

                          <span className="sb-cal-day-num">
                            {
                              item.dayNumber
                            }
                          </span>

                          {item.hasSlots && (
                            <span className="sb-cal-dot" />
                          )}

                        </button>
                      );
                    }
                  )}

                </div>

              </div>

            </div>

          </aside>

          {/* =================================================
              RIGHT CONTENT
              ================================================= */}

          <main className="sb-main-content">

            {/* RIGHT HEADER */}

            <div className="sb-step-header">

              <div>

                <span className="sb-step-eyebrow">
                  AVAILABLE SESSIONS
                </span>

                <h3 className="sb-step-title">

                  {activeDateObj
                    ? `${activeDateObj.day} ${activeDateObj.mon} · ${activeDateObj.sessions.length} ${
                        activeDateObj.sessions.length === 1
                          ? "session"
                          : "sessions"
                      }`
                    : selectedCourse === "ALL"
                      ? `${visibleSessions.length} Available ${
                          visibleSessions.length === 1
                            ? "Session"
                            : "Sessions"
                        }`
                      : `${selectedCourse} · ${visibleSessions.length} ${
                          visibleSessions.length === 1
                            ? "Session"
                            : "Sessions"
                        }`
                  }

                </h3>

              </div>

            </div>

            {/* =================================================
                SESSIONS
                ================================================= */}

            {visibleSessions.length > 0 ? (

              <div className="sb-slots-list sb-fade-in">

                {visibleSessions.map((slot) => {

                  const isTimeSelected =
                    selectedTimeId ===
                    slot.sessionId;

                  const courseTitle =
                    slot.course?.title ||
                    "Course";

                  const courseCode =
                    slot.course?.courseCode ||
                    slot.course?.code ||
                    slot.course?.course_code ||
                    "";

                  return (

                    <div
                      key={
                        slot.sessionId
                      }
                      className={`
                        sb-slot-card
                        ${
                          isTimeSelected
                            ? "sb-slot-card--active"
                            : ""
                        }
                      `}
                      onClick={() =>
                        handleSlotClick(slot)
                      }
                    >

                      {/* =================================================
                          DATE
                          ================================================= */}

                      <div className="sb-slot-date-col">

                        <span className="sb-slot-date">
                          {formatSessionDate(
                            slot.date
                          )}
                        </span>

                      </div>

                      {/* =================================================
                          COURSE + TIME
                          ================================================= */}

                      <div className="sb-slot-main-col">

                        <div className="sb-slot-course-row">

                          <span className="sb-slot-course-title-main">
                            {courseTitle}
                          </span>

                          {courseCode && (
                            <span className="sb-slot-course-code">
                              {courseCode}
                            </span>
                          )}

                        </div>

                        <div className="sb-slot-time-row">

                          <span className="sb-time-icon">
                            ◷
                          </span>

                          <span className="sb-slot-time">
                            {slot.startTime ||
                              "--"}
                          </span>

                        </div>

                      </div>

                      {/* =================================================
                          LOCATION + PRICE
                          ================================================= */}

                      <div className="sb-slot-info-col">

                        {slot.location && (
                          <span className="sb-slot-tag">

                            <span className="sb-location-icon">
                              ⌖
                            </span>

                            {slot.location}

                          </span>
                        )}

                        {slot.course?.price !=
                          null && (
                          <span className="sb-slot-price">
                            $
                            {
                              slot.course
                                .price
                            }{" "}
                            AUD
                          </span>
                        )}

                      </div>

                      {/* =================================================
                          REFERRAL
                          ================================================= */}

                      {slot.referralCode && (
                        <div className="sb-referral-col">

                          <span className="sb-referral-label">
                            Referral
                          </span>

                          <span className="sb-referral-code">
                            {
                              slot.referralCode
                            }
                          </span>

                        </div>
                      )}

                      {/* =================================================
                          STATUS + BOOK
                          ================================================= */}

                      <div className="sb-slot-cta-col">

                        {slot.spotsLabel && (
                          <span
                            className={`
                              sb-status-pill
                              sb-status--${
                                slot.spotsType ||
                                "available"
                              }
                            `}
                          >
                            {
                              slot.spotsLabel
                            }
                          </span>
                        )}

                        <button
                          type="button"
                          className="sb-book-btn"
                          onClick={(e) =>
                            handleBookNowClick(e, slot)
                          }
                        >
                          Book Now

                          <span className="sb-book-arrow">
                            →
                          </span>

                        </button>

                      </div>

                    </div>

                  );
                })}

              </div>

            ) : (

              /* =================================================
                 NO SLOTS
                 ================================================= */

              <div className="sb-prompt-card">

                <div className="sb-prompt-icon">
                  ◷
                </div>

                <h3>
                  No Available Slots
                </h3>

                <p>
                  {selectedCourse !==
                  "ALL"
                    ? `There are currently no available sessions for ${selectedCourse}.`
                    : "There are currently no available sessions."}
                </p>

              </div>

            )}

          </main>

        </div>

      </div>

      {/* =================================================
          BOOKING MODAL — rendered once, outside the list,
          bound to whichever slot was actually clicked.
          ================================================= */}

      {showModal && selectedBookingSlot && (
        
        <BookingModal
          course={selectedBookingSlot.course}
          onClose={() => {
            setShowModal(false);
            setSelectedOptionId(null);
            setSelectedBookingSlot(null);
          }}
          initialSelection={selectedOptionId}
          extraQueryParams={fromPortal ? "fromPortal=true" : ""}
        />
      )}

    </section>
  );
}

export default SessionsBar;