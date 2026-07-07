import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import "../styles/MobileLandingPage.css";
import PublicNavbar from "../../PublicNavbar";
import PromoBar from "../../landingPage/PromoBar";
import Footer from "../../landingPage/Footer";
import BookingModal from "../../course/BookingModal";
import { useNavigate } from "react-router-dom";
import pbPaypal from "../../../assets/pb-paypal.jpg";
import pbBlyncsy from "../../../assets/pb-blyncsy.webp";
import pbGoogleCloud from "../../../assets/pb-ggogleCloud.jpeg";
import { API_URL } from "../../../data/service";
import { cdnImage } from "../../../utils/cdnImage";
import {
  getCoursePriceDisplay,
  getCourseOriginalDisplay,
  getCourseVariants,
} from "../../../utils/coursePrice";
import { ORG_PHONE_1300, ORG_PHONE_MOBILE } from "../../../utils/organizationPhones";
import ClientsSection from "../../landingPage/ClientsSection";
import {
  useGoogleReviews,
  shortAuthorName,
  getReviewDisplayText,
  GOOGLE_REVIEWS_MAX,
} from "../../../hooks/useGoogleReviews";
import { FALLBACK_MOBILE_REVIEWS } from "../../../data/reviewsFallback";

// Order is now managed via Admin Dashboard (dbCategories.order)

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", {
    weekday: "short", day: "numeric", month: "short",
    timeZone: "Australia/Sydney"
  });
}

function isLow(slots) { return slots <= 3; }

// ─────────────────────────────────────────────────────────────────────────────

