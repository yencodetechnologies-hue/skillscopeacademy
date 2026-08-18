import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";
import "../styles/MobileLandingPage.css";
import PublicNavbar from "../../PublicNavbar";
import MobileNavbar from "../../MobileNavbar";
import PromoBar from "../../landingPage/PromoBar";
import Footer from "../../landingPage/Footer";
import BookingModal from "../../course/BookingModal";
import { useNavigate } from "react-router-dom";
import pbPaypal from "../../../assets/pb-paypal.jpg";
import pbBlyncsy from "../../../assets/pb-blyncsy.webp";
import pbGoogleCloud from "../../../assets/pb-ggogleCloud.jpeg"; // fixed typo
import { API_URL } from "../../../data/service";
import { cdnImage } from "../../../utils/cdnImage";
import Select from "react-select";
import {
  getCoursePriceDisplay,
  getCourseOriginalDisplay,
  getCourseVariants,
} from "../../../utils/coursePrice";
import {
  ORG_PHONE_1300,
  ORG_PHONE_MOBILE,
} from "../../../utils/organizationPhones";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Australia/Sydney",
  });
}

function isLow(slots) {
  return typeof slots === "number" && slots <= 3;
}

function getDateKey(date) {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSelectedDate(dateKey) {
  if (!dateKey) return "Choose a date";
  const [year, month, day] = dateKey.split("-");
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "";
  if (typeof time === "string") {
    const value = time.trim();
    if (/^\d{1,2}:\d{2}$/.test(value)) {
      const [hours, minutes] = value.split(":").map(Number);
      const suffix = hours >= 12 ? "PM" : "AM";
      const hour12 = hours % 12 || 12;
      return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
    }
    return value;
  }
  return "";
}

function getSessionTime(session) {
  if (!session) return "";
  return (
    session.time ||
    session.startTime ||
    session.sessionTime ||
    session.timeSlot ||
    session.start_time ||
    session.availableTime ||
    session.available_time ||
    ""
  );
}

function getSessionTimeId(session) {
  if (!session) return "";
  return (
    session.availableTimeId ||
    session.available_time_id ||
    session.timeId ||
    session.time_id ||
    session.slotId ||
    session.slot_id ||
    ""
  );
}

export default function MobileLandingPage({ courses = [] }) {
  const trustPills = useMemo(
    () => ["10,000+ Workers Trained", "SafeWork NSW approved", "📍 Sefton NSW"],
    [],
  );

  const [slide, setSlide] = useState(0);
  const [sessionMap, setSessionMap] = useState({});
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showEnquire, setShowEnquire] = useState(false);
  const [dbCategories, setDbCategories] = useState(null);

  // Booking modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [selectedBookingSlot, setSelectedBookingSlot] = useState(null);

  // course-first selection flow
  // Defaults to "all" so the calendar is populated across every course as soon as the page loads.
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const timerRef = useRef(null);
  const navigate = useNavigate();

  const fromPortal = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      new URLSearchParams(window.location.search).get("fromPortal") === "true"
    );
  }, []);

  // Fetch categories
  useEffect(() => {
    let alive = true;
    axios
      .get(`${API_URL}/api/categories`)
      .then((res) => {
        if (!alive) return;
        setDbCategories(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (alive) setDbCategories([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Active courses only
  const activeCourses = useMemo(() => {
    return courses
      .filter((c) => c.status === "Active" && c.image)
      .sort((a, b) => {
        if (!dbCategories) return 0;
        const catA = dbCategories.find((db) => db.name === a.category);
        const catB = dbCategories.find((db) => db.name === b.category);
        return (catA?.order || 0) - (catB?.order || 0);
      });
  }, [courses, dbCategories]);

  const heroSlides = useMemo(
    () =>
      activeCourses.map((c) => ({
        id: c._id,
        title: c.title,
        price: getCoursePriceDisplay(c),
        orig: getCourseOriginalDisplay(c) || "",
        courseCode: c.courseCode || "",
        image: c.image,
        slug: c.slug,
        duration: c.duration || "",
        sellingPrice: c.sellingPrice,
        location: c.location || "Sefton",
      })),
    [activeCourses],
  );

  const filteredHeroSlides = heroSlides;

  const restartAutoSlideTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      handleNextSlide();
    }, 3500);
  }, [filteredHeroSlides.length]);

  const handleNextSlide = useCallback(() => {
    setShowAll(false);
    setSlide((prevSlide) => {
      const slideCount = filteredHeroSlides.length;
      if (slideCount === 0) return 0;
      return (prevSlide + 1) % slideCount;
    });
  }, [filteredHeroSlides.length]);

  const handlePrevSlide = useCallback(() => {
    setShowAll(false);
    setSlide((prevSlide) => {
      const slideCount = filteredHeroSlides.length;
      if (slideCount === 0) return 0;
      return (prevSlide - 1 + slideCount) % slideCount;
    });
  }, [filteredHeroSlides.length]);

  const changeSlide = (dir) => {
    if (dir === 1) handleNextSlide();
    else handlePrevSlide();
    restartAutoSlideTimer();
  };

  const goSlide = (i) => {
    setShowAll(false);
    setSlide(i);
    restartAutoSlideTimer();
  };

  useEffect(() => {
    if (filteredHeroSlides.length <= 1) return;
    restartAutoSlideTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [filteredHeroSlides.length, restartAutoSlideTimer]);

  useEffect(() => {
    if (slide >= filteredHeroSlides.length && filteredHeroSlides.length > 0) {
      setSlide(0);
    }
  }, [filteredHeroSlides.length, slide]);

  // Fetch sessions
  useEffect(() => {
    if (heroSlides.length === 0) return;

    const fetchSessions = async () => {
      setLoadingSessions(true);
      try {
        const results = await Promise.all(
          heroSlides.map((hs) =>
            axios
              .get(`${API_URL}/api/schedules/course/${hs.id}`)
              .then((res) => ({ id: hs.id, data: res.data, courseInfo: hs }))
              .catch(() => ({ id: hs.id, data: [], courseInfo: hs })),
          ),
        );

        const map = {};

        results.forEach(({ id, data, courseInfo }) => {
          const rows = [];

          data.forEach((sched) => {
            if (!Array.isArray(sched.sessions)) return;

            sched.sessions
              .filter((sess) => sess.status === "Active")
              .forEach((sess) => {
                const rawTime = getSessionTime(sess);

                rows.push({
                  id: sess._id,
                  scheduleId: sched._id,
                  courseId: id,
                  courseSlug: courseInfo.slug,
                  courseName: courseInfo.title || courseInfo.name || "",
                  courseCode: courseInfo.courseCode || "",
                  date: sched.date,
                  dateKey: getDateKey(sched.date),
                  time: formatTime(rawTime),
                  timeId: getSessionTimeId(sess),
                  location: sess.location || courseInfo.location || "Sefton",
                  duration: courseInfo.duration,
                  priceDisplay: getCoursePriceDisplay(courseInfo),
                  availableSlots: sess.availableSlots,
                  rawSession: sess,
                });
              });
          });

          rows.sort((a, b) => {
            const dateCompare = new Date(a.date) - new Date(b.date);
            if (dateCompare !== 0) return dateCompare;
            return String(a.time || "").localeCompare(String(b.time || ""));
          });

          if (rows.length > 0) map[id] = rows;
        });

        setSessionMap(map);
        setSlide(0);
        setShowAll(false);
      } catch (err) {
        console.error("Session fetch error:", err);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [heroSlides]);

  const currentSlide = filteredHeroSlides[slide] ?? filteredHeroSlides[0];
  const currentCourseId = currentSlide?.id;

  // Courses that actually have at least one session — used to populate the dropdown.
  const coursesWithSessions = useMemo(() => {
    return heroSlides
      .filter((hs) => (sessionMap[hs.id] || []).length > 0)
      .map((hs) => ({
        id: hs.id,
        title: hs.title,
        courseCode: hs.courseCode,
      }));
  }, [heroSlides, sessionMap]);

  // Declared after coursesWithSessions so it isn't read before initialization.
  const courseOptions = useMemo(() => {
    return [
      {
        value: "all",
        label: "All Courses",
      },
      ...coursesWithSessions.map((c) => ({
        value: c.id,
        label: c.courseCode ? `${c.courseCode} — ${c.title}` : c.title,
      })),
    ];
  }, [coursesWithSessions]);

  // Sessions for the currently selected course — or every course's sessions
  // flattened together when "All Courses" is selected, so the calendar has
  // dates highlighted as soon as the page loads.
  const allAvailableSessions = useMemo(() => {
    const list =
      !selectedCourseId || selectedCourseId === "all"
        ? Object.values(sessionMap).flat()
        : sessionMap[selectedCourseId] || [];

    return list
      .filter((session) => session?.dateKey)
      .sort((a, b) => {
        const dateCompare = a.dateKey.localeCompare(b.dateKey);
        if (dateCompare !== 0) return dateCompare;
        return String(a.time || "").localeCompare(String(b.time || ""));
      });
  }, [sessionMap, selectedCourseId]);

  const upcomingSessions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allAvailableSessions.filter((session) => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate >= today;
    });
  }, [allAvailableSessions]);

  const availableDateKeys = useMemo(
    () => new Set(upcomingSessions.map((session) => session.dateKey)),
    [upcomingSessions],
  );

  const selectedDateSessions = useMemo(() => {
    if (!selectedDateKey) return [];
    return upcomingSessions.filter(
      (session) => session.dateKey === selectedDateKey,
    );
  }, [upcomingSessions, selectedDateKey]);

  const availableTimeSlots = useMemo(() => {
    const map = new Map();
    selectedDateSessions.forEach((session) => {
      const key = session.time || session.timeId || "Time not specified";
      if (!map.has(key)) {
        map.set(key, {
          key,
          time: session.time,
          timeId: session.timeId,
          sessions: [],
        });
      }
      map.get(key).sessions.push(session);
    });
    return Array.from(map.values());
  }, [selectedDateSessions]);

  const selectedTimeCourses = useMemo(() => {
    if (!selectedSessionId) return [];
    const selectedSlot = availableTimeSlots.find(
      (slot) => slot.key === selectedSessionId,
    );
    return selectedSlot?.sessions || [];
  }, [availableTimeSlots, selectedSessionId]);

  const handleCourseSelect = (courseId) => {
    const newCourseId = courseId || "all";

    setSelectedCourseId(newCourseId);

    // Important:
    // Do NOT select a date automatically.
    setSelectedDateKey("");

    // Reset time/session
    setSelectedSessionId("");

    // Get sessions for selected course (or all courses) straight from sessionMap.
    const courseSessions =
      newCourseId === "all"
        ? Object.values(sessionMap).flat()
        : sessionMap[newCourseId] || [];

    // Find first available date ONLY to move the calendar to the correct month.
    const dates = [
      ...new Set(
        courseSessions
          .filter((session) => session.dateKey)
          .map((session) => session.dateKey),
      ),
    ].sort();

    if (dates.length > 0) {
      const [year, month] = dates[0].split("-").map(Number);
      setCalendarMonth(new Date(year, month - 1, 1));
    }
  };

  const handleDateSelect = (dateKey) => {
    setSelectedDateKey(dateKey);
    setSelectedSessionId("");
  };

  const sessionBookNowHref = (s) =>
    s.courseSlug
      ? `/book-now/course/${s.courseSlug}?scheduleId=${s.scheduleId}&sessionId=${s.id}`
      : `/book-now?courseId=${s.courseId}&scheduleId=${s.scheduleId}&sessionId=${s.id}`;

  const handleBookNowClick = (s) => {
    setSelectedBookingSlot(s);
    setSelectedOptionId(null);
    setShowModal(true);
  };

  // Category cards
  const courseImgByCat = useMemo(
    () =>
      activeCourses.reduce((acc, c) => {
        if (c.category && !acc[c.category] && c.image)
          acc[c.category] = c.image;
        return acc;
      }, {}),
    [activeCourses],
  );

  const courseCountByCat = useMemo(
    () =>
      activeCourses.reduce((acc, c) => {
        if (c.category) acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
      }, {}),
    [activeCourses],
  );

  const categoryCards = useMemo(() => {
    if (dbCategories && dbCategories.length > 0) {
      return dbCategories
        .filter((c) => c.active !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((c) => ({
          category: c.name,
          image: c.image || courseImgByCat[c.name] || "",
          count: courseCountByCat[c.name] || 0,
        }))
        .filter((c) => c.count > 0);
    }
    return [...new Map(activeCourses.map((c) => [c.category, c])).values()].map(
      (c) => ({
        category: c.category,
        image: c.image,
        count: activeCourses.filter((ac) => ac.category === c.category).length,
      }),
    );
  }, [dbCategories, activeCourses, courseImgByCat, courseCountByCat]);

  // Calendar helpers
  const changeCalendarMonth = (offset) => {
    setCalendarMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1),
    );
  };

  const renderCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="mlp-calendar-empty" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const hasSessions = availableDateKeys.has(dateKey);
      const selected = selectedDateKey === dateKey;
      const todayKey = getDateKey(new Date());
      const isToday = todayKey === dateKey;

      cells.push(
        <button
          type="button"
          key={dateKey}
          disabled={!hasSessions}
          className={[
            "mlp-calendar-day",
            hasSessions ? "has-session" : "",
            selected ? "selected" : "",
            isToday ? "today" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => {
            // Calendar stays open per the intended flow — no DOM class toggling here.
            handleDateSelect(dateKey);
          }}
        >
          <span>{day}</span>
          {hasSessions && <i className="mlp-calendar-dot" />}
        </button>,
      );
    }
    return cells;
  };

  const courseForModal = useMemo(
    () => courses.find((c) => c._id === selectedBookingSlot?.courseId),
    [courses, selectedBookingSlot],
  );

  const handleHeroBookNowClick = () => {
    if (!currentCourseId) return;

    const currentCourse = courses.find(
      (course) => course._id === currentCourseId,
    );

    if (!currentCourse) return;

    // Open popup for the current hero course
    setSelectedBookingSlot({
      courseId: currentCourse._id,
      courseSlug: currentCourse.slug,
    });

    setSelectedOptionId(null);
    setShowModal(true);
  };

  return (
    <div className="mlp-root">
      <MobileNavbar courses={courses} />

      {/* Hero Carousel */}
      <div className="mlp-carousel">
        {filteredHeroSlides.map((s, i) => (
          <div
            key={s.id || i}
            className={`mlp-slide ${i === slide ? "active" : ""}`}
            onClick={s.slug ? () => navigate(`/course/${s.slug}`) : undefined}
            role={s.slug ? "button" : undefined}
          >
            {s.image && (
              <img
                className="mlp-slide-bg"
                src={cdnImage(s.image, { w: 800 })}
                alt={s.title || ""}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "low"}
                decoding="async"
              />
            )}
            <div className="mlp-slide-overlay" />
            <div className="mlp-slide-content">
              {s.courseCode && (
                <div className="mlp-slide-badge">{s.courseCode}</div>
              )}
              <h2 className="mlp-slide-title">
                {s.title?.length > 28
                  ? `${s.title.substring(0, 28)}...`
                  : s.title}
              </h2>
              <p className="mlp-slide-subtitle">
                Gain the skills. Get certified. Work safely.
              </p>
              <ul className="mlp-slide-features">
                <li>
                  <i className="fa-solid fa-shield-halved mlp-feat-ico"></i>
                  <span>SafeWork NSW Approved</span>
                </li>
                <li>
                  <i className="fa-solid fa-users mlp-feat-ico"></i>
                  <span>10,000+ Workers Trained</span>
                </li>
                <li>
                  <i className="fa-solid fa-location-dot mlp-feat-ico"></i>
                  <span>Sefton NSW</span>
                </li>
              </ul>
            </div>
          </div>
        ))}

        <div className="mlp-carousel-controls">
          <div className="mlp-cbtn-group">
            <button
              type="button"
              className="mlp-cbtn mlp-prev"
              onClick={(e) => {
                e.stopPropagation();
                changeSlide(-1);
              }}
              aria-label="Previous Slide"
            >
              ‹
            </button>
            <button
              type="button"
              className="mlp-cbtn mlp-next"
              onClick={(e) => {
                e.stopPropagation();
                changeSlide(1);
              }}
              aria-label="Next Slide"
            >
              ›
            </button>
          </div>
        </div>

        <div className="mlp-slide-actions">
          <button
            type="button"
            className="mlp-btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              handleHeroBookNowClick();
            }}
          >
            <i className="fa-regular fa-calendar-days"></i> Book Now
          </button>

          <button
            type="button"
            className="mlp-btn-secondary"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/voc");
            }}
          >
            <i className="fa-regular fa-file-lines"></i> Book VOC
          </button>
        </div>
      </div>

      <div className="mlp-trust-strip">
        {trustPills.map((p, i) => (
          <div key={i} className="mlp-trust-pill">
            {p}
          </div>
        ))}
      </div>

      <div className="announcement-bar">
        <p>
          🔥 SUNDAY CLASSES AVAILABLE • ENROLL NOW • LIMITED SEATS 🔥 NATIONALLY
          RECOGNIZED CERTIFICATES
        </p>
      </div>

      {/* Available Sessions */}
      <div className="mlp-divider" />

      <div className="mlp-section mlp-sessions-section">
        {/* SECTION HEADER */}
        <div className="mlp-section-header">
          <div>
            <div className="mlp-section-label">Don't miss out</div>
            <h3 className="mlp-section-title">Available Sessions</h3>
          </div>
        </div>

        {/* LOADING */}
        {loadingSessions ? (
          <div className="mlp-session-loading">
            Loading available sessions...
          </div>
        ) : coursesWithSessions.length === 0 ? (
          <div className="mlp-no-sessions">
            No upcoming sessions available.
          </div>
        ) : (
          <div className="mlp-availability-wrapper">
            {/* COURSE SELECTOR */}
            <div className="mlp-course-selector">
              <label className="mlp-field-label">Select Course</label>

              <div className="mlp-course-select-wrapper">
                <Select
                  className="mlp-course-select"
                  classNamePrefix="mlp"
                  value={
                    courseOptions.find(
                      (option) => option.value === selectedCourseId,
                    ) || courseOptions[0]
                  }
                  onChange={(selectedOption) => {
                    handleCourseSelect(selectedOption?.value || "all");
                  }}
                  options={courseOptions}
                  placeholder="Select Course"
                  isSearchable
                  isClearable={false}
                  styles={{
                    control: (base) => ({
                      ...base,
                      border: "none",
                      boxShadow: "none",
                      outline: "none",
                      backgroundColor: "transparent",
                      minHeight: "48px",
                      borderRadius: "10px",
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      paddingLeft: "12px",
                    }),
                    indicatorSeparator: () => ({
                      display: "none",
                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      color: "#999",
                    }),
                    menu: (base) => ({
                      ...base,
                      border: "none",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                      zIndex: 9999,
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#0a1e3f"
                        : state.isFocused
                        ? "#f5f7fa"
                        : "#fff",
                      color: state.isSelected ? "#fff" : "#1f2937",
                      cursor: "pointer",
                      padding: "11px 14px",
                    }),
                  }}
                />
              </div>
            </div>

            {/* DATE SELECTOR — always displayed */}
            <div className="mlp-date-selector">
              <label className="mlp-field-label">Select Date</label>

              <div className="mlp-date-input-wrapper">
                <span className="mlp-date-calendar-icon">📅</span>
                <input
                  type="text"
                  readOnly
                  value={
                    selectedDateKey ? formatSelectedDate(selectedDateKey) : ""
                  }
                  placeholder="Choose a date"
                  className="mlp-date-input"
                />
                <span className="mlp-date-chevron">▾</span>
              </div>

              {/* CALENDAR — always open */}
              <div
                id="mlp-session-calendar"
                className="mlp-session-calendar open"
              >
                <div className="mlp-calendar-header">
                  <button
                    type="button"
                    onClick={() => changeCalendarMonth(-1)}
                    aria-label="Previous month"
                  >
                    ‹
                  </button>

                  <strong>
                    {calendarMonth.toLocaleDateString("en-AU", {
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>

                  <button
                    type="button"
                    onClick={() => changeCalendarMonth(1)}
                    aria-label="Next month"
                  >
                    ›
                  </button>
                </div>

                <div className="mlp-calendar-weekdays">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <span key={day}>{day}</span>
                    ),
                  )}
                </div>

                <div id="mlp-calendar-grid" className="mlp-calendar-grid">
                  {renderCalendar()}
                </div>

                <div className="mlp-calendar-legend">
                  <span>
                    <i />
                    Available dates
                  </span>
                </div>
              </div>
            </div>

            {/* TIME SLOTS — only after a date is selected */}
            {selectedDateKey && availableTimeSlots.length > 0 && (
              <div className="mlp-time-section">
                <div className="mlp-field-label">Choose Time</div>

                <div className="mlp-time-slots">
                  {availableTimeSlots.map((slot) => {
                    const isSelected = selectedSessionId === slot.key;

                    return (
                      <button
                        type="button"
                        key={slot.key}
                        className={[
                          "mlp-time-slot",
                          isSelected ? "selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => {
                          setSelectedSessionId(slot.key);
                        }}
                      >
                        <span className="mlp-time-icon">🕐</span>
                        <span>{slot.time || "Time available"}</span>
                        {isSelected && (
                          <span className="mlp-time-check">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NO TIME SLOTS — only after a date is picked and none exist */}
            {selectedDateKey && availableTimeSlots.length === 0 && (
              <div className="mlp-select-date-message">
                No time slots are available for this date.
              </div>
            )}

            {/* SESSION CARDS — only after a time is selected */}
            {selectedSessionId && (
              <div className="mlp-course-session-section">
                <div className="mlp-session-course-list">
                  {selectedTimeCourses.length === 0 ? (
                    <div className="mlp-no-sessions">
                      No sessions available.
                    </div>
                  ) : (
                    selectedTimeCourses.map((session) => {
                      const low = isLow(session.availableSlots);

                      return (
                        <div key={session.id} className="mlp-session-card">
                          <div className="mlp-card-header">
                            <h4 className="mlp-card-title">
                              {session.courseName}
                            </h4>

                            <button
                              type="button"
                              className="mlp-book-now-btn"
                              onClick={() => handleBookNowClick(session)}
                            >
                              Book Now
                            </button>
                          </div>

                          <div className="mlp-card-meta">
                            <div className="mlp-meta-items">
                              {session.date && (
                                <span className="mlp-meta-item">
                                  <span className="mlp-icon">📅</span>
                                  {new Date(session.date).toLocaleDateString(
                                    "en-AU",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </span>
                              )}

                              {session.location && (
                                <>
                                  <span className="mlp-meta-divider">|</span>
                                  <span className="mlp-meta-item">
                                    <span className="mlp-icon">📍</span>
                                    {session.location}
                                  </span>
                                </>
                              )}

                              {session.duration && (
                                <>
                                  <span className="mlp-meta-divider">|</span>
                                  <span className="mlp-meta-item">
                                    <span className="mlp-icon">⏳</span>
                                    {session.duration}
                                  </span>
                                </>
                              )}
                            </div>

                            {session.priceDisplay &&
                              session.priceDisplay !== "Enquire" && (
                                <div className="mlp-card-price">
                                  {session.priceDisplay}
                                </div>
                              )}
                          </div>

                          <div className="mlp-card-footer">
                            <span className="mlp-availability-text">
                              {low ? "Filling Fast" : "Seats Available"}
                            </span>

                            {session.availableSlots !== undefined && (
                              <span
                                className={`mlp-seats-badge ${
                                  low ? "low" : ""
                                }`}
                              >
                                {session.availableSlots} Seats Left
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* INITIAL MESSAGE — calendar open, no date selected yet */}
            {!selectedDateKey && (
              <div className="mlp-select-date-message">
                Select a highlighted date to view available time slots.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Grid */}
      <div className="mlp-divider" />
      <div className="mlp-section" id="courses">
        <div className="mlp-section-label">All Course</div>
        <div className="mlp-section-title">Browse & book</div>
        <div className="mlp-cat-grid">
          {categoryCards.map((cat) => (
            <div
              key={cat.category}
              className="mlp-cat-tile"
              onClick={() =>
                navigate(
                  `/all-courses?category=${encodeURIComponent(cat.category)}`,
                )
              }
            >
              <div
                className="mlp-cat-tile-icon"
                style={
                  cat.image
                    ? {
                        backgroundImage: `url(${cdnImage(cat.image, { w: 160 })})`,
                      }
                    : undefined
                }
              >
                {!cat.image && (
                  <span className="mlp-cat-tile-initial">
                    {(cat.category || "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="mlp-cat-tile-label">{cat.category}</div>
              <div className="mlp-cat-tile-count">
                {cat.count} {cat.count === 1 ? "course" : "courses"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mlp-divider" />
      <div className="mlp-section mlp-section-enquire">
        <button
          className="mlp-enquire-btn"
          onClick={() => setShowEnquire(true)}
        >
          Enquire Now
        </button>
      </div>

      {/* Enquire Modal */}
      {showEnquire && (
        <div
          className="mlp-modal-backdrop"
          onClick={() => setShowEnquire(false)}
        >
          <div className="mlp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mlp-modal-header">
              <span className="mlp-modal-title">Course Enquiry</span>
              <button
                className="mlp-modal-close"
                onClick={() => setShowEnquire(false)}
              >
                ✕
              </button>
            </div>
            <div className="mlp-modal-body">
              <div className="mlp-form-row">
                <input className="mlp-input" type="text" placeholder="Name *" />
                <input className="mlp-input" type="tel" placeholder="Phone *" />
              </div>
              <input
                className="mlp-input mlp-input-full"
                type="email"
                placeholder="Email *"
              />
              <input
                className="mlp-input mlp-input-full"
                type="text"
                placeholder="Subject"
              />
              <textarea
                className="mlp-textarea"
                placeholder="Message"
                rows={4}
              />
              <button
                className="mlp-modal-send"
                onClick={() => setShowEnquire(false)}
              >
                SEND ✈
              </button>
              <div className="mlp-modal-divider" />
              <p className="mlp-modal-enrol-text">
                Ready to enrol? Use the buttons below:
              </p>
              <div className="mlp-modal-enrol-btns">
                <a href="/book-now" className="mlp-modal-enrol-btn">
                  ENROL NOW
                </a>
                <a href="/voc" className="mlp-modal-voc-btn">
                  VOC
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {showModal && selectedBookingSlot && courseForModal && (
        <BookingModal
          course={courseForModal}
          onClose={() => {
            setShowModal(false);
            setSelectedOptionId(null);
            setSelectedBookingSlot(null);
          }}
          initialSelection={selectedOptionId}
          extraQueryParams={`${fromPortal ? "fromPortal=true&" : ""}${
            selectedBookingSlot.scheduleId
              ? `scheduleId=${selectedBookingSlot.scheduleId}&`
              : ""
          }${
            selectedBookingSlot.id ? `sessionId=${selectedBookingSlot.id}` : ""
          }`}
        />
      )}

      <div className="mlp-sticky">
        <button
          className="mlp-sticky-call"
          onClick={() => navigate("/book-now")}
        >
          Enroll Now
        </button>
        <a href={ORG_PHONE_1300.wa} className="mlp-sticky-wa">
          <span>
            <i className="fa-brands fa-whatsapp"></i>
          </span>
        </a>
      </div>
    </div>
  );
}
