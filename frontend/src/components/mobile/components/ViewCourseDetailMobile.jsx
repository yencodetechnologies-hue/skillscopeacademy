import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import MobileNavbar from "../../MobileNavbar";
import "../styles/ViewCourseDetailMobile.css";
import { API_URL } from "../../../data/service";
import { cdnImage } from "../../../utils/cdnImage";
import {
  getCoursePriceDisplay,
  getCourseOriginalDisplay,
  getCourseSavingDisplay,
  getCourseVariants,
} from "../../../utils/coursePrice";
import BookingModal from "../../course/BookingModal";
import { ORG_PHONE_1300 } from "../../../utils/organizationPhones";
import logo from "../../../assets/staLogo.png";
import PdfViewer from "../../common/PdfViewer";
import {
  FaBuildingColumns,
  FaCertificate,
  FaCalendarDays,
  FaClock,
  FaLocationDot,
  FaGraduationCap,
  FaAward,
  FaUser,
  FaStar,
  FaShieldHalved,
  FaFileLines,
  FaChevronLeft,
  FaChevronRight,
  FaWhatsapp,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa6";

// ── Mock data fallbacks (used when API fields are empty) ─────────────────────
const MOCK_ABOUT =
  "This nationally recognised course meets the requirements for working safely on construction sites across all Australian states and territories. Delivered face to face by experienced trainers with same-week enrolment available, including Sundays.";

const MOCK_OUTCOMES = [
  "Understand WHS legislative requirements for construction",
  "Identify and report common construction site hazards",
  "Apply basic risk control measures on site",
  "Correctly select, fit and use PPE equipment",
];

const MOCK_REQUIREMENTS = [
  "Minimum age 14 years",
  "100 points of original ID on the day",
  "Unique Student Identifier (USI) — free to get online",
  "Basic understanding of spoken and written English",
];

// ── Quick facts icon styling — icon glyph + a colour key so each
// pill gets its own pastel circle background (matches design ref). ──────────
const QUICK_FACT_COLORS = ["blue", "red", "pink", "purple", "orange"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDay(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", { day: "numeric" });
}
function formatMon(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", { month: "short" }).toUpperCase();
}
function formatWeekday(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", { weekday: "long" });
}
function isLow(slots) {
  return slots <= 3;
}
function isSunday(dateStr) {
  return new Date(dateStr).getDay() === 0;
}

// chunk array into groups of n
function chunkArray(arr, n) {
  const pages = [];
  for (let i = 0; i < arr.length; i += n) pages.push(arr.slice(i, i + n));
  return pages;
}
function SectionSlider({ sections }) {
  const [page, setPage] = useState(0);
  const autoplayRef = useRef(null);

  const startAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (sections.length <= 1) return;
    autoplayRef.current = setInterval(
      () => setPage((p) => (p + 1) % sections.length),
      4000,
    );
  };

  useEffect(() => {
    startAutoplay();
    return () => clearInterval(autoplayRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.length, page]);

  if (!sections.length) return null;

  const activeIndex = Math.min(page, sections.length - 1);

  const goPrev = () =>
    setPage((p) => (p - 1 + sections.length) % sections.length);
  const goNext = () => setPage((p) => (p + 1) % sections.length);

  return (
    <div className="cdm-section">
      <div className="cdm-section-header">
        <div className="cdm-section-title">{sections[activeIndex].heading}</div>
        {sections.length > 1 && (
          <div className="cdm-slide-nav">
            <button
              type="button"
              className="cdm-slide-arrow cdm-slide-arrow--prev"
              onClick={goPrev}
              aria-label="Previous section"
            >
              ‹
            </button>
            <button
              type="button"
              className="cdm-slide-arrow cdm-slide-arrow--next"
              onClick={goNext}
              aria-label="Next section"
            >
              ›
            </button>
          </div>
        )}
      </div>
      <div className="slide-wrap">
        <div
          className="slide-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {sections.map((s, i) => (
            <div key={i} className="slide-page">
              {s.paragraphs &&
                s.paragraphs.map((p, j) => (
                  <p key={`p-${j}`} className="cdm-desc-text">
                    {p}
                  </p>
                ))}
              {s.points && s.points.length > 0 && (
                <ul className="cdm-checklist">
                  {s.points.map((pt, j) => (
                    <li key={j}>
                      <span className="cdm-check"><FaCheck /></span>
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="cdm-dot-row">
        {sections.map((_, i) => (
          <div
            key={i}
            className={`cdm-dot ${i === activeIndex ? "active" : ""}`}
            onClick={() => setPage(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ViewCourseDetailMobile({
  course,
  courses = [],
  fromPortal: propFromPortal,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fromPortal =
    propFromPortal || searchParams.get("fromPortal") === "true";
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [quickFacts, setQuickFacts] = useState([]);
  const PAGE_SIZE = 7;
  const SHOW_DEFAULT = 3;
  const trustBadges = useMemo(
    () => [
      { icon: <FaBuildingColumns />, text: "SafeWork NSW approved RTO" },
      { icon: <FaCertificate />, text: "Certificate same day" },
      { icon: <FaCalendarDays />, text: "Sunday sessions available" },
    ],
    [],
  );

  // ── Fetch quick facts ────────────────────────────────────────────────────
  useEffect(() => {
    axios
      .get(`${API_URL}/api/section-content/quick-facts/all`)
      .then((res) => setQuickFacts(res.data || []))
      .catch(() => setQuickFacts([]));
  }, []);

  // ── Fetch sessions ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!course?._id) return;
    setLoading(true);
    axios
      .get(`${API_URL}/api/schedules/course/${course._id}`)
      .then((res) => {
        const rows = [];
        res.data.forEach((sched) => {
          sched.sessions
            .filter((s) => s.status === "Active")
            .forEach((s) => {
              rows.push({
                id: s._id,
                scheduleId: sched._id,
                date: sched.date,
                startTime: s.startTime,
                endTime: s.endTime,
                location: (s.location || course.location || "Sefton NSW")
                  .replace(/Safton/gi, "Sefton")
                  .trim(),
                availableSlots: s.availableSlots,
              });
            });
        });
        rows.sort((a, b) => new Date(a.date) - new Date(b.date));
        setSessions(rows);
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [course?._id]);

  if (!course) return null;

  // ── Price display ─────────────────────────────────────────────────────────
  const price = getCoursePriceDisplay(course);
  const orig = getCourseOriginalDisplay(course);
  const saving = getCourseSavingDisplay(course);

  const variants = getCourseVariants(course);
  const isVariantCourse = variants.length > 1;

  // Visually flag the cheapest variant as "Best value" (design ref shows
  // the lower-priced option with a ribbon + tag). Purely presentational —
  // doesn't change which variant is selected or booked.
  const cheapestVariantKey = isVariantCourse
    ? variants.reduce(
        (min, v) => (Number(v.price) < Number(min.price) ? v : min),
        variants[0],
      ).key
    : null;

  const variantHref = (v) =>
    v?.key
      ? `/book-now/course/${course.slug}?type=${v.key}${fromPortal ? "&fromPortal=true" : ""}`
      : `/book-now/course/${course.slug}${fromPortal ? "?fromPortal=true" : ""}`;

  // ── Content arrays — use API data if available, else mock fallback ──────────
  const outcomePoints = (course.outcomePoints || []).filter(Boolean);
  const requirements = (course.requirements || []).filter(Boolean);
  const rawOverview = (course.trainingOverview || []).filter(Boolean).join(" ");
  const rawDescription = (course.description || []).filter(Boolean).join(" ");

  const aboutText = rawOverview || rawDescription || MOCK_ABOUT;
  const outcomeList = outcomePoints.length > 0 ? outcomePoints : MOCK_OUTCOMES;
  const requireList =
    requirements.length > 0 ? requirements : MOCK_REQUIREMENTS;

  const descriptionParagraphs = Array.isArray(course.description)
    ? course.description.filter(Boolean)
    : course.description
      ? [course.description]
      : [];

  const trainingOverviewPoints = (course.trainingOverview || []).filter(
    Boolean,
  );

  const vocationalOutcomeItems = (course.vocationalOutcome || []).filter(
    Boolean,
  );
  const vocFirstIsIntro =
    vocationalOutcomeItems.length > 1 && vocationalOutcomeItems[0].length > 80;
  const vocationalIntro = vocFirstIsIntro ? vocationalOutcomeItems[0] : null;
  const vocationalBullets = vocFirstIsIntro
    ? vocationalOutcomeItems.slice(1)
    : vocationalOutcomeItems;

  const pathwaysList = (course.pathways || []).filter(Boolean);
  const feesChargesList = (course.feesCharges || []).filter(Boolean);
  const optionalChargesList = (course.optionalCharges || []).filter(Boolean);

  const detailSections = [
    descriptionParagraphs.length > 0 && {
      heading: "Course Description",
      paragraphs: descriptionParagraphs,
    },
    requireList.length > 0 && {
      heading: "Entry Requirements",
      points: requireList,
    },
    course.duration && {
      heading: "Duration",
      paragraphs: [
        `The total duration is ${course.duration}. Training and assessment are conducted in our training centre.`,
      ],
    },
    trainingOverviewPoints.length > 0 && {
      heading: "Training Overview",
      points: trainingOverviewPoints,
    },
    vocationalOutcomeItems.length > 0 && {
      heading: "Vocational Outcome",
      paragraphs: vocationalIntro ? [vocationalIntro] : undefined,
      points: vocationalBullets.length > 0 ? vocationalBullets : undefined,
    },
    outcomeList.length > 0 && {
      heading: "What You Will Learn",
      points: outcomeList,
    },
    pathwaysList.length > 0 && {
      heading: "Pathways",
      paragraphs: pathwaysList,
    },
    feesChargesList.length > 0 && {
      heading: "Fees and Charges",
      points: feesChargesList,
    },
    optionalChargesList.length > 0 && {
      heading: "Optional",
      paragraphs: optionalChargesList,
    },
  ].filter(Boolean);

  // ── Bypass Modal Logic for specific courses ──────────────────────────────
  const BYPASS_KEYWORDS = ["excavator", "haul truck", "skid steer"];
  const shouldBypassModal =
    isVariantCourse ||
    BYPASS_KEYWORDS.some((kw) => course.title?.toLowerCase().includes(kw));

  // ── Session display ───────────────────────────────────────────────────────
  const sessionPages = chunkArray(sessions, PAGE_SIZE);

  const handleViewPDF = (pdfUrl) => {
    if (!pdfUrl) return;
    let fixedUrl = pdfUrl;
    if (pdfUrl.includes("res.cloudinary.com")) {
      fixedUrl = pdfUrl.replace(/\/fl_attachment[^/]*\//g, "/");
      if (fixedUrl.includes("/raw/upload/")) {
        fixedUrl = fixedUrl.replace(
          "/raw/upload/",
          "/raw/upload/fl_attachment:false/",
        );
      }
      if (!fixedUrl.startsWith("http"))
        fixedUrl = `https://${fixedUrl.replace(/^\/+/, "")}`;
    } else if (!pdfUrl.startsWith("http")) {
      fixedUrl = `${API_URL}/${pdfUrl}`;
    }
    window.open(fixedUrl, "_blank");
  };

  // Map each DB quick-fact key to its icon + pill color class (icons/colors
  // aren't stored in the DB — only val/label are admin-editable).
  const QUICK_FACT_ICON_MAP = {
    duration: { icon: <FaCalendarDays />, color: "blue" },
    classHours: { icon: <FaClock />, color: "red" },
    location: { icon: <FaLocationDot />, color: "pink" },
    rto: { icon: <FaGraduationCap />, color: "purple" },
    certificate: { icon: <FaCertificate />, color: "orange" },
    recognition: { icon: <FaAward />, color: "blue" },
  };

  // Course-specific overrides for keys that should reflect this particular
  // course rather than the generic DB default.
  const qfOverrides = {
    duration: course.duration || null,
    location: (course.location || "").replace(/Safton/gi, "Sefton").trim() || null,
  };

  const displayFacts = quickFacts.map((f) => {
    const meta = QUICK_FACT_ICON_MAP[f.key] || { icon: <FaCalendarDays />, color: "blue" };
    return {
      ...f,
      val: qfOverrides[f.key] || f.val,
      icon: meta.icon,
      color: meta.color,
    };
  });


  const truncateWords = (text, maxWords = 3) => {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  return words.length > maxWords 
    ? words.slice(0, maxWords).join(" ") + "..." 
    : text;
};

  return (
    <div className="cdm-root">
      {/* ── Top Bar ── */}
      

      <MobileNavbar courses={courses} />

      <div className="cdm-topbar">
        <button className="cdm-back-btn" onClick={() => navigate(-1)}>
          ‹
        </button>
        <span className="cdm-topbar-title">Course Details</span>
      </div>

      {/* ───────────── HERO ───────────── */}
<div className="cdm-hero">

  {/* Hero image */}
  <div className="cdm-hero-img">
    {course.image && (
      <img
        className="cdm-hero-img-el"
        src={cdnImage(course.image, { w: 800 })}
        alt={course.title || ""}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    )}

    <div className="cdm-hero-overlay" />

    {/* Hero content */}
    <div className="cdm-hero-content">

      <div className="cdm-hero-code">
        {course.courseCode
          ? `${course.courseCode} — ${course.category || ""}`
          : course.category || "Earthmoving Courses"}
      </div>

      <div className="cdm-hero-title">
        {course.title}
      </div>

      <div className="cdm-hero-price-num">
        {typeof price === "number" ? `$${price}` : price}
      </div>

    </div>

    {/* Book VOC */}
    <div className="cdm-hero-price">
      <button
        type="button"
        className="cdm-hero-btn"
        onClick={() =>
          navigate(
            `/voc?courseId=${course._id}${
              fromPortal ? "&fromPortal=true" : ""
            }`
          )
        }
      >
        <span className="cdm-hero-btn-icon"><FaFileLines /></span>
        <span>Book Voc</span>
      </button>
    </div>
  </div>


  {/* ───────────── QUICK FACTS ───────────── */}
  <div className="cdm-quick-facts">
       {/* Duration */}
       <div className="cdm-fact">
         <div className="cdm-fact-icon cdm-fact-icon--blue"><FaCalendarDays /></div>
   
         <div className="cdm-fact-val">
           {course.duration || "1 Day"}
         </div>
   
         <div className="cdm-fact-label">
           Duration
         </div>
       </div>
   
   
       {/* Class hours */}
       <div className="cdm-fact">
         <div className="cdm-fact-icon cdm-fact-icon--red"><FaClock /></div>
   
         <div className="cdm-fact-val">
          {course.classhrs || "8:30 - 4:30"}
         </div>
   
         <div className="cdm-fact-label">
           Class hours
         </div>
       </div>
   
   
       {/* Location */}
       <div className="cdm-fact">
         <div className="cdm-fact-icon cdm-fact-icon--pink"><FaLocationDot /></div>
   
         <div className="cdm-fact-val">
           {(course.location || "Sefton")
             .replace(/Safton/gi, "Sefton")
             .trim()}
         </div>
   
         <div className="cdm-fact-label">
           Location
         </div>
       </div>
   
   
       {/* Certified */}
       <div className="cdm-fact">
         <div className="cdm-fact-icon cdm-fact-icon--purple"><FaGraduationCap /></div>
   
         <div className="cdm-fact-val">
           RTO #45234
         </div>
   
         <div className="cdm-fact-label">
           Accredited
         </div>
       </div>
   
   
       {/* Certificate */}
       <div className="cdm-fact">
         <div className="cdm-fact-icon cdm-fact-icon--orange"><FaCertificate /></div>
   
         <div className="cdm-fact-val">
            {course.certification_issue || "Same Day"}
         </div>
   
         <div className="cdm-fact-label">
           Certificate
         </div>
       </div>

        <div className="cdm-fact">
          <div className="cdm-fact-icon cdm-fact-icon--blue"><FaAward /></div>
          <div className="cdm-fact-val"> {course.national || "8:30 - 4:30"}</div>
          <div className="cdm-fact-label">Recognition</div>
        </div>
   
     </div>
   
  

</div>

  {/* ───────────── PRICE / OPTIONS ───────────── */}
<div className="cdm-price-section">

  {isVariantCourse ? (
    <>

      {/* Heading */}
      <div className="cdm-price-label">
        <span className="cdm-price-label-icon"><FaAward /></span>

        <span>
          Choose your option
        </span>
      </div>


      {/* Variant Cards */}
      <div className="cdm-variant-row" id="cdm-variants">

        {variants.map((v) => {

          const isBest = v.key === cheapestVariantKey;

          return (
            <button
              key={v.key}
              type="button"
              className={`cdm-variant-btn ${
                isBest
                  ? "cdm-variant-btn--best"
                  : "cdm-variant-btn--alt"
              }`}
              onClick={() => {

                if (shouldBypassModal) {

                  navigate(
                    `/book-now/course/${course.slug}?type=${v.key}${
                      fromPortal
                        ? "&fromPortal=true"
                        : ""
                    }`
                  );

                } else {

                  setSelectedOptionId(v.key);
                  setShowModal(true);

                }
              }}
            >

              {/* Best value corner */}
              {isBest && (
                <span
                  className="cdm-variant-ribbon"
                  aria-hidden="true"
                >
                  ★
                </span>
              )}


              {/* User icon */}
              <span
                className="cdm-variant-avatar"
                aria-hidden="true"
              >
                <FaUser className="cdm-user-icon" />
              </span>


              {/* Text */}
              <span className="cdm-variant-body">

                <span className="cdm-variant-title">
                  Book {v.label}
                </span>

                <span className="cdm-variant-sub">
                  All inclusive — no hidden fees
                </span>

              </span>


              {/* Price */}
              <span className="cdm-variant-price-col">

                <span className="cdm-variant-price">
                  {v.price
                    ? `$${v.price}`
                    : "—"}
                </span>

                {isBest && (
                  <span className="cdm-variant-best-tag">
                    Best Value
                  </span>
                )}

              </span>

            </button>
          );
        }
        )}

      </div>


      {/* SafeWork */}
      <div className="cdm-price-note--centered">

        <span className="cdm-price-note-icon" aria-hidden="true"><FaShieldHalved /></span>

        <span className="cdm-price-note-text">

          <strong>
            SafeWork NSW card fee included
          </strong>

          <span>
            No hidden fees · Everything covered
          </span>

        </span>

      </div>

    </>

  ) : (

    <>
      <div className="cdm-price-main">

        <div className="cdm-price-big">
          {typeof price === "number"
            ? `$${price}`
            : price}
        </div>

        <div>

          {saving && (
            <span className="cdm-price-save">
              {saving}
            </span>
          )}

          <div className="cdm-price-note">
            All inclusive — no hidden fees
          </div>

          <div className="cdm-price-note">
            SafeWork NSW card fee included
          </div>

        </div>

      </div>


      <button
        type="button"
        className="cdm-book-now-big"
        onClick={() =>
          navigate(
            `/book-now/course/${course.slug}${
              fromPortal
                ? "?fromPortal=true"
                : ""
            }`
          )
        }
      >
        Book Now — Pick your date below
      </button>
    </>

  )}

</div>

      {/* ── Available Dates ── */}
      <div className="cdm-section" id="cdm-dates">
        <div className="cdm-section-title">Available dates</div>
        {loadingSessions ? (
          <div className="cdm-sessions-loading">
            {[1, 2, 3].map((i) => (
              <div key={i} className="cdm-skeleton-slot" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="cdm-no-sessions">no dates available for booking</div>
        ) : (
          <>
            {!showAll && (
              <div className="cdm-dates-list">
                {sessions.slice(0, SHOW_DEFAULT).map((s) => {
                  const low = isLow(s.availableSlots);
                  const sunday = isSunday(s.date);
                  const handleBook = (e) => {
                    e.stopPropagation();
                    if (isVariantCourse) {
                      setSelectedSession(s);
                      setShowModal(true);
                    } else {
                      const typePart = shouldBypassModal
                        ? "&type=with-experience"
                        : "";
                      navigate(
                        `/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${typePart}${fromPortal ? "&fromPortal=true" : ""}`,
                      );
                    }
                  };
                  return (
                    <div
                      key={s.id}
                      className="cdm-date-slot"
                      onClick={handleBook}
                    >
                      <div className={`cdm-date-cal ${sunday ? "sunday" : ""}`}>
                        <div className="cdm-date-cal-day">
                          {formatDay(s.date)}
                        </div>
                        <div className="cdm-date-cal-mon">
                          {formatMon(s.date)}
                        </div>
                      </div>
                      <div className="cdm-date-info">
                        <div className="cdm-date-name">
                          {formatWeekday(s.date)} — Full day
                        </div>
                        <div className="cdm-date-time">
                          {s.startTime && s.endTime
                            ? `${s.startTime} – ${s.endTime} · ${(s.location || "").replace(/Safton/gi, "Sefton").trim()}`
                            : (s.location || "")
                                .replace(/Safton/gi, "Sefton")
                                .trim()}
                        </div>
                      </div>
                      <div className={`cdm-date-spots ${low ? "low" : "ok"}`}>
                        {low ? "Filling Fast" : "Seats Available"}
                      </div>
                      <button
                        className="cdm-book-slot-btn"
                        onClick={handleBook}
                      >
                        Book
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {showAll && (
              <div className="cdm-session-swipe">
                {sessionPages.map((page, pageIdx) => (
                  <div key={pageIdx} className="cdm-session-page-card">
                    {page.map((s) => {
                      const low = isLow(s.availableSlots);
                      const sunday = isSunday(s.date);
                      return (
                        <div
                          key={s.id}
                          className="cdm-date-slot"
                          onClick={() => {
                            if (isVariantCourse) {
                              setSelectedSession(s);
                              setShowModal(true);
                            } else {
                              const typePart = shouldBypassModal
                                ? "&type=with-experience"
                                : "";
                              navigate(
                                `/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${typePart}${fromPortal ? "&fromPortal=true" : ""}`,
                              );
                            }
                          }}
                        >
                          <div
                            className={`cdm-date-cal ${sunday ? "sunday" : ""}`}
                          >
                            <div className="cdm-date-cal-day">
                              {formatDay(s.date)}
                            </div>
                            <div className="cdm-date-cal-mon">
                              {formatMon(s.date)}
                            </div>
                          </div>
                          <div className="cdm-date-info">
                            <div className="cdm-date-name">
                              {formatWeekday(s.date)} — Full day
                            </div>
                            <div className="cdm-date-time">
                              {s.startTime && s.endTime
                                ? `${s.startTime} – ${s.endTime} · ${(s.location || "").replace(/Safton/gi, "Sefton").trim()}`
                                : (s.location || "")
                                    .replace(/Safton/gi, "Sefton")
                                    .trim()}
                            </div>
                          </div>
                          <div
                            className={`cdm-date-spots ${low ? "low" : "ok"}`}
                          >
                            {low ? "Filling Fast" : "Seats Available"}
                          </div>
                          <button
                            className="cdm-book-slot-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isVariantCourse) {
                                setSelectedSession(s);
                                setShowModal(true);
                              } else {
                                const typePart = shouldBypassModal
                                  ? "&type=with-experience"
                                  : "";
                                navigate(
                                  `/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${typePart}${fromPortal ? "&fromPortal=true" : ""}`,
                                );
                              }
                            }}
                          >
                            Book
                          </button>
                        </div>
                      );
                    })}
                    <div className="cdm-page-indicator">
                      {pageIdx + 1} / {sessionPages.length}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sessions.length > SHOW_DEFAULT && (
              <button
                className="cdm-see-more-btn"
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll ? " See less" : ` See all sessions`}
              </button>
            )}
          </>
        )}
      </div>

      <div className="cdm-section">
        <SectionSlider sections={detailSections} />
      </div>

      {/* ── Why Choose SafeTicks ── */}
      <div className="cdm-section">
        <div className="cdm-section-title">Why choose SafeTicks</div>
        <div className="cdm-trust-row">
          {trustBadges.map((b, i) => (
            <div key={i} className="cdm-trust-badge">
              <span className="cdm-trust-icon">{b.icon}</span>
              <span className="cdm-trust-text">{b.text}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Handbook Cards */}
      {(() => {
        if (course.handbook?.cardImage) return null;

        let hUrl = course.handbook?.url || course.handbook?.pdf;
        if (!hUrl) return null;

        let finalUrl = hUrl;
        if (hUrl.startsWith("res.cloudinary.com")) {
          finalUrl = `https://${hUrl}`;
        } else if (!hUrl.startsWith("http") && !hUrl.startsWith("/")) {
          finalUrl = `${API_URL}/${hUrl}`;
        }

        return (
          <div
            onClick={() =>
              handleViewPDF(course.handbook?.url || course.handbook?.pdf)
            }
            style={{ cursor: "pointer" }}
            className="cdm-hb-card"
          >
            <div className="cdm-hb-inner">
              <img src={logo} alt="SafeTicks Logo" className="cdm-hb-logo" />
              <h3 className="cdm-hb-title">
                {course.handbook?.title || "CODE OF PRACTICE"}
              </h3>
              <div className="cdm-hb-subtitle">
                Click to download the{" "}
                {course.handbook?.title || "CODE OF PRACTICE"} [PDF]
              </div>
            </div>
          </div>
        );
      })()}

      <div
        onClick={() => handleViewPDF("/resources/participant-handbook.pdf")}
        style={{ cursor: "pointer" }}
        className="cdm-hb-card"
      >
        <div className="cdm-hb-inner">
          <img src={logo} alt="SafeTicks Logo" className="cdm-hb-logo" />
          <h3 className="cdm-hb-title">Participant Handbook</h3>
          <div className="cdm-hb-subtitle">
            Click to download the Participant Handbook [PDF]
          </div>
        </div>
      </div>

      {/* ── Course of Practice (Infinite Marquee) ── */}
      {(() => {
        const relatedCourses = courses.filter((c) => c._id !== course._id);

        if (relatedCourses.length === 0) return null;

        return (
          <div className="cdm-section" style={{ padding: "0 16px" }}>
            <div className="cdm-section-title" style={{ marginBottom: "10px" }}>
              Course of Practice
            </div>
            <div
              className="cdp-marquee-wrapper"
              style={{ margin: "0 -16px", padding: "10px 16px" }}
            >
              <div className="cdp-marquee-track">
                {[...relatedCourses, ...relatedCourses, ...relatedCourses].map(
                  (c, i) => (
                    <div
                      className="cdp-marquee-item"
                      key={i}
                      onClick={() =>
                        (window.location.href = `/course/${c.slug}`)
                      }
                    >
                      <span className="cdp-marquee-icon"><FaFileLines /></span>
                      <div>
                        <div className="cdp-marquee-name">{c.title}</div>
                        <div className="cdp-marquee-price">
                          From $
                          {c.sellingPrice ||
                            c.withoutExperiencePrice ||
                            c.withExperiencePrice ||
                            c.slSinglePrice ||
                            c.slblPrice ||
                            0}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Sticky Bottom Bar ── */}
      <div className="cdm-sticky">
        <button
          className="cdm-sticky-book"
          onClick={() => {
            if (isVariantCourse) {
              setShowModal(true);
            } else {
              const typePart = shouldBypassModal ? "?type=with-experience" : "";
              const fromPart = fromPortal
                ? typePart
                  ? "&fromPortal=true"
                  : "?fromPortal=true"
                : "";
              navigate(`/book-now/course/${course.slug}${typePart}${fromPart}`);
            }
          }}
        >
          Book Now
          <span className="cdm-sticky-book-arrow" aria-hidden="true"><FaArrowRight /></span>
        </button>
        <a
          href={ORG_PHONE_1300.wa}
          className="cdm-sticky-wa"
          aria-label="Chat on WhatsApp"
        >
          <FaWhatsapp />
        </a>
      </div>

      {showModal && (
        <BookingModal
          course={course}
          onClose={() => {
            setShowModal(false);
            setSelectedOptionId(null);
            setSelectedSession(null);
          }}
          initialSelection={selectedOptionId}
          extraQueryParams={
            (selectedSession
              ? `&scheduleId=${selectedSession.scheduleId}&sessionId=${selectedSession.id}`
              : "") + (fromPortal ? "&fromPortal=true" : "")
          }
        />
      )}
    </div>
  );
}
