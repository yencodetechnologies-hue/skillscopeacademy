// import React, { useEffect, useState, useRef, useMemo } from "react";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import axios from "axios";
// import PublicNavbar from "../../PublicNavbar";
// import "../styles/ViewCourseDetailMobile.css";
// import { API_URL } from "../../../data/service";
// import { cdnImage } from "../../../utils/cdnImage";
// import {
//   getCoursePriceDisplay,
//   getCourseOriginalDisplay,
//   getCourseSavingDisplay,
//   getCourseVariants,
// } from "../../../utils/coursePrice";
// import BookingModal from "../../course/BookingModal";
// import { ORG_PHONE_1300 } from "../../../utils/organizationPhones";
// import logo from "../../../assets/staLogo.png";
// import PdfViewer from "../../common/PdfViewer";
// import { useGoogleReviews, shortAuthorName, getReviewDisplayText, GOOGLE_REVIEWS_MAX } from "../../../hooks/useGoogleReviews";
// import { FALLBACK_MOBILE_REVIEWS } from "../../../data/reviewsFallback";

// // ── Mock data fallbacks (used when API fields are empty) ─────────────────────
// const MOCK_ABOUT =
//   "This nationally recognised course meets the requirements for working safely on construction sites across all Australian states and territories. Delivered face to face by experienced trainers with same-week enrolment available, including Sundays.";

// const MOCK_OUTCOMES = [
//   "Understand WHS legislative requirements for construction",
//   "Identify and report common construction site hazards",
//   "Apply basic risk control measures on site",
//   "Correctly select, fit and use PPE equipment",

// ];

// const MOCK_REQUIREMENTS = [
//   "Minimum age 14 years",
//   "100 points of original ID on the day",
//   "Unique Student Identifier (USI) — free to get online",
//   "Basic understanding of spoken and written English",

// ];

// // ── Helpers ───────────────────────────────────────────────────────────────────
// function formatDay(dateStr) {
//   const d = new Date(dateStr);
//   return d.toLocaleDateString("en-AU", { day: "numeric" });
// }
// function formatMon(dateStr) {
//   const d = new Date(dateStr);
//   return d.toLocaleDateString("en-AU", { month: "short" }).toUpperCase();
// }
// function formatWeekday(dateStr) {
//   const d = new Date(dateStr);
//   return d.toLocaleDateString("en-AU", { weekday: "long" });
// }
// function isLow(slots) { return slots <= 3; }
// function isSunday(dateStr) {
//   return new Date(dateStr).getDay() === 0;
// }

// // chunk array into groups of n
// function chunkArray(arr, n) {
//   const pages = [];
//   for (let i = 0; i < arr.length; i += n) pages.push(arr.slice(i, i + n));
//   return pages;
// }
// function SectionSlider({ sections }) {
//   const [page, setPage] = useState(0);
//   const autoplayRef = useRef(null);

//   const startAutoplay = () => {
//     if (autoplayRef.current) clearInterval(autoplayRef.current);
//     if (sections.length <= 1) return;
//     autoplayRef.current = setInterval(
//       () => setPage(p => (p + 1) % sections.length),
//       4000
//     );
//   };

//   // Autoplay starts on mount, and restarts (resets its 4s timer) every
//   // time `page` changes — whether the change came from autoplay itself
//   // or from a manual prev/next/dot click — so a manual tap never gets
//   // immediately overridden by a stale tick.
//   useEffect(() => {
//     startAutoplay();
//     return () => clearInterval(autoplayRef.current);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [sections.length, page]);

//   if (!sections.length) return null;

//   const activeIndex = Math.min(page, sections.length - 1);

//   const goPrev = () => setPage(p => (p - 1 + sections.length) % sections.length);
//   const goNext = () => setPage(p => (p + 1) % sections.length);

//   return (
//     <div className="cdm-section">
//       <div className="cdm-section-header">
//         <div className="cdm-section-title">{sections[activeIndex].heading}</div>
//         {sections.length > 1 && (
//           <div className="cdm-slide-nav">
//             <button
//               type="button"
//               className="cdm-slide-arrow cdm-slide-arrow--prev"
//               onClick={goPrev}
//               aria-label="Previous section"
//             >
//               ‹
//             </button>
//             <button
//               type="button"
//               className="cdm-slide-arrow cdm-slide-arrow--next"
//               onClick={goNext}
//               aria-label="Next section"
//             >
//               ›
//             </button>
//           </div>
//         )}
//       </div>
//       <div className="slide-wrap">
//         <div
//           className="slide-track"
//           style={{ transform: `translateX(-${activeIndex * 100}%)` }}
//         >
//           {sections.map((s, i) => (
//             <div key={i} className="slide-page">
//               {s.paragraphs && s.paragraphs.map((p, j) => (
//                 <p key={`p-${j}`} className="cdm-desc-text">{p}</p>
//               ))}
//               {s.points && s.points.length > 0 && (
//                 <ul className="cdm-checklist">
//                   {s.points.map((pt, j) => (
//                     <li key={j}>
//                       <span className="cdm-check">✓</span>{pt}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="cdm-dot-row">
//         {sections.map((_, i) => (
//           <div
//             key={i}
//             className={`cdm-dot ${i === activeIndex ? "active" : ""}`}
//             onClick={() => setPage(i)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────

// export default function ViewCourseDetailMobile({ course, courses = [], fromPortal: propFromPortal }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const searchParams = new URLSearchParams(location.search);
//   const fromPortal = propFromPortal || searchParams.get("fromPortal") === "true";
//   const [sessions, setSessions]       = useState([]);
//   const [loadingSessions, setLoading] = useState(true);
//   const [showAll, setShowAll]         = useState(false);
//   const [showModal, setShowModal]     = useState(false);
//   const [selectedOptionId, setSelectedOptionId] = useState(null);
//   const [selectedSession, setSelectedSession]   = useState(null);
//   const PAGE_SIZE                     = 7;
//   const SHOW_DEFAULT                  = 3;
//   const reviewRef = useRef(null);
//   const { reviews: apiReviews, reviewCountFormatted } = useGoogleReviews();

