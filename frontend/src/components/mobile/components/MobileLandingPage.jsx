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
import pbGoogleCloud from "../../../assets/pb-ggogleCloud.jpeg";

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

/* =========================================================
   HELPERS
========================================================= */

function formatDate(dateStr) {
  if (!dateStr) return "";

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

  const d = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

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
      const [hours, minutes] = value
        .split(":")
        .map(Number);

      const suffix = hours >= 12 ? "PM" : "AM";

      const hour12 = hours % 12 || 12;

      return `${hour12}:${String(minutes).padStart(
        2,
        "0"
      )} ${suffix}`;
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

/* =========================================================
   COMPONENT
========================================================= */

export default function MobileLandingPage({
  courses = [],
}) {
  const navigate = useNavigate();

  /* =========================================================
     TRUST PILLS
  ========================================================= */

  const trustPills = useMemo(
    () => [
      "10,000+ Workers Trained",
      "SafeWork NSW approved",
      "📍 Sefton NSW",
    ],
    []
  );

  /* =========================================================
     HERO
  ========================================================= */

  const [slide, setSlide] = useState(0);

  const timerRef = useRef(null);

  /* =========================================================
     SESSION STATE
  ========================================================= */

  const [sessionMap, setSessionMap] = useState({});
  const [loadingSessions, setLoadingSessions] =
    useState(true);

  /* =========================================================
     CATEGORY
  ========================================================= */

  const [dbCategories, setDbCategories] =
    useState(null);

  /* =========================================================
     VIEW ALL STATE
     
     IMPORTANT:
     This state is ONLY controlled by:
     - View All
     - Show Less
     - changing date/course
     
     Hero slider DOES NOT change this.
  ========================================================= */

  const [showAll, setShowAll] = useState(false);

  /* =========================================================
     ENQUIRE
  ========================================================= */

  const [showEnquire, setShowEnquire] =
    useState(false);

  /* =========================================================
     BOOKING MODAL
  ========================================================= */

  const [showModal, setShowModal] =
    useState(false);

  const [selectedOptionId, setSelectedOptionId] =
    useState(null);

  const [selectedBookingSlot, setSelectedBookingSlot] =
    useState(null);

  /* =========================================================
     COURSE / CALENDAR
  ========================================================= */

  const [selectedCourseId, setSelectedCourseId] =
    useState("all");

  const [selectedDateKey, setSelectedDateKey] =
    useState("");

  const [calendarMonth, setCalendarMonth] =
    useState(new Date());

  /*
   * Kept because your existing component uses it.
   * Session/time selection is NOT displayed in the cards.
   */
  const [selectedTimeByCourse, setSelectedTimeByCourse] =
    useState({});

  /* =========================================================
     FROM PORTAL
  ========================================================= */

  const fromPortal = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      new URLSearchParams(
        window.location.search
      ).get("fromPortal") === "true"
    );
  }, []);

  /* =========================================================
     FETCH CATEGORIES
  ========================================================= */

  useEffect(() => {
    let alive = true;

    axios
      .get(`${API_URL}/api/categories`)
      .then((res) => {
        if (!alive) return;

        setDbCategories(
          Array.isArray(res.data)
            ? res.data
            : []
        );
      })
      .catch(() => {
        if (alive) {
          setDbCategories([]);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  /* =========================================================
     ACTIVE COURSES
  ========================================================= */

  const activeCourses = useMemo(() => {
    return courses
      .filter(
        (c) =>
          c.status === "Active" &&
          c.image
      )
      .sort((a, b) => {
        if (!dbCategories) return 0;

        const catA = dbCategories.find(
          (db) => db.name === a.category
        );

        const catB = dbCategories.find(
          (db) => db.name === b.category
        );

        return (
          (catA?.order || 0) -
          (catB?.order || 0)
        );
      });
  }, [courses, dbCategories]);

  /* =========================================================
     HERO SLIDES
  ========================================================= */

  const heroSlides = useMemo(
    () =>
      activeCourses.map((c) => ({
        id: c._id,
        title: c.title,
        price: getCoursePriceDisplay(c),
        orig:
          getCourseOriginalDisplay(c) || "",
        courseCode: c.courseCode || "",
        image: c.image,
        slug: c.slug,
        duration: c.duration || "",
        sellingPrice: c.sellingPrice,
        location:
          c.location || "Sefton",
      })),
    [activeCourses]
  );

  const filteredHeroSlides = heroSlides;

  /* =========================================================
     HERO NEXT
     
     IMPORTANT:
     DO NOT CALL setShowAll(false) HERE.
  ========================================================= */

  const handleNextSlide = useCallback(() => {
    setSlide((prevSlide) => {
      const slideCount =
        filteredHeroSlides.length;

      if (slideCount === 0) {
        return 0;
      }

      return (
        (prevSlide + 1) %
        slideCount
      );
    });
  }, [filteredHeroSlides.length]);

  /* =========================================================
     HERO PREVIOUS
     
     IMPORTANT:
     DO NOT CALL setShowAll(false) HERE.
  ========================================================= */

  const handlePrevSlide = useCallback(() => {
    setSlide((prevSlide) => {
      const slideCount =
        filteredHeroSlides.length;

      if (slideCount === 0) {
        return 0;
      }

      return (
        (prevSlide - 1 + slideCount) %
        slideCount
      );
    });
  }, [filteredHeroSlides.length]);

  /* =========================================================
     RESTART HERO TIMER
  ========================================================= */

  const restartAutoSlideTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      handleNextSlide();
    }, 3500);
  }, [handleNextSlide]);

  /* =========================================================
     CHANGE HERO SLIDE
  ========================================================= */

  const changeSlide = (dir) => {
    if (dir === 1) {
      handleNextSlide();
    } else {
      handlePrevSlide();
    }

    restartAutoSlideTimer();
  };

  /* =========================================================
     GO TO HERO SLIDE
  ========================================================= */

  const goSlide = (index) => {
    /*
     * IMPORTANT:
     * No setShowAll(false) here.
     */
    setSlide(index);

    restartAutoSlideTimer();
  };

  /* =========================================================
     HERO TIMER
  ========================================================= */

  useEffect(() => {
    if (filteredHeroSlides.length <= 1) {
      return;
    }

    restartAutoSlideTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [
    filteredHeroSlides.length,
    restartAutoSlideTimer,
  ]);

  /* =========================================================
     RESET INVALID SLIDE
  ========================================================= */

  useEffect(() => {
    if (
      slide >= filteredHeroSlides.length &&
      filteredHeroSlides.length > 0
    ) {
      setSlide(0);
    }
  }, [
    filteredHeroSlides.length,
    slide,
  ]);

  /* =========================================================
     FETCH SESSIONS
  ========================================================= */

  useEffect(() => {
    if (heroSlides.length === 0) {
      return;
    }

    const fetchSessions = async () => {
      setLoadingSessions(true);

      try {
        const results =
          await Promise.all(
            heroSlides.map((hs) =>
              axios
                .get(
                  `${API_URL}/api/schedules/course/${hs.id}`
                )
                .then((res) => ({
                  id: hs.id,
                  data: res.data,
                  courseInfo:
                    res.data?.[0]?.course ||
                    hs,
                }))
                .catch(() => ({
                  id: hs.id,
                  data: [],
                  courseInfo: hs,
                }))
            )
          );

        const map = {};

        results.forEach(
          ({
            id,
            data,
            courseInfo,
          }) => {
            const rows = [];

            data.forEach((sched) => {
              if (
                !Array.isArray(
                  sched.sessions
                )
              ) {
                return;
              }

              sched.sessions
                .filter(
                  (sess) =>
                    sess.status === "Active"
                )
                .forEach((sess) => {
                  const rawTime =
                    getSessionTime(sess);

                  rows.push({
                    id: sess._id,

                    scheduleId:
                      sched._id,

                    /* COURSE */

                    courseId: id,

                    courseSlug:
                      courseInfo.slug,

                    courseName:
                      courseInfo.title ||
                      courseInfo.name ||
                      "",

                    courseCode:
                      courseInfo.courseCode ||
                      "",

                    /* DATE */

                    date: sched.date,

                    dateKey:
                      getDateKey(
                        sched.date
                      ),

                    /* SESSION */

                    time:
                      formatTime(
                        rawTime
                      ),

                    timeId:
                      getSessionTimeId(
                        sess
                      ),

                    location:
                      sess.location ||
                      courseInfo.location ||
                      "Sefton",

                    duration:
                      courseInfo.duration,

                    availableSlots:
                      sess.availableSlots,

                    /* PRICING */

                    pricingType:
                      courseInfo.pricingType,

                    originalPrice:
                      courseInfo.originalPrice,

                    sellingPrice:
                      courseInfo.sellingPrice,

                    vocPrice:
                      courseInfo.vocPrice,

                    slSingleStrikePrice:
                      courseInfo.slSingleStrikePrice,

                    slSinglePrice:
                      courseInfo.slSinglePrice,

                    slblStrikePrice:
                      courseInfo.slblStrikePrice,

                    slblPrice:
                      courseInfo.slblPrice,

                    withExperiencePrice:
                      courseInfo.withExperiencePrice,

                    withExperienceOriginal:
                      courseInfo.withExperienceOriginal,

                    withoutExperiencePrice:
                      courseInfo.withoutExperiencePrice,

                    withoutExperienceOriginal:
                      courseInfo.withoutExperienceOriginal,

                    priceDisplay:
                      getCoursePriceDisplay(
                        courseInfo
                      ),

                    rawSession: sess,
                  });
                });
            });

            rows.sort((a, b) => {
              const dateCompare =
                new Date(a.date) -
                new Date(b.date);

              if (dateCompare !== 0) {
                return dateCompare;
              }

              return String(
                a.time || ""
              ).localeCompare(
                String(b.time || "")
              );
            });

            if (rows.length > 0) {
              map[id] = rows;
            }
          }
        );

        setSessionMap(map);

        /*
         * Do not touch showAll here.
         * The View All state should not be reset
         * by unrelated effects.
         */
        setSlide(0);
      } catch (err) {
        console.error(
          "Session fetch error:",
          err
        );
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [heroSlides]);

  /* =========================================================
     CURRENT HERO
  ========================================================= */

  const currentSlide =
    filteredHeroSlides[slide] ??
    filteredHeroSlides[0];

  const currentCourseId =
    currentSlide?.id;

  /* =========================================================
     COURSES WITH SESSIONS
  ========================================================= */

  const coursesWithSessions = useMemo(() => {
    return heroSlides
      .filter(
        (hs) =>
          (sessionMap[hs.id] || [])
            .length > 0
      )
      .map((hs) => ({
        id: hs.id,
        title: hs.title,
        courseCode:
          hs.courseCode,
      }));
  }, [
    heroSlides,
    sessionMap,
  ]);

  /* =========================================================
     COURSE OPTIONS
  ========================================================= */

  const courseOptions = useMemo(() => {
    return [
      {
        value: "all",
        label: "All Courses",
      },

      ...coursesWithSessions.map(
        (course) => ({
          value: course.id,
          label: course.courseCode
            ? `${course.courseCode} — ${course.title}`
            : course.title,
        })
      ),
    ];
  }, [coursesWithSessions]);

  /* =========================================================
     AVAILABLE SESSIONS
  ========================================================= */

  const allAvailableSessions =
    useMemo(() => {
      const list =
        !selectedCourseId ||
        selectedCourseId === "all"
          ? Object.values(
              sessionMap
            ).flat()
          : sessionMap[
              selectedCourseId
            ] || [];

      return list
        .filter(
          (session) =>
            session?.dateKey
        )
        .sort((a, b) => {
          const dateCompare =
            a.dateKey.localeCompare(
              b.dateKey
            );

          if (dateCompare !== 0) {
            return dateCompare;
          }

          return String(
            a.time || ""
          ).localeCompare(
            String(b.time || "")
          );
        });
    }, [
      sessionMap,
      selectedCourseId,
    ]);

  /* =========================================================
     UPCOMING
  ========================================================= */

  const upcomingSessions =
    useMemo(() => {
      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      return allAvailableSessions.filter(
        (session) => {
          const sessionDate =
            new Date(
              session.date
            );

          sessionDate.setHours(
            0,
            0,
            0,
            0
          );

          return sessionDate >= today;
        }
      );
    }, [
      allAvailableSessions,
    ]);

  /* =========================================================
     AVAILABLE DATE KEYS
  ========================================================= */

  const availableDateKeys =
    useMemo(
      () =>
        new Set(
          upcomingSessions.map(
            (session) =>
              session.dateKey
          )
        ),
      [upcomingSessions]
    );

  /* =========================================================
     SELECTED DATE SESSIONS
  ========================================================= */

  const selectedDateSessions =
    useMemo(() => {
      if (!selectedDateKey) {
        return [];
      }

      return upcomingSessions.filter(
        (session) =>
          session.dateKey ===
          selectedDateKey
      );
    }, [
      upcomingSessions,
      selectedDateKey,
    ]);

  /* =========================================================
     GROUP BY COURSE
     
     Multiple sessions of same course
     = ONE COURSE CARD.
  ========================================================= */

  const groupedDateCourses =
    useMemo(() => {
      const groups = new Map();

      selectedDateSessions.forEach(
        (session) => {
          if (
            !groups.has(
              session.courseId
            )
          ) {
            groups.set(
              session.courseId,
              {
                courseId:
                  session.courseId,

                courseName:
                  session.courseName,

                courseCode:
                  session.courseCode,

                sessions: [],
              }
            );
          }

          groups
            .get(session.courseId)
            .sessions.push(session);
        }
      );

      return Array.from(
        groups.values()
      ).map((group) => ({
        ...group,

        sessions:
          group.sessions
            .slice()
            .sort((a, b) =>
              String(
                a.time || ""
              ).localeCompare(
                String(
                  b.time || ""
                )
              )
            ),
      }));
    }, [
      selectedDateSessions,
    ]);

  /* =========================================================
     PRICE ROW HELPER
  ========================================================= */

  const getCoursePriceRows =
    useCallback(
      (fullCourse) => {
        if (!fullCourse) {
          return [];
        }

        let variants;

        try {
          variants =
            getCourseVariants(
              fullCourse
            );
        } catch (error) {
          variants = null;
        }

        const variantList =
          Array.isArray(variants)
            ? variants
            : variants &&
                typeof variants ===
                  "object"
              ? Object.entries(
                  variants
                ).map(
                  ([key, value]) => ({
                    key,
                    ...(value || {}),
                  })
                )
              : [];

        return variantList
          .map((variant) => ({
            label:
              variant.label ||
              variant.name ||
              variant.key ||
              "Price",

            price:
              variant.priceDisplay ||
              variant.price ||
              variant.sellingPriceDisplay ||
              "",

            originalPrice:
              variant.originalPriceDisplay ||
              variant.originalPrice ||
              "",
          }))
          .filter(
            (variant) =>
              variant.price
          );
      },
      []
    );

  /* =========================================================
     COURSE SELECT
     
     Changing course resets View All.
  ========================================================= */

  const handleCourseSelect =
    (courseId) => {
      const newCourseId =
        courseId || "all";

      setSelectedCourseId(
        newCourseId
      );

      setSelectedDateKey("");

      /*
       * New course = collapsed
       */
      setShowAll(false);

      setSelectedTimeByCourse(
        {}
      );

      const courseSessions =
        newCourseId === "all"
          ? Object.values(
              sessionMap
            ).flat()
          : sessionMap[
              newCourseId
            ] || [];

      const dates = [
        ...new Set(
          courseSessions
            .filter(
              (session) =>
                session.dateKey
            )
            .map(
              (session) =>
                session.dateKey
            )
        ),
      ].sort();

      if (dates.length > 0) {
        const [year, month] =
          dates[0]
            .split("-")
            .map(Number);

        setCalendarMonth(
          new Date(
            year,
            month - 1,
            1
          )
        );
      }
    };

  /* =========================================================
     DATE SELECT
     
     Changing date resets View All.
  ========================================================= */

  const handleDateSelect =
    (dateKey) => {
      setSelectedDateKey(
        dateKey
      );

      /*
       * New date = collapsed
       */
      setShowAll(false);

      setSelectedTimeByCourse(
        {}
      );
    };

  /* =========================================================
     BOOK NOW
  ========================================================= */

  const handleBookNowClick =
    (session) => {
      if (!session) return;

      setSelectedBookingSlot(
        session
      );

      setSelectedOptionId(
        null
      );

      setShowModal(true);
    };

  /* =========================================================
     CATEGORY IMAGES
  ========================================================= */

  const courseImgByCat =
    useMemo(
      () =>
        activeCourses.reduce(
          (acc, course) => {
            if (
              course.category &&
              !acc[
                course.category
              ] &&
              course.image
            ) {
              acc[
                course.category
              ] = course.image;
            }

            return acc;
          },
          {}
        ),
      [activeCourses]
    );

  /* =========================================================
     COURSE COUNT
  ========================================================= */

  const courseCountByCat =
    useMemo(
      () =>
        activeCourses.reduce(
          (acc, course) => {
            if (
              course.category
            ) {
              acc[
                course.category
              ] =
                (acc[
                  course.category
                ] || 0) + 1;
            }

            return acc;
          },
          {}
        ),
      [activeCourses]
    );

  /* =========================================================
     CATEGORY CARDS
  ========================================================= */

  const categoryCards =
    useMemo(() => {
      if (
        dbCategories &&
        dbCategories.length > 0
      ) {
        return dbCategories
          .filter(
            (category) =>
              category.active !== false
          )
          .sort(
            (a, b) =>
              (a.order || 0) -
              (b.order || 0)
          )
          .map(
            (category) => ({
              category:
                category.name,

              image:
                category.image ||
                courseImgByCat[
                  category.name
                ] ||
                "",

              count:
                courseCountByCat[
                  category.name
                ] || 0,
            })
          )
          .filter(
            (category) =>
              category.count > 0
          );
      }

      return [
        ...new Map(
          activeCourses.map(
            (course) => [
              course.category,
              course,
            ]
          )
        ).values(),
      ].map((course) => ({
        category:
          course.category,

        image:
          course.image,

        count:
          activeCourses.filter(
            (item) =>
              item.category ===
              course.category
          ).length,
      }));
    }, [
      dbCategories,
      activeCourses,
      courseImgByCat,
      courseCountByCat,
    ]);

  /* =========================================================
     CALENDAR MONTH
  ========================================================= */

  const changeCalendarMonth =
    (offset) => {
      setCalendarMonth(
        (previous) =>
          new Date(
            previous.getFullYear(),
            previous.getMonth() +
              offset,
            1
          )
      );
    };

  /* =========================================================
     CALENDAR
  ========================================================= */

  const renderCalendar = () => {
    const year =
      calendarMonth.getFullYear();

    const month =
      calendarMonth.getMonth();

    const firstDay =
      new Date(
        year,
        month,
        1
      ).getDay();

    const daysInMonth =
      new Date(
        year,
        month + 1,
        0
      ).getDate();

    const cells = [];

    for (
      let i = 0;
      i < firstDay;
      i++
    ) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="mlp-calendar-empty"
        />
      );
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      const dateKey =
        `${year}-${String(
          month + 1
        ).padStart(
          2,
          "0"
        )}-${String(day).padStart(
          2,
          "0"
        )}`;

      const hasSessions =
        availableDateKeys.has(
          dateKey
        );

      const selected =
        selectedDateKey ===
        dateKey;

      const todayKey =
        getDateKey(
          new Date()
        );

      const isToday =
        todayKey === dateKey;

      cells.push(
        <button
          type="button"
          key={dateKey}
          disabled={!hasSessions}
          className={[
            "mlp-calendar-day",

            hasSessions
              ? "has-session"
              : "",

            selected
              ? "selected"
              : "",

            isToday
              ? "today"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() =>
            handleDateSelect(
              dateKey
            )
          }
        >
          <span>
            {day}
          </span>

          {hasSessions && (
            <i className="mlp-calendar-dot" />
          )}
        </button>
      );
    }

    return cells;
  };

  /* =========================================================
     COURSE FOR MODAL
  ========================================================= */

  const courseForModal =
    useMemo(
      () =>
        courses.find(
          (course) =>
            course._id ===
            selectedBookingSlot?.courseId
        ),
      [
        courses,
        selectedBookingSlot,
      ]
    );

  /* =========================================================
     HERO BOOK NOW
  ========================================================= */

  const handleHeroBookNowClick =
    () => {
      if (!currentCourseId) {
        return;
      }

      const currentCourse =
        courses.find(
          (course) =>
            course._id ===
            currentCourseId
        );

      if (!currentCourse) {
        return;
      }

      setSelectedBookingSlot({
        courseId:
          currentCourse._id,

        courseSlug:
          currentCourse.slug,
      });

      setSelectedOptionId(
        null
      );

      setShowModal(true);
    };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="mlp-root">

      <MobileNavbar
        courses={courses}
      />

      {/* =====================================================
          HERO CAROUSEL
      ===================================================== */}

      <div className="mlp-carousel">

        {filteredHeroSlides.map(
          (slideItem, index) => (
            <div
              key={
                slideItem.id ||
                index
              }
              className={`mlp-slide ${
                index === slide
                  ? "active"
                  : ""
              }`}
              onClick={
                slideItem.slug
                  ? () =>
                      navigate(
                        `/course/${slideItem.slug}`
                      )
                  : undefined
              }
              role={
                slideItem.slug
                  ? "button"
                  : undefined
              }
            >
              {slideItem.image && (
                <img
                  className="mlp-slide-bg"
                  src={cdnImage(
                    slideItem.image,
                    {
                      w: 800,
                    }
                  )}
                  alt={
                    slideItem.title ||
                    ""
                  }
                  loading={
                    index === 0
                      ? "eager"
                      : "lazy"
                  }
                  fetchPriority={
                    index === 0
                      ? "high"
                      : "low"
                  }
                  decoding="async"
                />
              )}

              <div className="mlp-slide-overlay" />

              <div className="mlp-slide-content">

                {slideItem.courseCode && (
                  <div className="mlp-slide-badge">
                    {
                      slideItem.courseCode
                    }
                  </div>
                )}

                <h2 className="mlp-slide-title">
                  {slideItem.title?.length >
                  28
                    ? `${slideItem.title.substring(
                        0,
                        28
                      )}...`
                    : slideItem.title}
                </h2>

                <p className="mlp-slide-subtitle">
                  Gain the skills. Get
                  certified. Work safely.
                </p>

                <ul className="mlp-slide-features">

                  <li>
                    <i className="fa-solid fa-shield-halved mlp-feat-ico" />

                    <span>
                      SafeWork NSW
                      Approved
                    </span>
                  </li>

                  <li>
                    <i className="fa-solid fa-users mlp-feat-ico" />

                    <span>
                      10,000+ Workers
                      Trained
                    </span>
                  </li>

                  <li>
                    <i className="fa-solid fa-location-dot mlp-feat-ico" />

                    <span>
                      Sefton NSW
                    </span>
                  </li>

                </ul>
              </div>
            </div>
          )
        )}

        <div className="mlp-carousel-controls">

          <div className="mlp-cbtn-group">

            <button
              type="button"
              className="mlp-cbtn mlp-prev"
              onClick={(event) => {
                event.stopPropagation();
                changeSlide(-1);
              }}
              aria-label="Previous Slide"
            >
              ‹
            </button>

            <button
              type="button"
              className="mlp-cbtn mlp-next"
              onClick={(event) => {
                event.stopPropagation();
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
            onClick={(event) => {
              event.stopPropagation();
              handleHeroBookNowClick();
            }}
          >
            <i className="fa-regular fa-calendar-days" />
            {" "}
            Book Now
          </button>

          <button
            type="button"
            className="mlp-btn-secondary"
            onClick={(event) => {
              event.stopPropagation();
              navigate("/voc");
            }}
          >
            <i className="fa-regular fa-file-lines" />
            {" "}
            Book VOC
          </button>

        </div>

      </div>

      {/* =====================================================
          TRUST
      ===================================================== */}

      <div className="mlp-trust-strip">

        {trustPills.map(
          (pill, index) => (
            <div
              key={index}
              className="mlp-trust-pill"
            >
              {pill}
            </div>
          )
        )}

      </div>

      {/* =====================================================
          ANNOUNCEMENT
      ===================================================== */}

      <div className="announcement-bar">
        <p>
          🔥 SUNDAY CLASSES AVAILABLE •
          ENROLL NOW • LIMITED SEATS 🔥
          NATIONALLY RECOGNIZED
          CERTIFICATES
        </p>
      </div>

      <div className="mlp-divider" />

      {/* =====================================================
          AVAILABLE SESSIONS
      ===================================================== */}

      <div className="mlp-section mlp-sessions-section">

        <div className="mlp-section-header">

          <div>
            <div className="mlp-section-label">
              Don't miss out
            </div>

            <h3 className="mlp-section-title">
              Available Sessions
            </h3>
          </div>

        </div>

        {/* LOADING */}

        {loadingSessions ? (
          <div className="mlp-session-loading">
            Loading available
            sessions...
          </div>
        ) : coursesWithSessions.length ===
          0 ? (
          <div className="mlp-no-sessions">
            No upcoming sessions
            available.
          </div>
        ) : (
          <div className="mlp-availability-wrapper">

            {/* =================================================
                COURSE SELECT
            ================================================= */}

            <div className="mlp-course-selector">

              <label className="mlp-field-label">
                Select Course
              </label>

              <div className="mlp-course-select-wrapper">

                <Select
                  className="mlp-course-select"
                  classNamePrefix="mlp"
                  value={
                    courseOptions.find(
                      (option) =>
                        option.value ===
                        selectedCourseId
                    ) ||
                    courseOptions[0]
                  }
                  onChange={(
                    selectedOption
                  ) =>
                    handleCourseSelect(
                      selectedOption?.value ||
                        "all"
                    )
                  }
                  options={
                    courseOptions
                  }
                  placeholder="Select Course"
                  isSearchable
                  isClearable={false}
                  styles={{
                    control: (
                      base
                    ) => ({
                      ...base,
                      border:
                        "none",
                      boxShadow:
                        "none",
                      outline:
                        "none",
                      backgroundColor:
                        "transparent",
                      minHeight:
                        "48px",
                      borderRadius:
                        "10px",
                    }),

                    valueContainer: (
                      base
                    ) => ({
                      ...base,
                      paddingLeft:
                        "12px",
                    }),

                    indicatorSeparator:
                      () => ({
                        display:
                          "none",
                      }),

                    dropdownIndicator: (
                      base
                    ) => ({
                      ...base,
                      color:
                        "#999",
                    }),

                    menu: (
                      base
                    ) => ({
                      ...base,
                      border:
                        "none",
                      boxShadow:
                        "0 4px 15px rgba(0,0,0,0.08)",
                      zIndex:
                        9999,
                    }),

                    option: (
                      base,
                      state
                    ) => ({
                      ...base,

                      backgroundColor:
                        state.isSelected
                          ? "#0a1e3f"
                          : state.isFocused
                          ? "#f5f7fa"
                          : "#fff",

                      color:
                        state.isSelected
                          ? "#fff"
                          : "#1f2937",

                      cursor:
                        "pointer",

                      padding:
                        "11px 14px",
                    }),
                  }}
                />

              </div>
            </div>

            {/* =================================================
                DATE
            ================================================= */}

            <div className="mlp-date-selector">

              <label className="mlp-field-label">
                Select Date
              </label>

              <div className="mlp-date-input-wrapper">

                <span className="mlp-date-calendar-icon">
                  📅
                </span>

                <input
                  type="text"
                  readOnly
                  value={
                    selectedDateKey
                      ? formatSelectedDate(
                          selectedDateKey
                        )
                      : ""
                  }
                  placeholder="Choose a date"
                  className="mlp-date-input"
                />

                <span className="mlp-date-chevron">
                  ▾
                </span>

              </div>

              {/* =================================================
                  CALENDAR
              ================================================= */}

              <div
                id="mlp-session-calendar"
                className="mlp-session-calendar open"
              >

                <div className="mlp-calendar-header">

                  <button
                    type="button"
                    onClick={() =>
                      changeCalendarMonth(
                        -1
                      )
                    }
                    aria-label="Previous month"
                  >
                    ‹
                  </button>

                  <strong>
                    {calendarMonth.toLocaleDateString(
                      "en-AU",
                      {
                        month:
                          "long",
                        year:
                          "numeric",
                      }
                    )}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      changeCalendarMonth(
                        1
                      )
                    }
                    aria-label="Next month"
                  >
                    ›
                  </button>

                </div>

                <div className="mlp-calendar-weekdays">

                  {[
                    "Sun",
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                  ].map(
                    (day) => (
                      <span
                        key={day}
                      >
                        {day}
                      </span>
                    )
                  )}

                </div>

                <div
                  id="mlp-calendar-grid"
                  className="mlp-calendar-grid"
                >
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

            {/* =================================================
                COURSE CARDS
            ================================================= */}

        {selectedDateKey && (
  <div className="mlp-course-session-section">

    {/* ================================
        HEADER
    ================================= */}
    <div className="mlp-session-section-header">

      <span className="mlp-field-label">
        Courses on{" "}
        {formatSelectedDate(selectedDateKey)}
      </span>

      {groupedDateCourses.length > 2 && (
        <button
          type="button"
          className="mlp-view-all-btn"
          onClick={() => {
            setShowAll((prev) => !prev);
          }}
        >
          {showAll ? (
            <>
              Show Less <span className="mlp-view-arrow">↑</span>
            </>
          ) : (
            <>
              View All ({groupedDateCourses.length}){" "}
              <span className="mlp-view-arrow">↓</span>
            </>
          )}
        </button>
      )}
    </div>

    {/* ================================
        COURSE LIST
    ================================= */}
    <div
      className={
        groupedDateCourses.length > 2 && showAll
          ? "mlp-session-course-list mlp-course-list-expanded"
          : "mlp-session-course-list"
      }
    >
      {groupedDateCourses.length === 0 ? (
        <div className="mlp-no-sessions">
          No sessions available on this date.
        </div>
      ) : (
        /*
         * IMPORTANT:
         *
         * When showAll = false:
         *   Only first 2 courses are rendered.
         *
         * When showAll = true:
         *   All courses are rendered inside
         *   the fixed 300px scroll container.
         */
        (showAll
          ? groupedDateCourses
          : groupedDateCourses.slice(0, 2)
        ).map((group) => {
          /*
           * We don't display sessions/time here.
           * Session selection is handled by another component.
           */
          const firstSession = group.sessions?.[0];

          const fullCourse = courses.find(
            (course) =>
              course._id === group.courseId
          );

          /* ================================
             LOCATION
          ================================= */
          const location =
            firstSession?.location ||
            fullCourse?.location ||
            "Sefton";

          /* ================================
             LOW SEAT CHECK
          ================================= */
          const low = isLow(
            firstSession?.availableSlots
          );

          /* ================================
             FALLBACK PRICE
          ================================= */
          const fallbackPrice =
            firstSession?.priceDisplay ||
            (fullCourse
              ? getCoursePriceDisplay(fullCourse)
              : "");

          return (
            <div
              key={group.courseId}
              className="mlp-scard"
            >
              <div className="mlp-scard-body">

                {/* ================================
                    COURSE NAME
                ================================= */}
                <h4 className="mlp-scard-title">
                  {group.courseName}
                </h4>

                {/* ================================
                    LOCATION + BOOK NOW
                ================================= */}
                <div className="mlp-scard-meta">

                  <div className="inline">

                    <span className="mlp-scard-meta-item">
                      <span className="mlp-icon">
                        📍
                      </span>

                      {location}
                    </span>

                  </div>

                  <div className="book-now-sec">

                    <button
                      type="button"
                      className="mlp-book-now-btn mlp-scard-book-btn"
                      onClick={() =>
                        handleBookNowClick(group)
                      }
                    >
                      Book Now
                    </button>

                  </div>

                </div>

                {/* ================================
                    PRICING
                ================================= */}
                <div className="mlp-scard-footer">

                  <div className="mlp-scard-pricing">

                    {fullCourse ? (
                      (() => {

                        const pricingType =
                          fullCourse?.pricingType ||
                          (
                            fullCourse?.experienceBasedBooking
                              ? "experience"
                              : "standard"
                          );

                        /* =================================
                           EXPERIENCE BASED
                        ================================= */
                        if (
                          pricingType === "experience" ||
                          [
                            "excavator",
                            "haul truck",
                            "skid steer",
                          ].some((keyword) =>
                            fullCourse?.title
                              ?.toLowerCase()
                              .includes(keyword)
                          )
                        ) {
                          return (
                            <>
                              {/* WITH EXPERIENCE */}
                              {(
                                fullCourse?.withExperiencePrice ||
                                fullCourse?.sellingPrice
                              ) && (
                                <div className="mlp-scard-price-row">

                                  <span className="mlp-scard-price-label">
                                    With Experience
                                  </span>

                                  <span className="mlp-scard-price-values">

                                    {fullCourse?.withExperienceOriginal && (
                                      <span className="mlp-scard-price-original">
                                        $
                                        {
                                          fullCourse.withExperienceOriginal
                                        }
                                      </span>
                                    )}

                                    <span className="mlp-scard-price-amount">
                                      $
                                      {
                                        fullCourse?.withExperiencePrice ||
                                        fullCourse?.sellingPrice
                                      }
                                    </span>

                                  </span>

                                </div>
                              )}

                              {/* WITHOUT EXPERIENCE */}
                              {(
                                fullCourse?.withoutExperiencePrice ||
                                fullCourse?.sellingPrice
                              ) && (
                                <div className="mlp-scard-price-row">

                                  <span className="mlp-scard-price-label">
                                    Without Experience
                                  </span>

                                  <span className="mlp-scard-price-values">

                                    {fullCourse?.withoutExperienceOriginal && (
                                      <span className="mlp-scard-price-original">
                                        $
                                        {
                                          fullCourse.withoutExperienceOriginal
                                        }
                                      </span>
                                    )}

                                    <span className="mlp-scard-price-amount">
                                      $
                                      {
                                        fullCourse?.withoutExperiencePrice ||
                                        fullCourse?.sellingPrice
                                      }
                                    </span>

                                  </span>

                                </div>
                              )}

                              {/* VOC */}
                              {(
                                fullCourse?.vocPrice ||
                                fullCourse?.sellingPrice
                              ) && (
                                <div className="mlp-scard-price-row">

                                  <span className="mlp-scard-price-label">
                                    VOC
                                  </span>

                                  <span className="mlp-scard-price-values">

                                    <span className="mlp-scard-price-amount">
                                      $
                                      {
                                        fullCourse?.vocPrice ||
                                        fullCourse?.sellingPrice
                                      }
                                    </span>

                                  </span>

                                </div>
                              )}
                            </>
                          );
                        }

                        /* =================================
                           SLBL
                        ================================= */
                        if (
                          pricingType === "slbl" ||
                          fullCourse?.slblPrice
                        ) {
                          return (
                            <>
                              {/* SL + BL */}
                              {fullCourse?.slblPrice && (
                                <div className="mlp-scard-price-row">

                                  <span className="mlp-scard-price-label">
                                    SL + BL
                                  </span>

                                  <span className="mlp-scard-price-values">

                                    {fullCourse?.slblStrikePrice && (
                                      <span className="mlp-scard-price-original">
                                        $
                                        {
                                          fullCourse.slblStrikePrice
                                        }
                                      </span>
                                    )}

                                    <span className="mlp-scard-price-amount">
                                      $
                                      {fullCourse.slblPrice}
                                    </span>

                                  </span>

                                </div>
                              )}

                              {/* SL OR BL */}
                              {(
                                fullCourse?.slSinglePrice ||
                                fullCourse?.sellingPrice
                              ) && (
                                <div className="mlp-scard-price-row">

                                  <span className="mlp-scard-price-label">
                                    SL or BL
                                  </span>

                                  <span className="mlp-scard-price-values">

                                    {(
                                      fullCourse?.slSingleStrikePrice ||
                                      fullCourse?.originalPrice
                                    ) && (
                                      <span className="mlp-scard-price-original">
                                        $
                                        {
                                          fullCourse?.slSingleStrikePrice ||
                                          fullCourse?.originalPrice
                                        }
                                      </span>
                                    )}

                                    <span className="mlp-scard-price-amount">
                                      $
                                      {
                                        fullCourse?.slSinglePrice ||
                                        fullCourse?.sellingPrice
                                      }
                                    </span>

                                  </span>

                                </div>
                              )}

                              {/* VOC */}
                              {(
                                fullCourse?.vocPrice ||
                                fullCourse?.sellingPrice
                              ) && (
                                <div className="mlp-scard-price-row">

                                  <span className="mlp-scard-price-label">
                                    VOC
                                  </span>

                                  <span className="mlp-scard-price-values">

                                    <span className="mlp-scard-price-amount">
                                      $
                                      {
                                        fullCourse?.vocPrice ||
                                        fullCourse?.sellingPrice
                                      }
                                    </span>

                                  </span>

                                </div>
                              )}
                            </>
                          );
                        }

                        /* =================================
                           STANDARD
                        ================================= */
                        return (
                          <>
                            {fullCourse?.sellingPrice && (
                              <div className="mlp-scard-price-row">

                                <span className="mlp-scard-price-label">
                                  Standard
                                </span>

                                <span className="mlp-scard-price-values">

                                  {fullCourse?.originalPrice && (
                                    <span className="mlp-scard-price-original">
                                      $
                                      {
                                        fullCourse.originalPrice
                                      }
                                    </span>
                                  )}

                                  <span className="mlp-scard-price-amount">
                                    $
                                    {
                                      fullCourse.sellingPrice
                                    }
                                  </span>

                                </span>

                              </div>
                            )}

                            {(
                              fullCourse?.vocPrice ||
                              fullCourse?.sellingPrice
                            ) && (
                              <div className="mlp-scard-price-row">

                                <span className="mlp-scard-price-label">
                                  VOC
                                </span>

                                <span className="mlp-scard-price-values">

                                  <span className="mlp-scard-price-amount">
                                    $
                                    {
                                      fullCourse?.vocPrice ||
                                      fullCourse?.sellingPrice
                                    }
                                  </span>

                                </span>

                              </div>
                            )}
                          </>
                        );

                      })()
                    ) : (
                      fallbackPrice &&
                      fallbackPrice !== "Enquire" && (
                        <span className="mlp-scard-price">
                          {fallbackPrice}
                        </span>
                      )
                    )}

                  </div>

                  {/* ================================
                      SEATS
                  ================================= */}
                  {!fullCourse?.image &&
                    firstSession?.availableSlots !==
                      undefined && (
                      <span
                        className={`mlp-seats-badge ${
                          low ? "low" : ""
                        }`}
                      >
                        {firstSession.availableSlots} Seats Left
                      </span>
                    )}

                </div>

              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
)}

{/* =========================================
    NO DATE SELECTED
========================================= */}
{!selectedDateKey && (
  <div className="mlp-select-date-message">
    Select a highlighted date to view available courses.
  </div>
)}


          </div>
        )}

      </div>

      {/* =====================================================
          CATEGORY GRID
      ===================================================== */}

      <div className="mlp-divider" />

      <div
        className="mlp-section"
        id="courses"
      >

        <div className="mlp-section-label">
          All Course
        </div>

        <div className="mlp-section-title">
          Browse & book
        </div>

        <div className="mlp-cat-grid">

          {categoryCards.map(
            (category) => (
              <div
                key={
                  category.category
                }
                className="mlp-cat-tile"
                onClick={() =>
                  navigate(
                    `/all-courses?category=${encodeURIComponent(
                      category.category
                    )}`
                  )
                }
              >

                <div
                  className="mlp-cat-tile-icon"
                  style={
                    category.image
                      ? {
                          backgroundImage: `url(${cdnImage(
                            category.image,
                            {
                              w: 160,
                            }
                          )})`,
                        }
                      : undefined
                  }
                >

                  {!category.image && (
                    <span className="mlp-cat-tile-initial">
                      {(
                        category.category ||
                        "?"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}

                </div>

                <div className="mlp-cat-tile-label">
                  {
                    category.category
                  }
                </div>

                <div className="mlp-cat-tile-count">
                  {category.count}{" "}
                  {category.count === 1
                    ? "course"
                    : "courses"}
                </div>

              </div>
            )
          )}

        </div>

      </div>

      {/* =====================================================
          ENQUIRE
      ===================================================== */}

      <div className="mlp-divider" />

      <div className="mlp-section mlp-section-enquire">

        <button
          className="mlp-enquire-btn"
          onClick={() =>
            setShowEnquire(true)
          }
        >
          Enquire Now
        </button>

      </div>

      {/* =====================================================
          ENQUIRE MODAL
      ===================================================== */}

      {showEnquire && (
        <div
          className="mlp-modal-backdrop"
          onClick={() =>
            setShowEnquire(false)
          }
        >

          <div
            className="mlp-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="mlp-modal-header">

              <span className="mlp-modal-title">
                Course Enquiry
              </span>

              <button
                className="mlp-modal-close"
                onClick={() =>
                  setShowEnquire(
                    false
                  )
                }
              >
                ✕
              </button>

            </div>

            <div className="mlp-modal-body">

              <div className="mlp-form-row">

                <input
                  className="mlp-input"
                  type="text"
                  placeholder="Name *"
                />

                <input
                  className="mlp-input"
                  type="tel"
                  placeholder="Phone *"
                />

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
                onClick={() =>
                  setShowEnquire(
                    false
                  )
                }
              >
                SEND ✈
              </button>

              <div className="mlp-modal-divider" />

              <p className="mlp-modal-enrol-text">
                Ready to enrol? Use the
                buttons below:
              </p>

              <div className="mlp-modal-enrol-btns">

                <a
                  href="/book-now"
                  className="mlp-modal-enrol-btn"
                >
                  ENROL NOW
                </a>

                <a
                  href="/voc"
                  className="mlp-modal-voc-btn"
                >
                  VOC
                </a>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />

      {/* =====================================================
          BOOKING MODAL
      ===================================================== */}

      {showModal &&
        selectedBookingSlot &&
        courseForModal && (
          <BookingModal
            course={
              courseForModal
            }
            onClose={() => {
              setShowModal(false);
              setSelectedOptionId(
                null
              );
              setSelectedBookingSlot(
                null
              );
            }}
            initialSelection={
              selectedOptionId
            }
            extraQueryParams={`${
              fromPortal
                ? "fromPortal=true&"
                : ""
            }${
              selectedBookingSlot.scheduleId
                ? `scheduleId=${selectedBookingSlot.scheduleId}&`
                : ""
            }${
              selectedBookingSlot.id
                ? `sessionId=${selectedBookingSlot.id}`
                : ""
            }`}
          />
        )}

      {/* =====================================================
          STICKY BUTTONS
      ===================================================== */}

      <div className="mlp-sticky">

        <button
          className="mlp-sticky-call"
          onClick={() =>
            navigate(
              "/book-now"
            )
          }
        >
          Enroll Now
        </button>

        <a
          href={ORG_PHONE_1300.wa}
          className="mlp-sticky-wa"
        >
          <span>
            <i className="fa-brands fa-whatsapp" />
          </span>
        </a>

      </div>

    </div>
  );
}