export default function MobileLandingPage({ courses = [] }) {
  const {
    reviews: apiReviews,
    trustReviewsLine,
    reviewCountFormatted,
    reviewCountLabel,
    placeRating,
  } = useGoogleReviews();

  const mobileReviews = useMemo(() => {
    if (!apiReviews.length) {
      return FALLBACK_MOBILE_REVIEWS.map((r) => ({
        name: r.name,
        quote: r.text,
      }));
    }
    return apiReviews.slice(0, GOOGLE_REVIEWS_MAX).map((r) => ({
      name: `${shortAuthorName(r.name)} · ${r.relativeTime || "Google Review"}`,
      quote: getReviewDisplayText(r),
    }));
  }, [apiReviews]);

  const trustPills = useMemo(
    () => [
      trustReviewsLine,
      "RTO #45234",
      "SafeWork NSW approved",
      "📍 Sefton NSW",
    ],
    [trustReviewsLine]
  );

  const [slide, setSlide] = useState(0);
  const [sessionMap, setSessionMap] = useState({});
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showEnquire, setShowEnquire] = useState(false);
  // Admin-managed categories (with the `image` field). When available we use
  // these for the carousel images instead of deriving from the first course.
  const [dbCategories, setDbCategories] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBookingCourse, setSelectedBookingCourse] = useState(null);
  const [selectedBookingSession, setSelectedBookingSession] = useState(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    axios
      .get(`${API_URL}/api/categories`)
      .then((res) => {
        if (!alive) return;
        setDbCategories(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => { if (alive) setDbCategories([]); });
    return () => { alive = false; };
  }, []);

  // ── Active courses only ───────────────────────────────────────────────────
  const activeCourses = courses
    .filter((c) => c.status === "Active" && c.image)
    .sort((a, b) => {
      if (!dbCategories) return 0;
      const catA = dbCategories.find(db => db.name === a.category);
      const catB = dbCategories.find(db => db.name === b.category);
      return (catA?.order || 0) - (catB?.order || 0);
    });

  // ── Hero slides ───────────────────────────────────────────────────────────
  // Show every active course (with an image) — auto-advance + swipe lets the
  // user move through the full catalogue instead of looping the first 5.
  const heroSlides = activeCourses.map((c) => ({
    id: c._id,
    title: c.title,
    // Use the shared helper so experience- and SL/BL-based courses show
    // their actual "From $..." price instead of falling through to
    // "Enquire" (their price isn't in c.sellingPrice).
    price: getCoursePriceDisplay(c),
    orig: getCourseOriginalDisplay(c) || "",
    courseCode: c.courseCode || "",
    image: c.image,
    slug: c.slug,
    duration: c.duration || "",
    sellingPrice: c.sellingPrice,
    location: c.location || "Sefton",
  }));

  // ── Filter: only courses with sessions after fetch; all slides while loading ──
  const filteredHeroSlides = loadingSessions
    ? heroSlides
    : heroSlides.filter((hs) => sessionMap[hs.id] !== undefined);

  const total = filteredHeroSlides.length || 1;

  // reset showAll when slide changes
  const changeSlide = (dir) => {
    setShowAll(false);
    setSlide((s) => (s + dir + total) % total);
  };
  const goSlide = (i) => { setShowAll(false); setSlide(i); };

  useEffect(() => {
    timerRef.current = setInterval(() => changeSlide(1), 3500);
    return () => clearInterval(timerRef.current);
  }, [total]);

  // ── Fetch sessions for hero courses, store by courseId ───────────────────
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
              .catch(() => ({ id: hs.id, data: [], courseInfo: hs }))
          )
        );

        const map = {};
        results.forEach(({ id, data, courseInfo }) => {
          const rows = [];
          data.forEach((sched) => {
            sched.sessions
              .filter((sess) => sess.status === "Active")
              .forEach((sess) => {
                rows.push({
                  id: sess._id,
                  scheduleId: sched._id,
                  courseId: id,
                  // Carry the course's SEO slug through so the "Book now"
                  // deep link uses the clean URL.
                  courseSlug: courseInfo.slug,
                  date: sched.date,
                  location: sess.location || courseInfo.location || "Sefton",
                  duration: courseInfo.duration,
                  // Pre-format the price using the shared helper so
                  // experience/SL+BL courses don't show a blank price.
                  priceDisplay: getCoursePriceDisplay(courseInfo),
                  availableSlots: sess.availableSlots,
                });
              });
          });
          rows.sort((a, b) => new Date(a.date) - new Date(b.date));
          // only store if has sessions
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
  }, [courses]);

  // ── Sessions for current hero slide ──────────────────────────────────────
  const currentSlide = filteredHeroSlides[slide] ?? filteredHeroSlides[0];
  const currentCourseId = currentSlide?.id;
  const currentCourseName = currentSlide?.title || "";
  const allSessions = sessionMap[currentCourseId] || [];
  const SHOW_LIMIT = 3;
  const visibleSessions = showAll ? allSessions : allSessions.slice(0, SHOW_LIMIT);
  const hasMore = allSessions.length > SHOW_LIMIT;

  // Single source of truth for the Book Now deep link of a session row.
  // BookNow.jsx reads `scheduleId` + `sessionId` (and the slug or `courseId`)
  // and pre-selects the matching course + session + date in the form. We use
  // the slug-based URL when available because it's the SEO-friendly format;
  // the legacy `?courseId=` query is still wired in BookNow as a fallback
  // for older links.
  const sessionBookNowHref = (s) =>
    s.courseSlug
      ? `/book-now/course/${s.courseSlug}?scheduleId=${s.scheduleId}&sessionId=${s.id}`
      : `/book-now?courseId=${s.courseId}&scheduleId=${s.scheduleId}&sessionId=${s.id}`;

  const handleBookNowClick = (s) => {
    const courseObj = courses.find((c) => c._id === s.courseId);
    if (courseObj) {
      // Check for Earthmoving bypass
      const bypassKeywords = ['excavator', 'haul truck', 'skid steer'];
      const isBypass = bypassKeywords.some(kw => 
        courseObj.title?.toLowerCase().includes(kw)
      );

      const variants = getCourseVariants(courseObj);
      if (variants.length <= 1 || isBypass) {
        let href = sessionBookNowHref(s);
        if (isBypass) {
          href += (href.includes('?') ? '&' : '?') + 'type=with-experience';
        }
        navigate(href);
      } else {
        setSelectedBookingCourse(courseObj);
        setSelectedBookingSession(s);
        setShowBookingModal(true);
      }
    } else {
      navigate(sessionBookNowHref(s));
    }
  };

  // ── Category cards ────────────────────────────────────────────────────────
  // Image priority: admin-managed Category.image → first course's image (legacy
  // fallback) → empty (gradient placeholder). Categories from the DB are
  // honoured for ordering and active-flag; if the DB list is empty we fall
  // back to deriving from courses so the section never goes blank.
  const courseImgByCat = activeCourses.reduce((acc, c) => {
    if (c.category && !acc[c.category] && c.image) acc[c.category] = c.image;
    return acc;
  }, {});
  const courseCountByCat = activeCourses.reduce((acc, c) => {
    if (c.category) acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  let categoryCards = [];
  if (dbCategories && dbCategories.length > 0) {
    categoryCards = dbCategories
      .filter((c) => c.active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((c) => ({
        category: c.name,
        image: c.image || courseImgByCat[c.name] || "",
        count: courseCountByCat[c.name] || 0,
      }))
      // Drop categories that have no active courses so we don't show an empty card.
      .filter((c) => c.count > 0);
  } else {
    categoryCards = [
      ...new Map(activeCourses.map((c) => [c.category, c])).values(),
    ]
      .map((c) => ({
        category: c.category,
        image: c.image,
        count: activeCourses.filter((ac) => ac.category === c.category).length,
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="mlp-root">

      {/* ── Top Bar ── */}
      <div className="mlp-topbar">
        <span className="mlp-logo-text">SafeTricks</span>
        <div className="mlp-topbar-phones">
          <a href={ORG_PHONE_1300.tel} className="mlp-topbar-phone">{ORG_PHONE_1300.display}</a>
          <span style={{ opacity: 0.5, color: "white" }}>|</span>
          <a href={ORG_PHONE_MOBILE.tel} className="mlp-topbar-phone">{ORG_PHONE_MOBILE.display}</a>
        </div>
      </div>
      <PublicNavbar courses={courses} />

      {/* ── Hero Carousel ── */}
      <div className="mlp-carousel">
        {filteredHeroSlides.map((s, i) => (
          <div
            key={i}
            className={`mlp-slide ${i === slide ? "active" : ""}`}
            // Every slide carries its own navigate handler. We don't gate
            // on `i === slide` here because (a) the inactive sibling
            // slides used to intercept taps that visually landed on the
            // visible image (they sit on top, opacity:0), so the gate
            // silently dropped clicks; (b) CSS now sets
            // `pointer-events: none` on inactive slides so only the
            // visible one receives taps anyway. Result: tapping anywhere
            // in the hero image — title, badge, blank space — opens the
            // course detail page, matching the title-tap behaviour.
            onClick={s.slug ? () => navigate(`/course/${s.slug}`) : undefined}
            role={s.slug ? "button" : undefined}
          >
            {/*
              Real <img> instead of a CSS background lets the browser
              preload it and respect fetchpriority. The first slide
              (the LCP candidate) gets fetchpriority="high" + eager
              loading; subsequent slides lazy-load until they advance.
            */}
            {s.image && (
              <img
                className="mlp-slide-bg"
                src={cdnImage(s.image, { w: 800 })}
                alt={s.title || ""}
                loading={i === 0 ? "eager" : "lazy"}
                fetchpriority={i === 0 ? "high" : "low"}
                decoding="async"
              />
            )}
            <div className="mlp-slide-overlay" />
            <div className="mlp-slide-content">
              <div className="mlp-slide-badge">
                {s.courseCode ? `${s.courseCode} — ` : ""}{activeCourses.find(c => c._id === s.id)?.category || "Course"}
              </div>
              <div className="mlp-slide-title">{s.title}</div>
              <span className="mlp-slide-price">{s.price}</span>
              {s.orig && <span className="mlp-slide-orig">{s.orig}</span>}
            </div>
          </div>
        ))}
        {/* ✅ CHANGED: prev/next use goSlide-aware changeSlide */}
        <button className="mlp-cbtn mlp-prev" onClick={() => changeSlide(-1)}>‹</button>
        <button className="mlp-cbtn mlp-next" onClick={() => changeSlide(1)}>›</button>
        {filteredHeroSlides.length > 8 ? (
          <div className="mlp-slide-counter">
            {/* {(filteredHeroSlides.length === 0 ? 0 : slide + 1)} / {filteredHeroSlides.length} */}
          </div>
        ) : (
          <div className="mlp-dots">
            {filteredHeroSlides.map((_, i) => (
              <div key={i} className={`mlp-dot ${i === slide ? "active" : ""}`} onClick={() => goSlide(i)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Trust Strip ── */}
      <div className="mlp-trust-strip">
        {trustPills.map((p, i) => <div key={i} className="mlp-trust-pill">{p}</div>)}
      </div>

      {/* ── Announcement Bar ── */}
      <div className="announcement-bar">
        <p>🔥 SUNDAY CLASSES AVAILABLE • ENROLL NOW • LIMITED SEATS 🔥 &nbsp;&nbsp;&nbsp; NATIONALLY RECOGNIZED CERTIFICATES • GET CERTIFIED WITH CREDENTIALS THAT ARE RECOGNIZED ACROSS ALL STATES AND TERRITORIES</p>
      </div>

      {/* ── CTA Strip ── */}
      <div className="mlp-cta-strip">
        <button className="mlp-btn-book" onClick={() => navigate("/book-now")}>Book Now</button>
        <button className="mlp-btn-book" onClick={() => navigate("/voc")}>Book VOC</button>
      </div>

      {/* ── Sessions — HERO SLIDE LINKED ── */}
      <div className="mlp-divider" />
      <div className="mlp-section mlp-sessions-section">
        <div className="mlp-section-label">Don't miss out</div>
        {/* ✅ NEW: title shows current course name; tag links to details */}
        <div className="mlp-section-title">
          Available sessions
        </div>

        {loadingSessions ? (
          <div className="mlp-dates-card">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mlp-date-row mlp-skeleton-row">
                <div className="mlp-skeleton mlp-skeleton-dot" />
                <div className="mlp-date-info">
                  <div className="mlp-skeleton mlp-skeleton-title" />
                  <div className="mlp-skeleton mlp-skeleton-sub" />
                </div>
                <div className="mlp-skeleton mlp-skeleton-badge" />
              </div>
            ))}
          </div>
        ) : allSessions.length === 0 ? (
          <div className="mlp-no-sessions">no dates available for booking</div>
        ) : (
          <>
            {/* ── Collapsed view: first 3 as list ── */}
            {!showAll && (
              <div className="mlp-dates-card">
                {allSessions.slice(0, SHOW_LIMIT).map((s) => {
                  const low = isLow(s.availableSlots);
                  const whenParts = [
                    formatDate(s.date),
                    s.location,
                    s.duration,
                    s.priceDisplay && s.priceDisplay !== "Enquire" ? s.priceDisplay : null,
                  ].filter(Boolean);
                  return (
                    <div key={s.id} className="mlp-date-row"  >
                      <div className={`mlp-date-dot ${low ? "amber" : ""}`} />
                      <div
                        className="mlp-date-info mlp-date-info-link"
                        onClick={() => handleBookNowClick(s)}
                      >
                        <div className="mlp-date-course">{currentCourseName}</div>
                        <div className="mlp-date-when">{whenParts.join(" · ")}</div>
                      </div>
                      <div className="mlp-date-actions">
                        <button className="mlp-date-spots " onClick={() => handleBookNowClick(s)}>
                          Book now
                        </button>
                        <div className={`mlp-date-spots ${low ? "low" : ""}`}>
                          {low ? "Filling Fast" : "Seats Available"}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Expanded view: sessions grouped 7 per page, swipe between pages ── */}
            {showAll && (() => {
              const PAGE_SIZE = 7;
              const pages = [];
              for (let i = 0; i < allSessions.length; i += PAGE_SIZE) {
                pages.push(allSessions.slice(i, i + PAGE_SIZE));
              }
              return (
                <div className="mlp-session-swipe">
                  {pages.map((page, pageIdx) => (
                    <div key={pageIdx} className="mlp-session-page-card">
                      {page.map((s) => {
                        const low = isLow(s.availableSlots);
                        const whenParts = [
                          formatDate(s.date),
                          s.location,
                          s.duration,
                          s.priceDisplay && s.priceDisplay !== "Enquire" ? s.priceDisplay : null,
                        ].filter(Boolean);
                        return (
                          <div key={s.id} className="mlp-date-row">
                            <div className={`mlp-date-dot ${low ? "amber" : ""}`} />
                            <div
                              className="mlp-date-info mlp-date-info-link"
                              onClick={() => handleBookNowClick(s)}
                            >
                              <div className="mlp-date-course">{currentCourseName}</div>
                              <div className="mlp-date-when">{whenParts.join(" · ")}</div>
                            </div>
                            <div className="mlp-date-actions">
                              <button
                                className="mlp-date-spots"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookNowClick(s);
                                }}
                              >
                                Book now
                              </button>
                              <div className={`mlp-date-spots ${low ? "low" : ""}`}>
                                {low ? "Filling Fast" : "Seats Available"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* page indicator */}
                      <div className="mlp-page-indicator">
                        {pageIdx + 1} / {pages.length}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* ── See more / See less button ── */}
            {hasMore && (
              <button
                className="mlp-see-more-btn"
                onClick={() => {
                  const next = !showAll;
                  setShowAll(next);
                  if (next) {
                    // pause hero auto-play
                    clearInterval(timerRef.current);
                  } else {
                    // resume hero auto-play
                    timerRef.current = setInterval(() => changeSlide(1), 3500);
                  }
                }}
              >
                {showAll ? "▲ See less" : `▼ See all ${allSessions.length} sessions`}
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Category Cards (3-column iPhone-icon grid) ── */}
      <div className="mlp-divider" />
      <div className="mlp-section" id="courses">
        <div className="mlp-section-label">All courses</div>
        <div className="mlp-section-title">Browse & book</div>
        <div className="mlp-cat-grid">
          {categoryCards.map((cat) => (
            <div
              key={cat.category}
              className="mlp-cat-tile"
              onClick={() => navigate(`/all-courses?category=${encodeURIComponent(cat.category)}`)}
            >
              <div
                className="mlp-cat-tile-icon"
                style={cat.image ? { backgroundImage: `url(${cdnImage(cat.image, { w: 160 })})` } : undefined}
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

      {/* ── Reviews & Stats ── */}
      <div className="mlp-divider" />
      <div className="mlp-section">
        <div className="mlp-section-label">Trusted by thousands</div>
        <div className="mlp-section-title">What students say</div>
        <div className="mlp-stats-row">
          <div className="mlp-stat"><div className="mlp-stat-num">{reviewCountFormatted}</div><div className="mlp-stat-label">5-star reviews</div></div>
          <div className="mlp-stat"><div className="mlp-stat-num">{activeCourses.length || "15"}+</div><div className="mlp-stat-label">courses</div></div>
          <div className="mlp-stat"><div className="mlp-stat-num">2019</div><div className="mlp-stat-label">established</div></div>
        </div>
        <div className="mlp-reviews-summary">
          <div className="mlp-review-big">{Number(placeRating).toFixed(1)}</div>
          <div>
            <div className="mlp-stars">★★★★★</div>
            <div className="mlp-review-count">{reviewCountLabel}</div>
            <div className="mlp-review-site">safetricks.com.au</div>
          </div>
        </div>
        <div className="mlp-review-scroll">
          {mobileReviews.map((r, i) => (
            <div key={i} className="mlp-review-card">
              <div className="mlp-review-header">
                <div className="mlp-review-name">{r.name}</div>
                <div className="mlp-stars" style={{ fontSize: 12 }}>★★★★★</div>
              </div>
              <div className="mlp-review-quote">"{r.quote}"</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Partner Brands — infinite marquee ── */}
      {/* ── Partner Brands — infinite marquee ── */}
<div className="mlp-divider" />
<ClientsSection />

      {/* ── Enquire Now button ── */}
      <div className="mlp-divider" />
      <div className="mlp-section mlp-section-enquire">
        <button className="mlp-enquire-btn" onClick={() => setShowEnquire(true)}>
          Enquire Now
        </button>
      </div>

      {/* ── Enquire Modal (ContactEnrollment) ── */}
      {showEnquire && (
        <div className="mlp-modal-backdrop" onClick={() => setShowEnquire(false)}>
          <div className="mlp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mlp-modal-header">
              <span className="mlp-modal-title">Course Enquiry</span>
              <button className="mlp-modal-close" onClick={() => setShowEnquire(false)}>✕</button>
            </div>
            <div className="mlp-modal-body">
              <div className="mlp-form-row">
                <input className="mlp-input" type="text" placeholder="Name *" />
                <input className="mlp-input" type="tel" placeholder="Phone *" />
              </div>
              <input className="mlp-input mlp-input-full" type="email" placeholder="Email *" />
              <input className="mlp-input mlp-input-full" type="text" placeholder="Subject" />
              <textarea className="mlp-textarea" placeholder="Message" rows={4} />
              <button
                className="mlp-modal-send"
                onClick={() => setShowEnquire(false)}
              >
                SEND ✈
              </button>
              <div className="mlp-modal-divider" />
              <p className="mlp-modal-enrol-text">Ready to enrol? Use the buttons below:</p>
              <div className="mlp-modal-enrol-btns">
                <a href="/book-now" className="mlp-modal-enrol-btn">ENROL NOW</a>
                <a href="/voc" className="mlp-modal-voc-btn">VOC</a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {showBookingModal && selectedBookingCourse && (
        <BookingModal
          course={selectedBookingCourse}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBookingCourse(null);
            setSelectedBookingSession(null);
          }}
          // Pass the session info so the modal can include it in the URL
          extraQueryParams={
            selectedBookingSession
              ? `&scheduleId=${selectedBookingSession.scheduleId}&sessionId=${selectedBookingSession.id}`
              : ""
          }
        />
      )}
      {/* ── Sticky Bottom Bar ── */}
      <div className="mlp-sticky">
        <button 
          className="mlp-sticky-call" 
          onClick={() => navigate("/book-now")}
        >
          Enroll Now
        </button>
        <a href={ORG_PHONE_1300.wa} className="mlp-sticky-wa">
          <span><i className="fa-brands fa-whatsapp"></i></span>
        </a>
      </div>

    </div>
  );
}