//   const trustBadges = useMemo(
//     () => [
//       { icon: "⭐", text: `${reviewCountFormatted} five-star Google reviews` },
//       { icon: "🏛", text: "SafeWork NSW approved RTO" },
//       { icon: "📜", text: "Certificate same day" },
//       { icon: "📅", text: "Sunday sessions available" },
//     ],
//     [reviewCountFormatted]
//   );

//   const courseReviews = useMemo(() => {
//     if (!apiReviews.length) return FALLBACK_MOBILE_REVIEWS;
//     return apiReviews.slice(0, GOOGLE_REVIEWS_MAX).map((r) => ({
//       name: shortAuthorName(r.name),
//       text: getReviewDisplayText(r),
//     }));
//   }, [apiReviews]);

//   // ── Fetch sessions ────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!course?._id) return;
//     setLoading(true);
//     axios
//       .get(`${API_URL}/api/schedules/course/${course._id}`)
//       .then((res) => {
//         const rows = [];
//         res.data.forEach((sched) => {
//           sched.sessions
//             .filter((s) => s.status === "Active")
//             .forEach((s) => {
//               rows.push({
//                 id:             s._id,
//                 scheduleId:     sched._id, 
//                 date:           sched.date,
//                 startTime:      s.startTime,
//                 endTime:        s.endTime,
//                 location:       (s.location || course.location || "Sefton NSW").replace(/Safton/gi, "Sefton").trim(),
//                 availableSlots: s.availableSlots,
//               });
//             });
//         });
//         rows.sort((a, b) => new Date(a.date) - new Date(b.date));
//         setSessions(rows);
//       })
//       .catch(() => setSessions([]))
//       .finally(() => setLoading(false));
//   }, [course?._id]);

//   if (!course) return null;

//   // ── Price display ─────────────────────────────────────────────────────────
//   // Pricing varies by `pricingType`: "standard" stores it in sellingPrice,
//   // "experience" in withoutExperiencePrice/withExperiencePrice, "slbl" in
//   // slSinglePrice/slblPrice. The shared helper picks the right field so
//   // experience- and SL/BL-based courses don't fall back to "Enquire".
//   const price  = getCoursePriceDisplay(course);
//   const orig   = getCourseOriginalDisplay(course);
//   const saving = getCourseSavingDisplay(course);

//   // Variant-aware bookings. For experience- and SL/BL-priced courses
//   // this returns two entries so the price section can render a side-by-
//   // side button row (matches desktop ViewDetailsRight). Standard courses
//   // return a single entry — we detect that with `.length === 1` and fall
//   // back to the existing single-button UI.
//   const variants = getCourseVariants(course);
//   const isVariantCourse = variants.length > 1;

//   // Helper: build the deep link for one variant. Mirrors the convention
//   // used everywhere else (`?type=with-experience` etc.).
//   const variantHref = (v) =>
//     v?.key
//       ? `/book-now/course/${course.slug}?type=${v.key}${fromPortal ? "&fromPortal=true" : ""}`
//       : `/book-now/course/${course.slug}${fromPortal ? "?fromPortal=true" : ""}`;

//   // ── Content arrays — use API data if available, else mock fallback ──────────
//   const outcomePoints    = (course.outcomePoints    || []).filter(Boolean);
//   const requirements     = (course.requirements     || []).filter(Boolean);
//   const rawOverview      = (course.trainingOverview || []).filter(Boolean).join(" ");
//   const rawDescription   = (course.description      || []).filter(Boolean).join(" ");

//   const aboutText     = rawOverview || rawDescription || MOCK_ABOUT;
//   const outcomeList   = outcomePoints.length  > 0 ? outcomePoints  : MOCK_OUTCOMES;
//   const requireList   = requirements.length   > 0 ? requirements   : MOCK_REQUIREMENTS;

//   // ── Course detail sections — mirrors the desktop "Course Detail Sections"
//   // block in CourseDetails.jsx (Course Description, Entry Requirements,
//   // Duration, Training Overview, Vocational Outcome, What You Will Learn,
//   // Pathways, Fees and Charges, Optional). Built as one ordered list, with
//   // each section only included when the course actually has data for it,
//   // so the mobile slider can cycle through every populated section.
//   const descriptionParagraphs = Array.isArray(course.description)
//     ? course.description.filter(Boolean)
//     : course.description
//       ? [course.description]
//       : [];

//   const trainingOverviewPoints = (course.trainingOverview || []).filter(Boolean);

//   const vocationalOutcomeItems = (course.vocationalOutcome || []).filter(Boolean);
//   const vocFirstIsIntro = vocationalOutcomeItems.length > 1 && vocationalOutcomeItems[0].length > 80;
//   const vocationalIntro   = vocFirstIsIntro ? vocationalOutcomeItems[0] : null;
//   const vocationalBullets = vocFirstIsIntro ? vocationalOutcomeItems.slice(1) : vocationalOutcomeItems;

//   const pathwaysList        = (course.pathways || []).filter(Boolean);
//   const feesChargesList     = (course.feesCharges || []).filter(Boolean);
//   const optionalChargesList = (course.optionalCharges || []).filter(Boolean);

//   const detailSections = [
//     descriptionParagraphs.length > 0 && {
//       heading: "Course Description",
//       paragraphs: descriptionParagraphs,
//     },
//     requireList.length > 0 && {
//       heading: "Entry Requirements",
//       points: requireList,
//     },
//     course.duration && {
//       heading: "Duration",
//       paragraphs: [`The total duration is ${course.duration}. Training and assessment are conducted in our training centre.`],
//     },
//     trainingOverviewPoints.length > 0 && {
//       heading: "Training Overview",
//       points: trainingOverviewPoints,
//     },
//     vocationalOutcomeItems.length > 0 && {
//       heading: "Vocational Outcome",
//       paragraphs: vocationalIntro ? [vocationalIntro] : undefined,
//       points: vocationalBullets.length > 0 ? vocationalBullets : undefined,
//     },
//     outcomeList.length > 0 && {
//       heading: "What You Will Learn",
//       points: outcomeList,
//     },
//     pathwaysList.length > 0 && {
//       heading: "Pathways",
//       paragraphs: pathwaysList,
//     },
//     feesChargesList.length > 0 && {
//       heading: "Fees and Charges",
//       points: feesChargesList,
//     },
//     optionalChargesList.length > 0 && {
//       heading: "Optional",
//       paragraphs: optionalChargesList,
//     },
//   ].filter(Boolean);

