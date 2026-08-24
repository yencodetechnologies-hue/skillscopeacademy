import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./VocStep2.css";
import { API_URL } from "../../data/service";

// ============================================================
// FALLBACK COURSES
// ============================================================
const FALLBACK_COURSES = [
    "Conduct Telescopic materials handler operations",
    "Operate an order picking forklift truck",
    "Operate a counterbalance forklift",
    "Operate a reach forklift",
    "Conduct slinging and rigging",
    "Dogging",
    "Basic rigging",
    "Intermediate rigging",
    "Operate elevated work platform",
];

// ============================================================
// DATE HELPERS
// ============================================================
const getSydneyDateKey = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue);
    }

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Australia/Sydney",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;

    return `${year}-${month}-${day}`;
};

const formatSessionDate = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue);
    }

    return new Intl.DateTimeFormat("en-AU", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Australia/Sydney",
    }).format(date);
};

// ============================================================
// TIME HELPERS
// ============================================================
const formatTime = (time) => {
    if (!time) return "";

    const value = String(time).trim();

    // Already formatted
    if (/[ap]m/i.test(value)) {
        return value.replace(/\s+/g, " ");
    }

    // HH:mm
    const match = value.match(/^(\d{1,2}):(\d{2})$/);

    if (match) {
        let hour = Number(match[1]);
        const minute = match[2];

        const suffix = hour >= 12 ? "pm" : "am";

        if (hour === 0) hour = 12;
        if (hour > 12) hour -= 12;

        return `${hour}:${minute}${suffix}`;
    }

    return value;
};

const getTimeLabel = (session) => {
    const start = formatTime(session?.startTime);
    const end = formatTime(session?.endTime);

    if (start && end) {
        return `${start} - ${end}`;
    }

    return start || end || "Time not available";
};

// ============================================================
// COURSE HELPERS
// ============================================================
const getPricingType = (course) => {
    return (
        course?.pricingType ||
        (course?.experienceBasedBooking
            ? "experience"
            : "standard")
    );
};

const getCoursePrice = (course) => {
    return (
        Number(
            course?.vocPrice ||
                course?.sellingPrice ||
                course?.price ||
                150
        ) || 150
    );
};