//   // ── Bypass Modal Logic for specific courses ──────────────────────────────
//   const BYPASS_KEYWORDS = ["excavator", "haul truck", "skid steer"];
//   const shouldBypassModal = isVariantCourse || BYPASS_KEYWORDS.some(kw => 
//     course.title?.toLowerCase().includes(kw)
//   );

//   // ── Session display ───────────────────────────────────────────────────────
//   const sessionPages = chunkArray(sessions, PAGE_SIZE);

//   const handleViewPDF = (pdfUrl) => {
//     if (!pdfUrl) return;
//     let fixedUrl = pdfUrl;
//     if (pdfUrl.includes("res.cloudinary.com")) {
//       fixedUrl = pdfUrl.replace(/\/fl_attachment[^/]*\//g, "/");
//       if (fixedUrl.includes("/raw/upload/")) {
//         fixedUrl = fixedUrl.replace("/raw/upload/", "/raw/upload/fl_attachment:false/");
//       }
//       if (!fixedUrl.startsWith("http")) fixedUrl = `https://${fixedUrl.replace(/^\/+/, "")}`;
//     } else if (!pdfUrl.startsWith("http")) {
//       fixedUrl = `${API_URL}/${pdfUrl}`;
//     }
//     window.open(fixedUrl, "_blank");
//   };



//   return (
//     <div className="cdm-root">

//       {/* ── Top Bar ── */}
//       <div className="cdm-topbar">
//         <button className="cdm-back-btn" onClick={() => navigate(-1)}>‹</button>
//         <span className="cdm-topbar-title">Course details</span>
//       </div>

//       <PublicNavbar courses={courses} />

//       {/* ── Hero Image — real <img> so the browser can preload + apply
//            fetchpriority="high" (CSS background-images can't). */}
//       <div className="cdm-hero-img">
//         {course.image && (
//           <img
//             className="cdm-hero-img-el"
//             src={cdnImage(course.image, { w: 800 })}
//             alt={course.title || ""}
//             loading="eager"
//             fetchpriority="high"
//             decoding="async"
//           />
//         )}
//         <div className="cdm-hero-overlay" />
//         <div className="cdm-hero-content">
//           <div className="cdm-hero-code">
//             {course.courseCode ? `${course.courseCode} — ` : ""}{course.category}
//           </div>
//           <div className="cdm-hero-title">{course.title}</div>
//           <div className="cdm-hero-price-num">{price}</div>
//         </div>
//         <div className="cdm-hero-price ">
          
//           <button className="cdm-hero-btn" onClick={() => navigate(`/voc?courseId=${course._id}${fromPortal ? "&fromPortal=true" : ""}`)}>Book Voc</button>
//         </div>
//       </div>

//       {/* ── Quick Facts ── */}
//       <div className="cdm-quick-facts">
//         <div className="cdm-fact">
//           <div className="cdm-fact-icon">📅</div>
//           <div className="cdm-fact-val">{course.duration || "1 Day"}</div>
//           <div className="cdm-fact-label">Duration</div>
//         </div>
//         <div className="cdm-fact">
//           <div className="cdm-fact-icon">⏰</div>
//           <div className="cdm-fact-val">8:30am – 4:30pm</div>
//           <div className="cdm-fact-label">Class hours</div>
//         </div>
//         <div className="cdm-fact">
//           <div className="cdm-fact-icon">📍</div>
//           <div className="cdm-fact-val">{(course.location || "Sefton").replace(/Safton/gi, "Sefton").trim()}</div>
//           <div className="cdm-fact-label">Location</div>
//         </div>
//         <div className="cdm-fact">
//           <div className="cdm-fact-icon">🎓</div>
//           <div className="cdm-fact-val"></div>
//           <div className="cdm-fact-label">Accredited</div>
//         </div>
//         <div className="cdm-fact">
//           <div className="cdm-fact-icon">📜</div>
//           <div className="cdm-fact-val">Same Day</div>
//           <div className="cdm-fact-label">Certificate</div>
//         </div>
//         <div className="cdm-fact">
//           <div className="cdm-fact-icon">🗺</div>
//           <div className="cdm-fact-val">All States</div>
//           <div className="cdm-fact-label">Recognition</div>
//         </div>
//       </div>

//       {/* ── About — para only, no section title ── */}
//       {/* <div className="cdm-section">
//         <p className="cdm-desc-text">{aboutText}</p>
//       </div> */}

//       {/* ── What You Will Learn ── */}
  

//       {/* ── Price Section ── */}
//       <div className="cdm-price-section">
//         {/* Standard courses keep the existing big price + single button.
//             Variant courses (experience / SL+BL) hide the single price
//             line and use the two-button row below where each button shows
//             its own variant price. */}
//         {!isVariantCourse && (
//           <div className="cdm-price-main">
//             <div className="cdm-price-big">{price}</div>
//             <div>
//               {saving && <span className="cdm-price-save">{saving}</span>}
//               <div className="cdm-price-note">All inclusive — no hidden fees</div>
//               <div className="cdm-price-note">SafeWork NSW card fee included</div>
//             </div>
//           </div>
//         )}

//         {isVariantCourse ? (
//           <>
//             <div className="cdm-price-label">Choose your option</div>
//             <div className="cdm-variant-row" id="cdm-variants">
//               {variants.map((v) => (
//                 <button
//                   key={v.key}
//                   className="cdm-variant-btn"
//                   onClick={() => {
//                     if (shouldBypassModal) {
//                       navigate(`/book-now/course/${course.slug}?type=${v.key}${fromPortal ? "&fromPortal=true" : ""}`);
//                     } else {
//                       setSelectedOptionId(v.key);
//                       setShowModal(true);
//                     }
//                   }}
//                 >
//                   {/* Single-line label: "$400 Book With Experience".
//                       Price first (bold, eye-catching), then the action
//                       label. Keeps the button compact and scannable. */}
//                   <span className="cdm-variant-price">
//                     {v.price ? `$${v.price}` : "—"}
//                   </span>
//                   <span className="cdm-variant-label">Book {v.label}</span>
//                 </button>
//               ))}
//             </div>
//             <div className="cdm-price-note cdm-price-note--centered">
//               All inclusive — no hidden fees · SafeWork NSW card fee included
//             </div>
//           </>
//         ) : (
//           <button
//             className="cdm-book-now-big"
//             onClick={() => navigate(`/book-now/course/${course.slug}${fromPortal ? "?fromPortal=true" : ""}`)}
//           >
//             Book Now — Pick your date below
//           </button>
//         )}
//       </div>

//       {/* ── Available Dates — default 3, see more → 7-per-page swipe ── */}
//       <div className="cdm-section" id="cdm-dates">
//         <div className="cdm-section-title">Available dates</div>
//         {loadingSessions ? (
//           <div className="cdm-sessions-loading">
//             {[1,2,3].map(i => <div key={i} className="cdm-skeleton-slot" />)}
//           </div>
//         ) : sessions.length === 0 ? (
//           <div className="cdm-no-sessions">
//             no dates available for booking
//           </div>
//         ) : (
//           <>
//             {/* Collapsed: first 3 as list */}
//             {!showAll && (
//               <div className="cdm-dates-list" >
//                 {sessions.slice(0, SHOW_DEFAULT).map((s) => {
//                   const low    = isLow(s.availableSlots);
//                   const sunday = isSunday(s.date);
//                   const handleBook = (e) => {
//                     e.stopPropagation();
//                     if (isVariantCourse) {
//                         setSelectedSession(s);
//                         setShowModal(true);
//                     } else {
//                       const typePart = shouldBypassModal ? "&type=with-experience" : "";
//                       navigate(`/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${typePart}${fromPortal ? "&fromPortal=true" : ""}`);
//                     }
//                   };
//                   return (
//                     <div key={s.id} className="cdm-date-slot" onClick={handleBook}>
//                       <div className={`cdm-date-cal ${sunday ? "sunday" : ""}`}>
//                         <div className="cdm-date-cal-day">{formatDay(s.date)}</div>
//                         <div className="cdm-date-cal-mon">{formatMon(s.date)}</div>
//                       </div>
//                       <div className="cdm-date-info">
//                         <div className="cdm-date-name">{formatWeekday(s.date)} — Full day</div>
//                         <div className="cdm-date-time">
//                           {s.startTime && s.endTime
//                             ? `${s.startTime} – ${s.endTime} · ${(s.location || "").replace(/Safton/gi, "Sefton").trim()}`
//                             : (s.location || "").replace(/Safton/gi, "Sefton").trim()}
//                         </div>
//                       </div>
//                       <div className={`cdm-date-spots ${low ? "low" : "ok"}`}>
//                         {low ? "Filling Fast" : "Seats Available"}
//                       </div>
//                       <button
//                         className="cdm-book-slot-btn"
//                         onClick={handleBook}
//                       >
//                         Book
//                       </button>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}

//             {/* Expanded: 7-per-page swipe */}
//             {showAll && (
//               <div className="cdm-session-swipe">
//                 {sessionPages.map((page, pageIdx) => (
//                   <div key={pageIdx} className="cdm-session-page-card">
//                     {page.map((s) => {
//                       const low    = isLow(s.availableSlots);
//                       const sunday = isSunday(s.date);
//                       return (
//                         <div key={s.id} className="cdm-date-slot"  onClick={() => {
//                           if (isVariantCourse) {
//                               setSelectedSession(s);
//                               setShowModal(true);
//                           } else {
//                             const typePart = shouldBypassModal ? "&type=with-experience" : "";
//                             navigate(`/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${typePart}${fromPortal ? "&fromPortal=true" : ""}`);
//                           }
//                         }} >
//                           <div className={`cdm-date-cal ${sunday ? "sunday" : ""}`}>
//                             <div className="cdm-date-cal-day">{formatDay(s.date)}</div>
//                             <div className="cdm-date-cal-mon">{formatMon(s.date)}</div>
//                           </div>
//                           <div className="cdm-date-info">
//                             <div className="cdm-date-name">{formatWeekday(s.date)} — Full day</div>
//                             <div className="cdm-date-time">
//                               {s.startTime && s.endTime
//                                 ? `${s.startTime} – ${s.endTime} · ${(s.location || "").replace(/Safton/gi, "Sefton").trim()}`
//                                 : (s.location || "").replace(/Safton/gi, "Sefton").trim()}
//                             </div>
//                           </div>
//                           <div className={`cdm-date-spots ${low ? "low" : "ok"}`}>
//                             {low ? "Filling Fast" : "Seats Available"}
//                           </div>
//                           <button
//                             className="cdm-book-slot-btn"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                                 if (isVariantCourse) {
//                                     setSelectedSession(s);
//                                     setShowModal(true);
//                                 } else {
//                                   const typePart = shouldBypassModal ? "&type=with-experience" : "";
//                                   navigate(`/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${typePart}${fromPortal ? "&fromPortal=true" : ""}`);
//                                 }
//                             }}
//                           >
//                             Book
//                           </button>
//                         </div>
//                       );
//                     })}
//                     <div className="cdm-page-indicator">
//                       {pageIdx + 1} / {sessionPages.length}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* See more / See less */}
//             {sessions.length > SHOW_DEFAULT && (
//               <button
//                 className="cdm-see-more-btn"
//                 onClick={() => setShowAll(v => !v)}
//               >
//                 {showAll
//                   ? " See less"
//                   : ` See all sessions`}
//               </button>
//             )}
//           </>
//         )}
//       </div>
      