// ============================================================
// COMPONENT
// ============================================================
function VocStep2({
    courses,
    setCourses,
    onNext,
    onBack,
    preselectedCourseId,
}) {
    // ========================================================
    // COURSE STATES
    // ========================================================
    const [selected, setSelected] = useState("");

    const [dbCourses, setDbCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);

    // ========================================================
    // SESSION STATES
    // ========================================================
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);

    const [sessionsError, setSessionsError] = useState("");

    // ========================================================
    // PRESELECT CONTROL
    // ========================================================
    const seededRef = useRef(false);

    // ========================================================
    // FETCH COURSES
    // ========================================================
    useEffect(() => {
        let alive = true;

        const fetchCourses = async () => {
            try {
                setCoursesLoading(true);

                const response = await axios.get(
                    `${API_URL}/api/courses?status=Active`
                );

                if (!alive) return;

                const list = Array.isArray(response.data)
                    ? response.data
                    : [];

                console.log(
                    "========== COURSES =========="
                );
                console.log(list);

                setDbCourses(list);
            } catch (error) {
                console.error(
                    "Failed to fetch courses:",
                    error
                );

                if (alive) {
                    setDbCourses([]);
                }
            } finally {
                if (alive) {
                    setCoursesLoading(false);
                }
            }
        };

        fetchCourses();

        return () => {
            alive = false;
        };
    }, []);

    // ========================================================
    // FETCH UPCOMING SESSIONS
    // ========================================================
    useEffect(() => {
        let alive = true;

        const fetchUpcomingSessions = async () => {
            try {
                setSessionsLoading(true);
                setSessionsError("");

                const response = await axios.get(
                    `${API_URL}/api/schedules/upcoming?limit=100`
                );

                if (!alive) return;

                const list = Array.isArray(response.data)
                    ? response.data
                    : [];

                console.log(
                    "========== UPCOMING SESSIONS =========="
                );

                console.log(list);

                list.forEach((item, index) => {
                    console.log(
                        `SESSION ${index + 1}`,
                        {
                            courseId:
                                item?.course?._id,
                            courseName:
                                item?.course?.title,
                            date: item?.date,
                            preferredCity:
                                item?.preferredCity,
                            startTime:
                                item?.startTime,
                            endTime:
                                item?.endTime,
                            scheduleId:
                                item?.scheduleId,
                            sessionId:
                                item?.sessionId,
                        }
                    );
                });

                setUpcomingSessions(list);
            } catch (error) {
                console.error(
                    "Failed to fetch upcoming sessions:",
                    error
                );

                if (alive) {
                    setUpcomingSessions([]);
                    setSessionsError(
                        "Unable to load available sessions."
                    );
                }
            } finally {
                if (alive) {
                    setSessionsLoading(false);
                }
            }
        };

        fetchUpcomingSessions();

        return () => {
            alive = false;
        };
    }, []);

    // ========================================================
    // GROUP COURSES
    // ========================================================
    const groupedTitles = useMemo(() => {
        if (dbCourses.length === 0) return null;

        const groups = {};

        dbCourses.forEach((course) => {
            if (!course?.title) return;

            const category =
                typeof course.category === "string" &&
                course.category
                    ? course.category
                    : course.category?.name || "Other";

            if (!groups[category]) {
                groups[category] = new Map();
            }

            const pricingType = getPricingType(course);
            const price = getCoursePrice(course);

            if (pricingType === "experience") {
                groups[category].set(
                    `${course._id}-without`,
                    {
                        name: `${course.title} (Without Experience)`,
                        price,
                        courseId: String(course._id),
                        baseCourseId: String(course._id),
                        variant: "Without Experience",
                    }
                );

                groups[category].set(
                    `${course._id}-with`,
                    {
                        name: `${course.title} (With Experience)`,
                        price,
                        courseId: String(course._id),
                        baseCourseId: String(course._id),
                        variant: "With Experience",
                    }
                );
            } else if (pricingType === "slbl") {
                groups[category].set(
                    `${course._id}-single`,
                    {
                        name: `${course.title} (Single License)`,
                        price,
                        courseId: String(course._id),
                        baseCourseId: String(course._id),
                        variant: "Single License",
                    }
                );

                groups[category].set(
                    `${course._id}-both`,
                    {
                        name: `${course.title} (Both Licenses)`,
                        price,
                        courseId: String(course._id),
                        baseCourseId: String(course._id),
                        variant: "Both Licenses",
                    }
                );
            } else {
                groups[category].set(
                    `${course._id}-standard`,
                    {
                        name: course.title,
                        price,
                        courseId: String(course._id),
                        baseCourseId: String(course._id),
                        variant: "Standard",
                    }
                );
            }
        });

        const output = {};

        Object.keys(groups)
            .sort()
            .forEach((category) => {
                output[category] = Array.from(
                    groups[category].values()
                ).sort((a, b) =>
                    a.name.localeCompare(b.name)
                );
            });

        return output;
    }, [dbCourses]);

    // ========================================================
    // GET COURSE ID
    // ========================================================
    const getCourseId = (course) => {
        if (!course) return "";

        if (course.baseCourseId) {
            return String(course.baseCourseId);
        }

        if (course.courseId) {
            return String(course.courseId);
        }

        const found = dbCourses.find(
            (item) =>
                item?.title === course?.name
        );

        return found?._id
            ? String(found._id)
            : "";
    };

    // ========================================================
    // GET SESSIONS FOR COURSE
    // ========================================================
    const getCourseSessions = (course) => {
        const courseId = getCourseId(course);

        if (!courseId) return [];

        return upcomingSessions.filter(
            (session) => {
                const sessionCourseId =
                    session?.course?._id ||
                    session?.course?.id ||
                    session?.courseId;

                return (
                    String(sessionCourseId) ===
                    String(courseId)
                );
            }
        );
    };

    // ========================================================
    // GET DATE OPTIONS
    // ========================================================
    const getDateOptions = (course) => {
        const sessions =
            getCourseSessions(course);

        const dateMap = new Map();

        sessions.forEach((session) => {
            if (!session?.date) return;

            const dateKey =
                getSydneyDateKey(session.date);

            if (!dateKey) return;

            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, {
                    key: dateKey,
                    value: session.date,
                    label: formatSessionDate(
                        session.date
                    ),
                });
            }
        });

        return Array.from(
            dateMap.values()
        ).sort((a, b) => {
            return (
                new Date(a.value).getTime() -
                new Date(b.value).getTime()
            );
        });
    };

    // ========================================================
    // GET SESSIONS FOR SELECTED DATE
    // ========================================================
    const getDateSessions = (
        course,
        selectedDate
    ) => {
        if (!course || !selectedDate) {
            return [];
        }

        const dateKey =
            getSydneyDateKey(selectedDate);

        return getCourseSessions(course).filter(
            (session) =>
                getSydneyDateKey(
                    session.date
                ) === dateKey
        );
    };

    // ========================================================
    // GET PREFERRED CITIES FOR SELECTED DATE
    // ========================================================
    const getPreferredCities = (
        course,
        selectedDate
    ) => {
        const sessions = getDateSessions(
            course,
            selectedDate
        );

        const cities = [];

        sessions.forEach((session) => {
            const preferredCity =
                session?.preferredCity;

            if (Array.isArray(preferredCity)) {
                preferredCity.forEach((city) => {
                    if (
                        city &&
                        !cities.some(
                            (existing) =>
                                String(existing)
                                    .toLowerCase() ===
                                String(city)
                                    .toLowerCase()
                        )
                    ) {
                        cities.push(String(city));
                    }
                });
            } else if (preferredCity) {
                const city = String(
                    preferredCity
                );

                if (
                    !cities.some(
                        (existing) =>
                            existing.toLowerCase() ===
                            city.toLowerCase()
                    )
                ) {
                    cities.push(city);
                }
            }
        });

        return cities;
    };

    // ========================================================
    // GET TIME SLOTS
    //
    // DATE + CITY
    // ========================================================
    const getTimeSlots = (
        course,
        selectedDate,
        preferredCity
    ) => {
        let sessions = getDateSessions(
            course,
            selectedDate
        );

        if (!sessions.length) {
            return [];
        }

        // If city exists, filter sessions by city
        if (preferredCity) {
            sessions = sessions.filter(
                (session) => {
                    const sessionCities =
                        Array.isArray(
                            session?.preferredCity
                        )
                            ? session.preferredCity
                            : session?.preferredCity
                              ? [
                                    session.preferredCity,
                                ]
                              : [];

                    return sessionCities.some(
                        (city) =>
                            String(city)
                                .toLowerCase() ===
                            String(
                                preferredCity
                            ).toLowerCase()
                    );
                }
            );
        }

        return sessions
            .map((session) => ({
                scheduleId:
                    session?.scheduleId || "",
                sessionId:
                    session?.sessionId || "",
                startTime:
                    session?.startTime || "",
                endTime:
                    session?.endTime || "",
                label: getTimeLabel(session),
                availableSlots:
                    session?.availableSlots ?? 0,
                spotsLabel:
                    session?.spotsLabel || "",
                spotsType:
                    session?.spotsType || "",
                sessionType:
                    session?.sessionType || "",
                location:
                    session?.location || "",
            }))
            .sort((a, b) =>
                String(a.startTime).localeCompare(
                    String(b.startTime)
                )
            );
    };

    // ========================================================
    // AUTO SELECT COURSE FROM courseId
    // ========================================================
    useEffect(() => {
        if (seededRef.current) return;

        if (!preselectedCourseId) return;

        if (dbCourses.length === 0) return;

        if (courses.length > 0) {
            seededRef.current = true;
            return;
        }

        const match = dbCourses.find(
            (course) =>
                String(course?._id) ===
                String(preselectedCourseId)
        );

        if (!match) {
            console.warn(
                "Course not found:",
                preselectedCourseId
            );
            return;
        }

        const pricingType =
            getPricingType(match);

        let courseName = match.title;
        let variant = "Standard";

        if (pricingType === "experience") {
            courseName = `${match.title} (Without Experience)`;
            variant = "Without Experience";
        } else if (pricingType === "slbl") {
            courseName = `${match.title} (Single License)`;
            variant = "Single License";
        }

        const courseData = {
            name: courseName,
            price: getCoursePrice(match),

            courseId: String(match._id),
            baseCourseId: String(match._id),

            variant,

            date: "",
            preferredCity: "",
            time: "",

            scheduleId: "",
            sessionId: "",
        };

        console.log(
            "AUTO SELECTED COURSE:",
            courseData
        );

        // Set dropdown value
        setSelected(
            JSON.stringify({
                name: courseName,
                price: getCoursePrice(match),
                courseId: String(match._id),
                baseCourseId: String(match._id),
                variant,
            })
        );

        // Add course
        seededRef.current = true;

        setCourses([courseData]);
    }, [
        preselectedCourseId,
        dbCourses,
        courses.length,
        setCourses,
    ]);

    // ========================================================
    // ADD COURSE
    // ========================================================
    const addCourse = () => {
        if (!selected) {
            alert("Please select a course.");
            return;
        }

        let item;

        try {
            item = JSON.parse(selected);
        } catch (error) {
            console.error(
                "Invalid selected course:",
                error
            );
            return;
        }

        const exists = courses.some(
            (course) =>
                String(
                    course.courseId
                ) ===
                    String(item.courseId) &&
                course.name === item.name
        );

        if (exists) {
            alert(
                "This course has already been added."
            );
            return;
        }

        const newCourse = {
            name: item.name,
            price: Number(item.price) || 150,

            courseId: String(item.courseId),
            baseCourseId: String(
                item.baseCourseId ||
                    item.courseId
            ),

            variant:
                item.variant || "Standard",

            date: "",
            preferredCity: "",
            time: "",

            scheduleId: "",
            sessionId: "",
        };

        setCourses((prev) => [
            ...prev,
            newCourse,
        ]);

        setSelected("");
    };

    // ========================================================
    // REMOVE COURSE
    // ========================================================
    const removeCourse = (index) => {
        setCourses((prev) =>
            prev.filter(
                (_, i) => i !== index
            )
        );
    };

    // ========================================================
    // DATE CHANGE
    //
    // IMPORTANT:
    // Once date is selected:
    // - get city for this date
    // - get time slots for this date
    // - automatically select first city
    // ========================================================
    const handleDateChange = (
        index,
        selectedDate
    ) => {
        const course = courses[index];

        const cities = getPreferredCities(
            course,
            selectedDate
        );

        const defaultCity =
            cities.length > 0
                ? cities[0]
                : "";

        const timeSlots =
            getTimeSlots(
                course,
                selectedDate,
                defaultCity
            );

        console.log(
            "DATE SELECTED:",
            selectedDate
        );

        console.log(
            "AVAILABLE CITIES:",
            cities
        );

        console.log(
            "AVAILABLE TIME SLOTS:",
            timeSlots
        );

        // If there is only one time slot,
        // do NOT automatically select it.
        // User can choose it from dropdown.
        setCourses((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                          ...item,

                          date: selectedDate,

                          // Automatically use first
                          // preferred city for date
                          preferredCity:
                              defaultCity,

                          // User still selects time
                          time: "",

                          scheduleId: "",
                          sessionId: "",
                      }
                    : item
            )
        );
    };

    // ========================================================
    // CITY CHANGE
    // ========================================================
    const handleCityChange = (
        index,
        city
    ) => {
        const course = courses[index];

        const timeSlots =
            getTimeSlots(
                course,
                course.date,
                city
            );

        console.log(
            "CITY SELECTED:",
            city
        );

        console.log(
            "TIME SLOTS:",
            timeSlots
        );

        setCourses((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                          ...item,

                          preferredCity:
                              city,

                          time: "",

                          scheduleId: "",
                          sessionId: "",
                      }
                    : item
            )
        );
    };

    // ========================================================
    // TIME CHANGE
    // ========================================================
    const handleTimeChange = (
        index,
        timeLabel
    ) => {
        const course = courses[index];

        const timeSlots =
            getTimeSlots(
                course,
                course.date,
                course.preferredCity
            );

        const selectedSlot =
            timeSlots.find(
                (slot) =>
                    slot.label === timeLabel
            );

        if (!selectedSlot) {
            return;
        }

        console.log(
            "TIME SLOT SELECTED:",
            selectedSlot
        );

        setCourses((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                          ...item,

                          time:
                              selectedSlot.label,

                          scheduleId:
                              selectedSlot.scheduleId,

                          sessionId:
                              selectedSlot.sessionId,
                      }
                    : item
            )
        );
    };

    // ========================================================
    // VALIDATION
    // ========================================================
    const isCourseComplete = (course) => {
        return Boolean(
            course?.courseId &&
                course?.date &&
                course?.preferredCity &&
                course?.time &&
                course?.scheduleId &&
                course?.sessionId
        );
    };

    const allCoursesComplete =
        courses.length > 0 &&
        courses.every(
            isCourseComplete
        );

    // ========================================================
    // NEXT
    // ========================================================
    const handleNext = () => {
        if (courses.length === 0) {
            alert(
                "Please add at least one course."
            );
            return;
        }

        for (const course of courses) {
            if (!course.date) {
                alert(
                    `Please select a date for: ${course.name}`
                );
                return;
            }

            if (!course.preferredCity) {
                alert(
                    `Please select a preferred city for: ${course.name}`
                );
                return;
            }

            if (!course.time) {
                alert(
                    `Please select a time slot for: ${course.name}`
                );
                return;
            }

            if (!course.sessionId) {
                alert(
                    `Please select a valid time slot for: ${course.name}`
                );
                return;
            }
        }

        console.log(
            "========== FINAL COURSE DATA =========="
        );

        console.log(courses);

        onNext();
    };

    // ========================================================
    // TOTAL
    // ========================================================
    const total = courses.reduce(
        (sum, course) =>
            sum +
            (Number(course.price) || 150),
        0
    );

    // ========================================================
    // DISPLAY PRICE
    // ========================================================
    let displayPrice = 150;

    if (selected) {
        try {
            displayPrice =
                Number(
                    JSON.parse(selected).price
                ) || 150;
        } catch {
            displayPrice = 150;
        }
    } else if (courses.length === 1) {
        displayPrice =
            Number(courses[0]?.price) ||
            150;
    }

    // ========================================================
    // RENDER
    // ========================================================
    return (
        <div className="v2-wrap">

            {/* ==================================================
                HEADER
            ================================================== */}
            <div className="v2-header">
                <h2 className="v2-header-title">
                    Course Selection
                </h2>

                <p className="v2-header-sub">
                    Select the courses you wish
                    to renew —
                    <span className="v2-price-highlight">
                        ${displayPrice} per
                        course
                    </span>
                </p>
            </div>

            {/* ==================================================
                BODY
            ================================================== */}
            <div className="v2-body">

                {/* ==================================================
                    COURSE DROPDOWN
                ================================================== */}
                <label className="v2-label">
                    CHOOSE A COURSE
                </label>

                <div className="v2-select-wrap">
                    <select
                        className="v2-select"
                        value={selected}
                        onChange={(e) =>
                            setSelected(
                                e.target.value
                            )
                        }
                        disabled={
                            coursesLoading
                        }
                    >
                        <option value="">
                            {coursesLoading
                                ? "Loading courses..."
                                : "Select a course to add..."}
                        </option>

                        {groupedTitles
                            ? Object.entries(
                                  groupedTitles
                              ).map(
                                  ([
                                      category,
                                      titles,
                                  ]) => (
                                      <optgroup
                                          key={
                                              category
                                          }
                                          label={
                                              category
                                          }
                                      >
                                          {titles.map(
                                              (
                                                  item
                                              ) => (
                                                  <option
                                                      key={`${item.courseId}-${item.variant}`}
                                                      value={JSON.stringify(
                                                          item
                                                      )}
                                                  >
                                                      {
                                                          item.name
                                                      }
                                                  </option>
                                              )
                                          )}
                                      </optgroup>
                                  )
                              )
                            : FALLBACK_COURSES.map(
                                  (
                                      course
                                  ) => (
                                      <option
                                          key={
                                              course
                                          }
                                          value={JSON.stringify(
                                              {
                                                  name: course,
                                                  price: 150,
                                              }
                                          )}
                                      >
                                          {
                                              course
                                          }
                                      </option>
                                  )
                              )}
                    </select>

                    <span className="v2-chevron">
                        ▾
                    </span>
                </div>

                {/* ==================================================
                    ADD COURSE
                ================================================== */}
                <button
                    type="button"
                    className="v2-add-btn"
                    onClick={
                        addCourse
                    }
                    disabled={
                        !selected
                    }
                >
                    + &nbsp; Add Course
                </button>

                {/* ==================================================
                    SESSION LOADING
                ================================================== */}
                {sessionsLoading &&
                    courses.length >
                        0 && (
                        <div
                            style={{
                                padding:
                                    "12px 0",
                                fontSize:
                                    "14px",
                            }}
                        >
                            Loading available
                            dates...
                        </div>
                    )}

                {/* ==================================================
                    ERROR
                ================================================== */}
                {sessionsError && (
                    <div
                        style={{
                            marginTop:
                                "10px",
                            padding:
                                "10px 12px",
                            borderRadius:
                                "8px",
                            background:
                                "#fff3cd",
                            color:
                                "#856404",
                            fontSize:
                                "14px",
                        }}
                    >
                        {
                            sessionsError
                        }
                    </div>
                )}

                {/* ==================================================
                    EMPTY
                ================================================== */}
                {courses.length ===
                0 ? (
                    <div className="v2-empty-box">
                        <span className="v2-empty-icon">
                            📅
                        </span>

                        <p className="v2-empty-text">
                            No courses
                            selected yet
                        </p>

                        <p className="v2-empty-hint">
                            Add courses
                            from the
                            dropdown
                            above
                        </p>
                    </div>
                ) : (
                    <div className="v2-course-list">

                        {/* ==================================================
                            COURSE LOOP
                        ================================================== */}
                        {courses.map(
                            (
                                course,
                                index
                            ) => {

                                const dateOptions =
                                    getDateOptions(
                                        course
                                    );

                                const cityOptions =
                                    getPreferredCities(
                                        course,
                                        course.date
                                    );

                                const timeSlots =
                                    getTimeSlots(
                                        course,
                                        course.date,
                                        course.preferredCity
                                    );

                                return (
                                    <div
                                        key={`${course.courseId}-${index}`}
                                        className="v2-course-card"
                                    >

                                        {/* ==================================================
                                            COURSE TOP
                                        ================================================== */}
                                        <div className="v2-course-top">

                                            <div className="v2-course-info">

                                                <span className="v2-course-check">
                                                    ✔
                                                </span>

                                                <div>

                                                    <p className="v2-course-name">
                                                        {
                                                            course.name
                                                        }
                                                    </p>

                                                    <p className="v2-course-price">
                                                        $
                                                        {Number(
                                                            course.price ||
                                                                0
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </p>

                                                </div>

                                            </div>

                                            <button
                                                type="button"
                                                className="v2-delete-btn"
                                                onClick={() =>
                                                    removeCourse(
                                                        index
                                                    )
                                                }
                                            >
                                                🗑
                                            </button>

                                        </div>

                                        {/* ==================================================
                                            DATE
                                        ================================================== */}
                                        <div className="v2-date-section">

                                            <label className="v2-date-label">
                                                SELECT COURSE DATE *
                                            </label>

                                            <div className="v2-select-wrap">

                                                <select
                                                    className="v2-select"
                                                    value={
                                                        course.date ||
                                                        ""
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleDateChange(
                                                            index,
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    disabled={
                                                        sessionsLoading ||
                                                        dateOptions.length ===
                                                            0
                                                    }
                                                >

                                                    <option value="">
                                                        {sessionsLoading
                                                            ? "Loading dates..."
                                                            : dateOptions.length ===
                                                                0
                                                              ? "No dates available for this course"
                                                              : "Select available date..."}
                                                    </option>

                                                    {dateOptions.map(
                                                        (
                                                            date
                                                        ) => (
                                                            <option
                                                                key={
                                                                    date.key
                                                                }
                                                                value={
                                                                    date.value
                                                                }
                                                            >
                                                                {
                                                                    date.label
                                                                }
                                                            </option>
                                                        )
                                                    )}

                                                </select>

                                                <span className="v2-chevron">
                                                    ▾
                                                </span>

                                            </div>

                                            {!course.date && (
                                                <p className="v2-date-warning">
                                                    ⚠ Please select a date to continue
                                                </p>
                                            )}

                                        </div>

                                        {/* ==================================================
                                            CITY + TIME
                                            BOTH ARE DISPLAYED AFTER DATE
                                        ================================================== */}
                                        {course.date && (
                                            <div
                                                style={{
                                                    display:
                                                        "grid",
                                                    gridTemplateColumns:
                                                        "1fr 1fr",
                                                    gap:
                                                        "14px",
                                                    marginTop:
                                                        "14px",
                                                }}
                                            >

                                                {/* ==================================================
                                                    PREFERRED CITY
                                                ================================================== */}
                                                <div className="v2-date-section">

                                                    <label className="v2-date-label">
                                                        PREFERRED CITY *
                                                    </label>

                                                    <div className="v2-select-wrap">

                                                        <select
                                                            className="v2-select"
                                                            value={
                                                                course.preferredCity ||
                                                                ""
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleCityChange(
                                                                    index,
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            disabled={
                                                                cityOptions.length ===
                                                                0
                                                            }
                                                        >

                                                            <option value="">
                                                                {cityOptions.length ===
                                                                0
                                                                    ? "No city available"
                                                                    : "Select preferred city..."}
                                                            </option>

                                                            {cityOptions.map(
                                                                (
                                                                    city
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            city
                                                                        }
                                                                        value={
                                                                            city
                                                                        }
                                                                    >
                                                                        {
                                                                            city
                                                                        }
                                                                    </option>
                                                                )
                                                            )}

                                                        </select>

                                                        <span className="v2-chevron">
                                                            ▾
                                                        </span>

                                                    </div>

                                                </div>

                                                {/* ==================================================
                                                    TIME SLOT
                                                ================================================== */}
                                                <div className="v2-date-section">

                                                    <label className="v2-date-label">
                                                        SELECT TIME SLOT *
                                                    </label>

                                                    <div className="v2-select-wrap">

                                                        <select
                                                            className="v2-select"
                                                            value={
                                                                course.time ||
                                                                ""
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleTimeChange(
                                                                    index,
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            disabled={
                                                                !course.preferredCity ||
                                                                timeSlots.length ===
                                                                    0
                                                            }
                                                        >

                                                            <option value="">
                                                                {!course.preferredCity
                                                                    ? "Select city first..."
                                                                    : timeSlots.length ===
                                                                        0
                                                                      ? "No time slots available"
                                                                      : "Select time slot..."}
                                                            </option>

                                                            {timeSlots.map(
                                                                (
                                                                    slot
                                                                ) => (
                                                                    <option
                                                                        key={`${slot.scheduleId}-${slot.sessionId}`}
                                                                        value={
                                                                            slot.label
                                                                        }
                                                                        // disabled={
                                                                        //     Number(
                                                                        //         slot.availableSlots
                                                                        //     ) ===
                                                                        //     0
                                                                        // }
                                                                    >
                                                                        {
                                                                            slot.label
                                                                        }
                                                                        {slot.spotsLabel
                                                                            ? ` — ${slot.spotsLabel}`
                                                                            : ""}
                                                                    </option>
                                                                )
                                                            )}

                                                        </select>

                                                        <span className="v2-chevron">
                                                            ▾
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>
                                        )}

                                        {/* ==================================================
                                            SELECTED SESSION
                                        ================================================== */}
                                        {course.date &&
                                            course.preferredCity &&
                                            course.time && (
                                                <div
                                                    style={{
                                                        marginTop:
                                                            "14px",
                                                        padding:
                                                            "11px 14px",
                                                        borderRadius:
                                                            "8px",
                                                        background:
                                                            "#f0fdf4",
                                                        border:
                                                            "1px solid #bbf7d0",
                                                        fontSize:
                                                            "13px",
                                                    }}
                                                >

                                                    <strong>
                                                        Selected Session
                                                    </strong>

                                                    <div
                                                        style={{
                                                            marginTop:
                                                                "5px",
                                                        }}
                                                    >
                                                        📅{" "}
                                                        {formatSessionDate(
                                                            course.date
                                                        )}
                                                    </div>

                                                    <div>
                                                        📍{" "}
                                                        {
                                                            course.preferredCity
                                                        }
                                                    </div>

                                                    <div>
                                                        ⏰{" "}
                                                        {
                                                            course.time
                                                        }
                                                    </div>

                                                </div>
                                            )}

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

                {/* ==================================================
                    FOOTER
                ================================================== */}
                <div className="v2-footer">

                    <div className="v2-total">

                        <p className="v2-total-label">
                            TOTAL (
                            {
                                courses.length
                            }{" "}
                            COURSE
                            {courses.length !==
                            1
                                ? "S"
                                : ""}
                            )
                        </p>

                        <p className="v2-total-amount">
                            $
                            {total.toFixed(
                                2
                            )}
                        </p>

                    </div>

                    <div className="v2-footer-btns">

                        <button
                            type="button"
                            className="v2-back-btn"
                            onClick={
                                onBack
                            }
                        >
                            ‹ &nbsp; BACK
                        </button>

                        <button
                            type="button"
                            className="v2-next-btn"
                            onClick={
                                handleNext
                            }
                            disabled={
                                !allCoursesComplete
                            }
                            style={{
                                opacity:
                                    allCoursesComplete
                                        ? 1
                                        : 0.5,
                                cursor:
                                    allCoursesComplete
                                        ? "pointer"
                                        : "not-allowed",
                            }}
                        >
                            CONTINUE TO PAYMENT
                            &nbsp; ›
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default VocStep2;