//           <div className="cdm-section">

//               <SectionSlider sections={detailSections} />
//           </div>

//       {/* ── Why Choose SafeTicks ── */}
//       <div className="cdm-section">
//         <div className="cdm-section-title">Why choose SafeTicks</div>
//         <div className="cdm-trust-row">
//           {trustBadges.map((b, i) => (
//             <div key={i} className="cdm-trust-badge">
//               <span className="cdm-trust-icon">{b.icon}</span>
//               <span className="cdm-trust-text">{b.text}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//       {/* ── Student Reviews — horizontal swipe ── */}
//       <div className="cdm-section">
//         <div className="cdm-section-title">Student reviews</div>
//         <div className="cdm-review-scroll" ref={reviewRef}>
//           {courseReviews.map((r, i) => (
//             <div key={i} className="cdm-review-card">
//               <div className="cdm-review-header">
//                 <div className="cdm-review-name">{r.name}</div>
//                 <div className="cdm-review-stars">★★★★★</div>
//               </div>
//               <div className="cdm-review-text">"{r.text}"</div>
//             </div>
//           ))}
//         </div>
//       </div>


//       {/* Handbook Cards (Only show striped card if NO large cardImage exists) */}
//       {(() => {
//         if (course.handbook?.cardImage) return null; // Hide if large image exists

//         let hUrl = course.handbook?.url || course.handbook?.pdf;
//         if (!hUrl) return null;

//         let finalUrl = hUrl;
//         if (hUrl.startsWith("res.cloudinary.com")) {
//           finalUrl = `https://${hUrl}`;
//         } else if (!hUrl.startsWith("http") && !hUrl.startsWith("/")) {
//           finalUrl = `${API_URL}/${hUrl}`;
//         }

//         return (
//           <div
//             onClick={() => handleViewPDF(course.handbook?.url || course.handbook?.pdf)}
//             style={{ cursor: 'pointer' }}
//             className="cdm-hb-card"
//           >
//             <div className="cdm-hb-inner">
//               <img src={logo} alt="SafeTicks Logo" className="cdm-hb-logo" />
//               <h3 className="cdm-hb-title">{course.handbook?.title || "CODE OF PRACTICE"}</h3>
//               <div className="cdm-hb-subtitle">Click to download the {course.handbook?.title || "CODE OF PRACTICE"} [PDF]</div>
//             </div>
//           </div>
//         );
//       })()}

//       <div
//         onClick={() => handleViewPDF("/resources/participant-handbook.pdf")}
//         style={{ cursor: 'pointer' }}
//         className="cdm-hb-card"
//       >
//         <div className="cdm-hb-inner">
//           <img src={logo} alt="SafeTicks Logo" className="cdm-hb-logo" />
//           <h3 className="cdm-hb-title">Participant Handbook</h3>
//           <div className="cdm-hb-subtitle">Click to download the Participant Handbook [PDF]</div>
//         </div>
//       </div>

//       {/* ── Course of Practice (Infinite Marquee) ── */}
//       {(() => {
//         const relatedCourses = courses
//           .filter(c => c._id !== course._id);

//         if (relatedCourses.length === 0) return null;

//         return (
//           <div className="cdm-section" style={{ padding: "0 16px" }}>
//             <div className="cdm-section-title" style={{ marginBottom: "10px" }}>Course of Practice</div>
//             <div className="cdp-marquee-wrapper" style={{ margin: "0 -16px", padding: "10px 16px" }}>
//               <div className="cdp-marquee-track">
//                 {[...relatedCourses, ...relatedCourses, ...relatedCourses].map((c, i) => (
//                   <div
//                     className="cdp-marquee-item"
//                     key={i}
//                     onClick={() => window.location.href = `/course/${c.slug}`}
//                   >
//                     <span className="cdp-marquee-icon">📋</span>
//                     <div>
//                       <div className="cdp-marquee-name">{c.title}</div>
//                       <div className="cdp-marquee-price">From ${c.sellingPrice || c.withoutExperiencePrice || c.withExperiencePrice || c.slSinglePrice || c.slblPrice || 0}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         );
//       })()}


//       {/* ── Sticky Bottom Bar ── */}
//       <div className="cdm-sticky">
//         <button
//           className="cdm-sticky-book"
//           onClick={() => {
//             if (isVariantCourse) {
//               setShowModal(true);
//             } else {
//               const typePart = shouldBypassModal ? "?type=with-experience" : "";
//               const fromPart = fromPortal ? (typePart ? "&fromPortal=true" : "?fromPortal=true") : "";
//               navigate(`/book-now/course/${course.slug}${typePart}${fromPart}`);
//             }
//           }}
//         >
//           Book Now
//         </button>
//            <a href={ORG_PHONE_1300.wa} className="vac-sticky-wa"><span><i class="fa-brands fa-whatsapp"></i></span></a>
//       </div>

//       {showModal && (
//         <BookingModal
//           course={course}
//           onClose={() => {
//             setShowModal(false);
//             setSelectedOptionId(null);
//             setSelectedSession(null);
//           }}
//           initialSelection={selectedOptionId}
//           extraQueryParams={
//             (selectedSession
//               ? `&scheduleId=${selectedSession.scheduleId}&sessionId=${selectedSession.id}`
//               : "") + (fromPortal ? "&fromPortal=true" : "")
//           }
//         />
//       )}

//     </div>
//   );
// }

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import PublicNavbar from "../../PublicNavbar";
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
function isLow(slots) { return slots <= 3; }
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
      () => setPage(p => (p + 1) % sections.length),
      4000
    );
  };

  // Autoplay starts on mount, and restarts (resets its 4s timer) every
  // time `page` changes — whether the change came from autoplay itself
  // or from a manual prev/next/dot click — so a manual tap never gets
  // immediately overridden by a stale tick.
  useEffect(() => {
    startAutoplay();
    return () => clearInterval(autoplayRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.length, page]);

  if (!sections.length) return null;

  const activeIndex = Math.min(page, sections.length - 1);

  const goPrev = () => setPage(p => (p - 1 + sections.length) % sections.length);
  const goNext = () => setPage(p => (p + 1) % sections.length);

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
              {s.paragraphs && s.paragraphs.map((p, j) => (
                <p key={`p-${j}`} className="cdm-desc-text">{p}</p>
              ))}
              {s.points && s.points.length > 0 && (
                <ul className="cdm-checklist">
                  {s.points.map((pt, j) => (
                    <li key={j}>
                      <span className="cdm-check">✓</span>{pt}
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

export default function ViewCourseDetailMobile({ course, courses = [], fromPortal: propFromPortal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fromPortal = propFromPortal || searchParams.get("fromPortal") === "true";
  const [sessions, setSessions]       = useState([]);
  const [loadingSessions, setLoading] = useState(true);
  const [showAll, setShowAll]         = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [selectedSession, setSelectedSession]   = useState(null);
  const PAGE_SIZE                     = 7;
  const SHOW_DEFAULT                  = 3;
  const trustBadges = useMemo(
    () => [
      { icon: "🏛", text: "SafeWork NSW approved RTO" },
      { icon: "📜", text: "Certificate same day" },
      { icon: "📅", text: "Sunday sessions available" },
    ],
    []
  );

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
                id:             s._id,
                scheduleId:     sched._id, 
                date:           sched.date,
                startTime:      s.startTime,
                endTime:        s.endTime,
                location:       (s.location || course.location || "Sefton NSW").replace(/Safton/gi, "Sefton").trim(),
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
  // Pricing varies by `pricingType`: "standard" stores it in sellingPrice,
  // "experience" in withoutExperiencePrice/withExperiencePrice, "slbl" in
  // slSinglePrice/slblPrice. The shared helper picks the right field so
  // experience- and SL/BL-based courses don't fall back to "Enquire".
  const price  = getCoursePriceDisplay(course);
  const orig   = getCourseOriginalDisplay(course);
  const saving = getCourseSavingDisplay(course);

  // Variant-aware bookings. For experience- and SL/BL-priced courses
  // this returns two entries so the price section can render a side-by-
  // side button row (matches desktop ViewDetailsRight). Standard courses
  // return a single entry — we detect that with `.length === 1` and fall
  // back to the existing single-button UI.
  const variants = getCourseVariants(course);
  const isVariantCourse = variants.length > 1;

  // Helper: build the deep link for one variant. Mirrors the convention
  // used everywhere else (`?type=with-experience` etc.).
  const variantHref = (v) =>
    v?.key
      ? `/book-now/course/${course.slug}?type=${v.key}${fromPortal ? "&fromPortal=true" : ""}`
      : `/book-now/course/${course.slug}${fromPortal ? "?fromPortal=true" : ""}`;

  // ── Content arrays — use API data if available, else mock fallback ──────────
  const outcomePoints    = (course.outcomePoints    || []).filter(Boolean);
  const requirements     = (course.requirements     || []).filter(Boolean);
  const rawOverview      = (course.trainingOverview || []).filter(Boolean).join(" ");
  const rawDescription   = (course.description      || []).filter(Boolean).join(" ");

  const aboutText     = rawOverview || rawDescription || MOCK_ABOUT;
  const outcomeList   = outcomePoints.length  > 0 ? outcomePoints  : MOCK_OUTCOMES;
  const requireList   = requirements.length   > 0 ? requirements   : MOCK_REQUIREMENTS;

  // ── Course detail sections — mirrors the desktop "Course Detail Sections"
  // block in CourseDetails.jsx (Course Description, Entry Requirements,
  // Duration, Training Overview, Vocational Outcome, What You Will Learn,
  // Pathways, Fees and Charges, Optional). Built as one ordered list, with
  // each section only included when the course actually has data for it,
  // so the mobile slider can cycle through every populated section.
  const descriptionParagraphs = Array.isArray(course.description)
    ? course.description.filter(Boolean)
    : course.description
      ? [course.description]
      : [];

  const trainingOverviewPoints = (course.trainingOverview || []).filter(Boolean);

  const vocationalOutcomeItems = (course.vocationalOutcome || []).filter(Boolean);
  const vocFirstIsIntro = vocationalOutcomeItems.length > 1 && vocationalOutcomeItems[0].length > 80;
  const vocationalIntro   = vocFirstIsIntro ? vocationalOutcomeItems[0] : null;
  const vocationalBullets = vocFirstIsIntro ? vocationalOutcomeItems.slice(1) : vocationalOutcomeItems;

  const pathwaysList        = (course.pathways || []).filter(Boolean);
  const feesChargesList     = (course.feesCharges || []).filter(Boolean);
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
    (course.trainingDuration || course.duration) && {
      heading: "Duration",
      paragraphs: [`The total duration is ${course.trainingDuration || course.duration}. Training and assessment are conducted in our training centre.`],
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
  const shouldBypassModal = isVariantCourse || BYPASS_KEYWORDS.some(kw => 
    course.title?.toLowerCase().includes(kw)
  );

  // ── Session display ───────────────────────────────────────────────────────
  const sessionPages = chunkArray(sessions, PAGE_SIZE);

  const handleViewPDF = (pdfUrl) => {
    if (!pdfUrl) return;
    let fixedUrl = pdfUrl;
    if (pdfUrl.includes("res.cloudinary.com")) {
      fixedUrl = pdfUrl.replace(/\/fl_attachment[^/]*\//g, "/");
      if (fixedUrl.includes("/raw/upload/")) {
        fixedUrl = fixedUrl.replace("/raw/upload/", "/raw/upload/fl_attachment:false/");
      }
      if (!fixedUrl.startsWith("http")) fixedUrl = `https://${fixedUrl.replace(/^\/+/, "")}`;
    } else if (!pdfUrl.startsWith("http")) {
      fixedUrl = `${API_URL}/${pdfUrl}`;
    }
    window.open(fixedUrl, "_blank");
  };



  return (
    <div className="cdm-root">

      {/* ── Top Bar ── */}
      <div className="cdm-topbar">
        <button className="cdm-back-btn" onClick={() => navigate(-1)}>‹</button>
        <span className="cdm-topbar-title">Course details</span>
      </div>

      <PublicNavbar courses={courses} />

      {/* ── Hero Image — real <img> so the browser can preload + apply
           fetchpriority="high" (CSS background-images can't). */}
      <div className="cdm-hero-img">
        {course.image && (
          <img
            className="cdm-hero-img-el"
            src={cdnImage(course.image, { w: 800 })}
            alt={course.title || ""}
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
        )}
        <div className="cdm-hero-overlay" />
        <div className="cdm-hero-content">
          <div className="cdm-hero-code">
            {course.courseCode ? `${course.courseCode} — ` : ""}{course.category}
          </div>
          <div className="cdm-hero-title">{course.title}</div>
          <div className="cdm-hero-price-num">{price}</div>
        </div>
        <div className="cdm-hero-price ">
          
          <button className="cdm-hero-btn" onClick={() => navigate(`/voc?courseId=${course._id}${fromPortal ? "&fromPortal=true" : ""}`)}>Book Voc</button>
        </div>
      </div>

      {/* ── Quick Facts ── */}
      <div className="cdm-quick-facts">
        <div className="cdm-fact">
          <div className="cdm-fact-icon">📅</div>
          <div className="cdm-fact-val">{course.trainingDuration || course.duration || "1 Day"}</div>
          <div className="cdm-fact-label">Duration</div>
        </div>
        <div className="cdm-fact">
          <div className="cdm-fact-icon">⏰</div>
          <div className="cdm-fact-val">8:30am – 4:30pm</div>
          <div className="cdm-fact-label">Class hours</div>
        </div>
        <div className="cdm-fact">
          <div className="cdm-fact-icon">📍</div>
          <div className="cdm-fact-val">{(course.location || "Sefton").replace(/Safton/gi, "Sefton").trim()}</div>
          <div className="cdm-fact-label">Location</div>
        </div>
        <div className="cdm-fact">
          <div className="cdm-fact-icon">🎓</div>
          <div className="cdm-fact-val"></div>
          <div className="cdm-fact-label">Accredited</div>
        </div>
        <div className="cdm-fact">
          <div className="cdm-fact-icon">📜</div>
          <div className="cdm-fact-val">Same Day</div>
          <div className="cdm-fact-label">Certificate</div>
        </div>
        <div className="cdm-fact">
          <div className="cdm-fact-icon">🗺</div>
          <div className="cdm-fact-val">All States</div>
          <div className="cdm-fact-label">Recognition</div>
        </div>
      </div>

      {/* ── About — para only, no section title ── */}
      {/* <div className="cdm-section">
        <p className="cdm-desc-text">{aboutText}</p>
      </div> */}

      {/* ── What You Will Learn ── */}
  

      {/* ── Price Section ── */}
      <div className="cdm-price-section">
        {/* Standard courses keep the existing big price + single button.
            Variant courses (experience / SL+BL) hide the single price
            line and use the two-button row below where each button shows
            its own variant price. */}
        {!isVariantCourse && (
          <div className="cdm-price-main">
            <div className="cdm-price-big">{price}</div>
            <div>
              {saving && <span className="cdm-price-save">{saving}</span>}
              <div className="cdm-price-note">All inclusive — no hidden fees</div>
              <div className="cdm-price-note">SafeWork NSW card fee included</div>
            </div>
          </div>
        )}

        {isVariantCourse ? (
          <>
            <div className="cdm-price-label">Choose your option</div>
            <div className="cdm-variant-row" id="cdm-variants">
              {variants.map((v) => (
                <button
                  key={v.key}
                  className="cdm-variant-btn"
                  onClick={() => {
                    if (shouldBypassModal) {
                      navigate(`/book-now/course/${course.slug}?type=${v.key}${fromPortal ? "&fromPortal=true" : ""}`);
                    } else {
                      setSelectedOptionId(v.key);
                      setShowModal(true);
                    }
                  }}
                >
                  {/* Single-line label: "$400 Book With Experience".
                      Price first (bold, eye-catching), then the action
                      label. Keeps the button compact and scannable. */}
                  <span className="cdm-variant-price">
                    {v.price ? `$${v.price}` : "—"}
                  </span>
                  <span className="cdm-variant-label">Book {v.label}</span>
                </button>
              ))}
            </div>
            <div className="cdm-price-note cdm-price-note--centered">
              All inclusive — no hidden fees · SafeWork NSW card fee included
            </div>
          </>
        ) : (
          <button
            className="cdm-book-now-big"
            onClick={() => navigate(`/book-now/course/${course.slug}${fromPortal ? "?fromPortal=true" : ""}`)}
          >
            Book Now — Pick your date below
          </button>
        )}
      </div>

      {/* ── Available Dates — default 3, see more → 7-per-page swipe ── */}
      <div className="cdm-section" id="cdm-dates">
        <div className="cdm-section-title">Available dates</div>
        {loadingSessions ? (
          <div className="cdm-sessions-loading">
            {[1,2,3].map(i => <div key={i} className="cdm-skeleton-slot" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="cdm-no-sessions">
            no dates available for booking
          </div>
        ) : (
          <>
            {/* Collapsed: first 3 as list */}
            {!showAll && (
              <div className="cdm-dates-list" >
                {sessions.slice(0, SHOW_DEFAULT).map((s) => {
                  const low    = isLow(s.availableSlots);
                  const sunday = isSunday(s.date);
                  const handleBook = (e) => {
                    e.stopPropagation();
                    if (isVariantCourse) {
                        setSelectedSession(s);
                        setShowModal(true);
                    } else {
                      const typePart = shouldBypassModal ? "&type=with-experience" : "";
                      navigate(`/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${typePart}${fromPortal ? "&fromPortal=true" : ""}`);
                    }
                  };
                  return (
                    <div key={s.id} className="cdm-date-slot" onClick={handleBook}>
                      <div className={`cdm-date-cal ${sunday ? "sunday" : ""}`}>
                        <div className="cdm-date-cal-day">{formatDay(s.date)}</div>
                        <div className="cdm-date-cal-mon">{formatMon(s.date)}</div>
                      </div>
                      <div className="cdm-date-info">
                        <div className="cdm-date-name">{formatWeekday(s.date)} — Full day</div>
                        <div className="cdm-date-time">
                          {s.startTime && s.endTime
                            ? `${s.startTime} – ${s.endTime} · ${(s.location || "").replace(/Safton/gi, "Sefton").trim()}`
                            : (s.location || "").replace(/Safton/gi, "Sefton").trim()}
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

            {/* Expanded: 7-per-page swipe */}
            {showAll && (
              <div className="cdm-session-swipe">
                {sessionPages.map((page, pageIdx) => (
                  <div key={pageIdx} className="cdm-session-page-card">
                    {page.map((s) => {
                      const low    = isLow(s.availableSlots);
                      const sunday = isSunday(s.date);
                      return (
                        <div key={s.id} className="cdm-date-slot"  onClick={() => {
                          if (isVariantCourse) {
                              setSelectedSession(s);
                              setShowModal(true);
                          } else {
                            const typePart = shouldBypassModal ? "&type=with-experience" : "";
                            navigate(`/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${typePart}${fromPortal ? "&fromPortal=true" : ""}`);
                          }
                        }} >
                          <div className={`cdm-date-cal ${sunday ? "sunday" : ""}`}>
                            <div className="cdm-date-cal-day">{formatDay(s.date)}</div>
                            <div className="cdm-date-cal-mon">{formatMon(s.date)}</div>
                          </div>
                          <div className="cdm-date-info">
                            <div className="cdm-date-name">{formatWeekday(s.date)} — Full day</div>
                            <div className="cdm-date-time">
                              {s.startTime && s.endTime
                                ? `${s.startTime} – ${s.endTime} · ${(s.location || "").replace(/Safton/gi, "Sefton").trim()}`
                                : (s.location || "").replace(/Safton/gi, "Sefton").trim()}
                            </div>
                          </div>
                          <div className={`cdm-date-spots ${low ? "low" : "ok"}`}>
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
                                  const typePart = shouldBypassModal ? "&type=with-experience" : "";
                                  navigate(`/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${typePart}${fromPortal ? "&fromPortal=true" : ""}`);
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

            {/* See more / See less */}
            {sessions.length > SHOW_DEFAULT && (
              <button
                className="cdm-see-more-btn"
                onClick={() => setShowAll(v => !v)}
              >
                {showAll
                  ? " See less"
                  : ` See all sessions`}
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
      {/* Handbook Cards (Only show striped card if NO large cardImage exists) */}
      {(() => {
        if (course.handbook?.cardImage) return null; // Hide if large image exists

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
            onClick={() => handleViewPDF(course.handbook?.url || course.handbook?.pdf)}
            style={{ cursor: 'pointer' }}
            className="cdm-hb-card"
          >
            <div className="cdm-hb-inner">
              <img src={logo} alt="SafeTicks Logo" className="cdm-hb-logo" />
              <h3 className="cdm-hb-title">{course.handbook?.title || "CODE OF PRACTICE"}</h3>
              <div className="cdm-hb-subtitle">Click to download the {course.handbook?.title || "CODE OF PRACTICE"} [PDF]</div>
            </div>
          </div>
        );
      })()}

      <div
        onClick={() => handleViewPDF("/resources/participant-handbook.pdf")}
        style={{ cursor: 'pointer' }}
        className="cdm-hb-card"
      >
        <div className="cdm-hb-inner">
          <img src={logo} alt="SafeTicks Logo" className="cdm-hb-logo" />
          <h3 className="cdm-hb-title">Participant Handbook</h3>
          <div className="cdm-hb-subtitle">Click to download the Participant Handbook [PDF]</div>
        </div>
      </div>

      {/* ── Course of Practice (Infinite Marquee) ── */}
      {(() => {
        const relatedCourses = courses
          .filter(c => c._id !== course._id);

        if (relatedCourses.length === 0) return null;

        return (
          <div className="cdm-section" style={{ padding: "0 16px" }}>
            <div className="cdm-section-title" style={{ marginBottom: "10px" }}>Course of Practice</div>
            <div className="cdp-marquee-wrapper" style={{ margin: "0 -16px", padding: "10px 16px" }}>
              <div className="cdp-marquee-track">
                {[...relatedCourses, ...relatedCourses, ...relatedCourses].map((c, i) => (
                  <div
                    className="cdp-marquee-item"
                    key={i}
                    onClick={() => window.location.href = `/course/${c.slug}`}
                  >
                    <span className="cdp-marquee-icon">📋</span>
                    <div>
                      <div className="cdp-marquee-name">{c.title}</div>
                      <div className="cdp-marquee-price">From ${c.sellingPrice || c.withoutExperiencePrice || c.withExperiencePrice || c.slSinglePrice || c.slblPrice || 0}</div>
                    </div>
                  </div>
                ))}
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
              const fromPart = fromPortal ? (typePart ? "&fromPortal=true" : "?fromPortal=true") : "";
              navigate(`/book-now/course/${course.slug}${typePart}${fromPart}`);
            }
          }}
        >
          Book Now
        </button>
           <a href={ORG_PHONE_1300.wa} className="vac-sticky-wa"><span><i class="fa-brands fa-whatsapp"></i></span></a>
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