// import { useParams } from "react-router-dom"
// import { useEffect, useState, useRef, useMemo } from "react"
// import axios from "axios"
// import "../styles/CourseDetails.css"
// import PublicNavbar from "../components/PublicNavbar"
// import Footer from "../components/landingPage/Footer"
// import ViewCourseDetailMobile from "../components/mobile/components/ViewCourseDetailMobile"
// import { API_URL } from "../data/service"
// import { ACTIVE_COURSES_URL, isActiveCourse } from "../utils/courseStatus"
// import { useNavigate, useLocation } from "react-router-dom"
// import { cdnImage } from "../utils/cdnImage"
// import { ORG_PHONE_1300 } from "../utils/organizationPhones"
// import {
//     getCoursePricingType,
//     getCourseVariants,
//     getCoursePriceNumber,
// } from "../utils/coursePrice"
// import BookingModal from "../components/course/BookingModal"
// import logo from "../assets/staLogo.png"
// import PdfViewer from '../components/common/PdfViewer';
// import { useGoogleReviews, shortAuthorName, getReviewDisplayText, GOOGLE_REVIEWS_MAX } from "../hooks/useGoogleReviews"
// import { FALLBACK_COURSE_REVIEWS } from "../data/reviewsFallback"
// import { ChevronDown } from "lucide-react"

// // Collapsible "FAQ style" wrapper for the cards in the left/main column.
// // Click the header to open or close — defaults to open so nothing important
// // is hidden until the visitor chooses to tidy the page up.
// function AccordionCard({ title, defaultOpen = true, children }) {
//     const [open, setOpen] = useState(defaultOpen)
//     return (
//         <div className="cdp-card cdp-accordion">
//             <button
//                 type="button"
//                 className="cdp-card-title cdp-accordion-toggle"
//                 onClick={() => setOpen((o) => !o)}
//                 aria-expanded={open}
//             >
//                 <span>{title}</span>
//                 <ChevronDown
//                     className={`cdp-accordion-chevron${open ? "" : " is-closed"}`}
//                     size={18}
//                     aria-hidden="true"
//                 />
//             </button>
//             <div className={`cdp-accordion-panel${open ? "" : " is-collapsed"}`}>
//                 <div className="cdp-accordion-panel-inner">
//                     {children}
//                 </div>
//             </div>
//         </div>
//     )
// }

// // Blue rounded tick icon — matches the screenshots exactly
// // Outer ring (stroke) + filled inner circle + white checkmark
// function BlueTick() {
//     return (
//         <span className="cdp-blue-tick" aria-hidden="true">
//             <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 {/* outer thin ring */}
//                 <circle cx="16" cy="16" r="14.5" stroke={colors.brandPrimary} strokeWidth="1.5" fill="none"/>
//                 {/* filled inner circle */}
//                 <circle cx="16" cy="16" r="11" fill={colors.brandPrimary}/>
//                 {/* white checkmark */}
//                 <path d="M10.5 16.5L14 20L21.5 12.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
//             </svg>
//         </span>
//     )
// }

// function chunkArray(arr, size) {
//     if (!arr) return []
//     const res = []
//     for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size))
//     return res
// }

// function useIsMobile(breakpoint = 768) {
//     const [isMobile, setIsMobile] = useState(
//         () => window.innerWidth <= breakpoint
//     )
//     useEffect(() => {
//         const handler = () => setIsMobile(window.innerWidth <= breakpoint)
//         window.addEventListener("resize", handler)
//         return () => window.removeEventListener("resize", handler)
//     }, [breakpoint])
//     return isMobile
// }

// function CourseDetails() {
//     const navigate = useNavigate()
//     const location = useLocation()
//     const searchParams = new URLSearchParams(location.search)
//     const fromPortal = searchParams.get("fromPortal") === "true"
//     // Route is /course/:slug. We support a legacy fallback where the param
//     // still ends with -<ObjectId> (LegacyCourseRedirect rewrites the URL,
//     // but the redirect runs in an effect so the first render still has the
//     // raw param — handle both shapes here).
//     const { slug } = useParams()
//     const legacyMatch = slug?.match(/^[a-z0-9-]+-([a-f0-9]{24})$/i)
//     const fetchSlug = legacyMatch ? slug.replace(`-${legacyMatch[1]}`, "") : slug
//     const fallbackId = legacyMatch ? legacyMatch[1] : null

//     const [course, setCourse] = useState(null)
//     const [courseUnavailable, setCourseUnavailable] = useState(false)
//     const [courses, setCourses] = useState([])
//     const [sessions, setSessions] = useState([])
//     const [loadingSessions, setLoadingSessions] = useState(true)
//     const [showAllSessions, setShowAllSessions] = useState(false)
//     const [showModal, setShowModal] = useState(false)
//     const [selectedOptionId, setSelectedOptionId] = useState(null)
//     const swipeRef = useRef(null)
//     const isMobile = useIsMobile()
//     const {
//         reviews: apiReviews,
//         reviewCountLabel,
//         reviewCountFormatted,
//         placeRating,
//     } = useGoogleReviews()

//     const googleReviewsTrustTitle = `${reviewCountFormatted} Five-Star Google Reviews`

//     const courseReviews = useMemo(() => {
//         if (!apiReviews.length) return FALLBACK_COURSE_REVIEWS
//         return apiReviews.slice(0, GOOGLE_REVIEWS_MAX).map((r) => ({
//             name: shortAuthorName(r.name),
//             course: r.relativeTime || "Google Review",
//             text: getReviewDisplayText(r),
//         }))
//     }, [apiReviews])

//     // const handleViewPDF = (pdfUrl) => {
//     //     if (!pdfUrl) return;
//     //     let fixedUrl = pdfUrl;
//     //     if (pdfUrl.includes("res.cloudinary.com")) {
//     //         // Remove any existing fl_attachment flag first
//     //         fixedUrl = pdfUrl.replace(/\/fl_attachment[^/]*\//g, "/");
//     //         // For raw uploads: add fl_attachment:false so browser displays inline instead of downloading
//     //         if (fixedUrl.includes("/raw/upload/")) {
//     //             fixedUrl = fixedUrl.replace("/raw/upload/", "/raw/upload/fl_attachment:false/");
//     //         }
//     //         if (!fixedUrl.startsWith("http")) fixedUrl = `https://${fixedUrl.replace(/^\/+/, "")}`;
//     //     } else if (!pdfUrl.startsWith("http")) {
//     //         fixedUrl = `${API_URL}/${pdfUrl}`;
//     //     }
//     //     window.open(fixedUrl, "_blank");
//     // };
// const handleViewPDF = (pdfUrl) => {
//     if (!pdfUrl) return;
//     let fixedUrl = pdfUrl;
//     if (pdfUrl.includes("res.cloudinary.com")) {
//         fixedUrl = pdfUrl.replace(/\/fl_attachment[^/]*\//g, "/");
//         if (fixedUrl.includes("/raw/upload/")) {
//             fixedUrl = fixedUrl.replace("/raw/upload/", "/raw/upload/fl_attachment:false/");
//         }
//         if (!fixedUrl.startsWith("http")) fixedUrl = `https://${fixedUrl.replace(/^\/+/, "")}`;
//     } else if (!pdfUrl.startsWith("http")) {
//         fixedUrl = `${API_URL}/${pdfUrl}`;
//     }
//     // Open via Google Docs viewer — displays PDF inline, no download prompt
//     const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fixedUrl)}&embedded=true`;
//     window.open(googleViewerUrl, "_blank");
// };
//     useEffect(() => {
//         if (!fetchSlug && !fallbackId) return
//         // Primary: slug lookup. Falls back to id lookup only if a legacy
//         // URL slipped past the redirect (e.g. server-rendered link cached
//         // before the redirect mounted).
//         const url = fetchSlug
//             ? `${API_URL}/api/courses/slug/${encodeURIComponent(fetchSlug)}`
//             : `${API_URL}/api/courses/${fallbackId}`

//         setCourseUnavailable(false)
//         setCourse(null)

//         const applyCourse = (data) => {
//             if (!isActiveCourse(data)) {
//                 setCourseUnavailable(true)
//                 return
//             }
//             setCourse(data)
//         }

//         axios.get(url)
//             .then(res => applyCourse(res.data))
//             .catch(err => {
//                 if (fetchSlug && fallbackId) {
//                     axios.get(`${API_URL}/api/courses/${fallbackId}`)
//                         .then(r => applyCourse(r.data))
//                         .catch(() => setCourseUnavailable(true))
//                 } else {
//                     setCourseUnavailable(true)
//                     console.error("Course fetch error:", err)
//                 }
//             })

//         axios.get(ACTIVE_COURSES_URL(API_URL))
//             .then(res => setCourses(res.data))
//             .catch(err => console.error("Courses fetch error:", err))
//     }, [fetchSlug, fallbackId])

//     useEffect(() => {
//         if (!course?._id) return
//         setLoadingSessions(true)
//         axios.get(`${API_URL}/api/schedules/course/${course._id}`)
//             .then(res => {
//                 const rows = []
//                 res.data.forEach(sched => {
//                     sched.sessions
//                         .filter(s => s.status === "Active")
//                         .forEach(s => {
//                             rows.push({
//                                 id: s._id,
//                                 scheduleId: sched._id,
//                                 date: sched.date,
//                                 startTime: s.startTime,
//                                 endTime: s.endTime,
//                                 location: s.location || course.location || "NSW",
//                                 availableSlots: s.availableSlots
//                             })
//                         })
//                 })
//                 rows.sort((a, b) => new Date(a.date) - new Date(b.date))
//                 setSessions(rows)
//             })
//             .catch(err => console.error("Session fetch error:", err))
//             .finally(() => setLoadingSessions(false))
//     }, [course?._id])

//     useEffect(() => {
//         if (!course) return

//         const defaultTitle = "SafeTricks | Sydney NSW"
//         const defaultDesc =
//             "SafeTricks — RTO 45234. Forklift, White Card, EWP, Working at Heights, Confined Space and more. Sydney NSW."

//         const prevTitle = document.title
//         const metaEl = document.querySelector('meta[name="description"]')
//         const prevDesc = metaEl?.getAttribute("content") ?? defaultDesc

//         const pageTitle = course.metaTitle?.trim() || course.title?.trim()
//         document.title = pageTitle || defaultTitle

//         const pageDesc =
//             course.metaDescription?.trim() ||
//             (Array.isArray(course.description) ? course.description[0] : course.description)?.trim()
//         if (pageDesc && metaEl) metaEl.setAttribute("content", pageDesc)

//         return () => {
//             document.title = prevTitle
//             if (metaEl) metaEl.setAttribute("content", prevDesc)
//         }
//     }, [course])

//     if (isMobile) {
//         return <ViewCourseDetailMobile course={course} courses={courses} fromPortal={fromPortal} />
//     }

//     if (courseUnavailable) {
//         return (
//             <section>
//                 <PublicNavbar courses={courses} />
//                 <div className="cdp-loading" style={{ padding: "4rem 2rem", textAlign: "center" }}>
//                     <h2>Course not available</h2>
//                     <p style={{ marginTop: "1rem", color: colors.textFaint }}>
//                         This course is no longer offered. Browse our current courses below.
//                     </p>
//                     <button
//                         type="button"
//                         style={{ marginTop: "1.5rem" }}
//                         onClick={() => navigate("/all-courses")}
//                     >
//                         View all courses
//                     </button>
//                 </div>
//                 <Footer />
//             </section>
//         )
//     }

//     if (!course) {
//         return (
//             <div className="cdp-loading">
//                 <PublicNavbar courses={courses} />
//             </div>
//         )
//     }

//     const originalPrice = course?.originalPrice || 0
//     const sellingPrice = course?.sellingPrice || 0
//     const savings = originalPrice - sellingPrice

//     const bypassKeywords = ["excavator", "haul truck", "skid steer"]
//     const isBypass = bypassKeywords.some(kw => course?.title?.toLowerCase().includes(kw))
//     const pricingType = getCoursePricingType(course)
//     const variants = getCourseVariants(course)
//     const isSlbl = pricingType === "slbl"
//     const isExperience = (pricingType === "experience" || isBypass) && !isSlbl
//     const slVariant = variants.find((v) => v.key === "sl")
//     const slblVariant = variants.find((v) => v.key === "slbl")
//     const fromPrice = getCoursePriceNumber(course)

//     const relatedCourses = courses
//         .filter(c => c._id !== course._id)

//     const openBooking = (type, forceSkipModal = false) => {
//         if ((isExperience || isSlbl) && !forceSkipModal) {
//             setSelectedOptionId(type || null)
//             setShowModal(true)
//         } else {
//             const query = fromPortal ? "?fromPortal=true" : ""
//             const typeParam = type ? `${query ? "&" : "?"}type=${type}` : ""
//             navigate(`/book-now/course/${course.slug}${query}${typeParam}`)
//         }
//     }

//     // ── Hero price card ────────────────────────────────────────────────────
//     const HeroPriceCard = () => (
//         <div className="cdp-price-card">

//             {isSlbl && (
//                 <>
//                     <div className="cdp-pc-slbl-row">
//                         <div className="cdp-pc-exp-block">
//                             <p className="cdp-pc-slbl-label">Single License (SL or BL)</p>
//                             <span className="cdp-price-now">${slVariant?.price ?? 0}</span>
//                             {slVariant?.original && slVariant.original > slVariant.price && (
//                                 <span className="cdp-price-old">${slVariant.original}</span>
//                             )}
//                         </div>
//                         <div className="cdp-pc-exp-block">
//                             <p className="cdp-pc-slbl-label">Both Licenses (SL + BL)</p>
//                             <span className="cdp-price-now">${slblVariant?.price ?? 0}</span>
//                             {slblVariant?.original && slblVariant.original > slblVariant.price && (
//                                 <span className="cdp-price-old">${slblVariant.original}</span>
//                             )}
//                         </div>
//                     </div>
//                     <p className="cdp-price-note">
//                         All inclusive — no hidden fees · SafeWork NSW card fee included
//                     </p>
//                     <div className="cdp-exp-btns">
//                         <button
//                             className="cdp-btn-book cdp-btn-exp-with"
//                             onClick={() => openBooking("sl", true)}
//                         >
//                             ${slVariant?.price ?? 0} &nbsp; Book {slVariant?.label || "SL or BL"}
//                         </button>
//                         <button
//                             className="cdp-btn-book cdp-btn-slbl"
//                             onClick={() => openBooking("slbl", true)}
//                         >
//                             ${slblVariant?.price ?? 0} &nbsp; Book {slblVariant?.label || "SL + BL"}
//                         </button>
//                     </div>
//                 </>
//             )}

//             {isExperience && (
//                 <>
//                     <div className="cdp-price-row">
//                         <span className="cdp-price-now">${course.withExperiencePrice}</span>
//                         {course.withExperienceOriginal && (
//                             <span className="cdp-price-old">${course.withExperienceOriginal}</span>
//                         )}
//                         {(course.withExperienceOriginal || originalPrice) > course.withExperiencePrice && (
//                             <span className="cdp-save-badge">Save ${(course.withExperienceOriginal || originalPrice) - course.withExperiencePrice}</span>
//                         )}
//                     </div>
//                     <p className="cdp-price-note">
//                         All inclusive — no hidden fees · SafeWork NSW card fee included
//                     </p>
//                     <div className="cdp-exp-btns">
//                         <button
//                             className="cdp-btn-book cdp-btn-exp-with"
//                             onClick={() => openBooking("with-experience", true)}
//                         >
//                             ${course.withExperiencePrice} &nbsp; Book With Experience
//                         </button>
//                         <button
//                             className="cdp-btn-book cdp-btn-exp-without"
//                             onClick={() => openBooking("without-experience", true)}
//                         >
//                             ${course.withoutExperiencePrice} &nbsp; Book Without Experience
//                         </button>
//                     </div>
//                 </>
//             )}

//             {/* STANDARD */}
//             {!isSlbl && !isExperience && (
//                 <>
//                     <div className="cdp-price-row">
//                         <span className="cdp-price-now">${sellingPrice}</span>
//                         {originalPrice > sellingPrice && (
//                             <span className="cdp-price-old">${originalPrice}</span>
//                         )}
//                         {savings > 0 && (
//                             <span className="cdp-save-badge">Save ${savings}</span>
//                         )}
//                     </div>
//                     <p className="cdp-price-note">
//                         All inclusive — no hidden fees · SafeWork NSW card fee included
//                     </p>
//                     <button
//                         className="cdp-btn-book"
//                         onClick={() => openBooking(null, true)}
//                     >
//                         Book Now — Pick a Date
//                     </button>
//                 </>
//             )}

//             <button className="cdp-btn-voc" onClick={() => navigate(`/voc?courseId=${course._id}${fromPortal ? "&fromPortal=true" : ""}`)}>
//                 Already Trained? Book VOC
//             </button>
//             <ul className="cdp-trust-list">
//                 <li><span className="cdp-check">✓</span> Certificate issued same day</li>
//                 <li><span className="cdp-check">✓</span> Sunday sessions available</li>
//                 <li><span className="cdp-check">✓</span> SafeWork NSW approved RTO</li>
//                 <li><span className="cdp-check">✓</span> {reviewCountFormatted} five-star Google reviews</li>
//             </ul>
//         </div>
//     )

//     // ── Sidebar price card ─────────────────────────────────────────────────
//     const SidebarPriceCard = () => (
//         <div className="cdp-sb-card">
//             <div className="cdp-sb-title">Enrol in this course</div>

//             {/* SLBL */}
//             {isSlbl && (
//                 <>
//                     <div className="cdp-sb-exp-row">
//                         <span className="cdp-sb-exp-label">Single License (SL or BL)</span>
//                         <span className="cdp-sb-price">${slVariant?.price ?? 0}</span>
//                     </div>
//                     <div className="cdp-sb-exp-row">
//                         <span className="cdp-sb-exp-label">Both Licenses (SL + BL)</span>
//                         <span className="cdp-sb-price">${slblVariant?.price ?? 0}</span>
//                     </div>
//                     <div className="cdp-sb-note">All inclusive · SafeWork NSW card fee included</div>
//                     <button
//                         className="cdp-sb-btn-exp-with"
//                         onClick={() => openBooking("sl", true)}
//                     >
//                         ${slVariant?.price ?? 0} &nbsp; Book {slVariant?.label || "SL or BL"}
//                     </button>
//                     <button
//                         className="cdp-sb-btn-slbl"
//                         onClick={() => openBooking("slbl", true)}
//                     >
//                         ${slblVariant?.price ?? 0} &nbsp; Book {slblVariant?.label || "SL + BL"}
//                     </button>
//                 </>
//             )}

//             {/* EXPERIENCE */}
//             {isExperience && (
//                 <>
//                     <div className="cdp-sb-exp-row">
//                         <span className="cdp-sb-exp-label">With experience</span>
//                         <span className="cdp-sb-price">${course.withExperiencePrice}</span>
//                     </div>
//                     <div className="cdp-sb-exp-row">
//                         <span className="cdp-sb-exp-label">Without experience</span>
//                         <span className="cdp-sb-price">${course.withoutExperiencePrice}</span>
//                     </div>
//                     <div className="cdp-sb-note">All inclusive · SafeWork NSW card fee included</div>
//                     <button
//                         className="cdp-sb-btn-exp-with"
//                         onClick={() => openBooking("with-experience")}
//                     >
//                         ${course.withExperiencePrice} &nbsp; Book With Experience
//                     </button>
//                     <button
//                         className="cdp-sb-btn-exp-without"
//                         onClick={() => openBooking("without-experience")}
//                     >
//                         ${course.withoutExperiencePrice} &nbsp; Book Without Experience
//                     </button>
//                 </>
//             )}

//             {/* STANDARD */}
//             {!isSlbl && !isExperience && (
//                 <>
//                     <div className="cdp-sb-price-row">
//                         <span className="cdp-sb-price">${sellingPrice}</span>
//                         {originalPrice > sellingPrice && (
//                             <span className="cdp-sb-orig">${originalPrice}</span>
//                         )}
//                     </div>
//                     <div className="cdp-sb-note">All inclusive · SafeWork NSW card fee included</div>
//                     <button
//                         className="cdp-sb-btn-main"
//                         onClick={() => openBooking()}
//                     >
//                         Book Now — Pick a Date
//                     </button>
//                 </>
//             )}

//             <button className="cdp-sb-btn-voc" onClick={() => navigate(`/voc?courseId=${course._id}${fromPortal ? "&fromPortal=true" : ""}`)}>
//                 Already Trained? Book VOC
//             </button>
//             <ul className="cdp-sb-mini-list">
//                 <li><span>✓</span> Certificate same day</li>
//                 <li><span>✓</span> Sunday sessions available</li>
//                 <li><span>✓</span> No prior experience required</li>
//                 <li><span>✓</span> Nationally valid in all states</li>
//             </ul>
//         </div>
//     )

//     return (
//         <div className="cdp">

//             <PublicNavbar courses={courses} />

//             {/* ── HERO ──
//                  Real <img> behind the overlay so the LCP image is preloaded
//                  with fetchpriority="high" instead of waiting for CSS to
//                  resolve a background-image URL.
//             */}
//             <div className="cdp-hero">
//                 {course?.image && (
//                     <img
//                         className="cdp-hero-bg"
//                         src={cdnImage(course.image, { w: 1600 })}
//                         alt={course?.title || ""}
//                         loading="eager"
//                         fetchpriority="high"
//                         decoding="async"
//                     />
//                 )}
//                 <div className="cdp-hero-inner">
//                     <div className="cdp-hero-left">
//                         <div className="cdp-tag">
//                             {course?.courseCode ? `${course.courseCode} — ` : ""}{course?.category}
//                         </div>
//                         <h1 className="cdp-title">{course?.title}</h1>
//                         <div className="cdp-code">
//                             {course?.courseCode} &nbsp;·&nbsp; Nationally Recognised Training
//                         </div>
//                         <p className="cdp-desc">
//                             {Array.isArray(course?.description)
//                                 ? course.description[0]
//                                 : course?.description || ""}
//                         </p>
//                     </div>

//                     <div className="cdp-hero-right">
//                         <HeroPriceCard />
//                     </div>
//                 </div>

//                 {/* ── QUICK FACTS BAR ── */}
//                 <div className="cdp-qfbar">
//                     {[
//                         { icon: "📅", val: course?.trainingDuration || "", label: "Course duration" },
//                         { icon: "⏰", val: "8:30am – 4:30pm", label: "Class hours" },
//                         { icon: "📍", val: course?.location || "Sefton NSW", label: "Training location" },
//                         { icon: "🎓", val: "", label: "Accredited provider" },
//                         { icon: "📜", val: "Same Day", label: "Certificate issued" },
//                         { icon: "🗺", val: "All States", label: "Nationally recognised" },
//                     ].map((item, i) => (
//                         <div className="cdp-qf-item" key={i}>
//                             <div className="cdp-qf-icon">{item.icon}</div>
//                             <div>
//                                 <div className="cdp-qf-val">{item.val}</div>
//                                 <div className="cdp-qf-label">{item.label}</div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {showModal && (
//                 <BookingModal
//                     course={course}
//                     onClose={() => {
//                         setShowModal(false)
//                         setSelectedOptionId(null)
//                     }}
//                     initialSelection={selectedOptionId}
//                     extraQueryParams={fromPortal ? "fromPortal=true" : ""}
//                 />
//             )}
            

//             {/* ── MAIN LAYOUT ── */}
//             {/* ── MAIN LAYOUT ── */}
//             <div className="cdp-main">

//                 <div className="cdp-content">
                    
//                     {/* AVAILABLE DATES & LOCATIONS — after all plain sections */}
//                     <AccordionCard title="Available dates & locations">
//                         {loadingSessions ? (
//                             <div className="cdp-sessions-loading">Loading sessions...</div>
//                         ) : sessions.length === 0 ? (
//                             <p className="cdp-no-sessions">no dates available for booking</p>
//                         ) : (
//                             <>
//                                 {!showAllSessions ? (
//                                     <div className="cdp-sessions-list">
//                                         {sessions.slice(0, 4).map((s, i) => {
//                                             const d = new Date(s.date)
//                                             const day = d.getDate()
//                                             const mon = d.toLocaleString("en-AU", { month: "short" }).toUpperCase()
//                                             const weekday = d.toLocaleString("en-AU", { weekday: "long" })
//                                             const cleanLoc = (s.location || "").replace(/Face to Face/gi, "").replace(/Sefton/gi, "").replace(/Safton/gi, "Sefton").replace(/·\s*$/g, "").trim()
//                                             const today = new Date()
//                                             const diffDays = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
//                                             let spotLabel = "Seats Available", spotClass = ""
//                                             if (s.availableSlots <= 3) { spotLabel = "Filling Fast"; spotClass = "cdp-s-spots--low" }
//                                             else if (diffDays < 20 || s.availableSlots <= 10) { spotLabel = "Limited Seats"; spotClass = "cdp-s-spots--medium" }
//                                             return (
//                                                 <div className="cdp-session-row" key={i}>
//                                                     <div className="cdp-s-date">
//                                                         <div className="cdp-s-day">{day}</div>
//                                                         <div className="cdp-s-mon">{mon}</div>
//                                                     </div>
//                                                     <div className="cdp-s-info">
//                                                         <div className="cdp-s-title">{weekday}</div>
//                                                         <div className="cdp-s-meta">{s.startTime} – {s.endTime}</div>
//                                                     </div>
//                                                     <div className="cdp-s-meta-desktop">{cleanLoc}</div>
//                                                     <div className={`cdp-s-spots ${spotClass}`}>{spotLabel}</div>
//                                                     <button
//                                                         className="cdp-s-btn"
//                                                         onClick={() => navigate(`/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${fromPortal ? "&fromPortal=true" : ""}`)}
//                                                     >Book</button>
//                                                 </div>
//                                             )
//                                         })}
//                                     </div>
//                                 ) : (
//                                     <div className="cdp-sessions-expanded">
//                                         {chunkArray(sessions, 7).map((page, pIdx) => (
//                                             <div key={pIdx} className="cdp-expanded-page">
//                                                 {page.map((s, i) => {
//                                                     const d = new Date(s.date)
//                                                     const day = d.getDate()
//                                                     const mon = d.toLocaleString("en-AU", { month: "short" }).toUpperCase()
//                                                     const weekday = d.toLocaleString("en-AU", { weekday: "long" })
//                                                     const cleanLoc = (s.location || "").replace(/Face to Face/gi, "").replace(/Sefton/gi, "").replace(/Safton/gi, "Sefton").replace(/·\s*$/g, "").trim()
//                                                     const cleanTime = (s.startTime || "").replace(/Face to Face/gi, "").trim()
//                                                     const today = new Date()
//                                                     const diffDays = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
//                                                     let spotLabel = "Seats Available", spotClass = ""
//                                                     if (s.availableSlots <= 3) { spotLabel = "Filling Fast"; spotClass = "cdp-s-spots--low" }
//                                                     else if (diffDays < 20 || s.availableSlots <= 10) { spotLabel = "Limited Seats"; spotClass = "cdp-s-spots--medium" }
//                                                     return (
//                                                         <div className="cdp-session-row expanded" key={i}>
//                                                             <div className="cdp-s-date">
//                                                                 <div className="cdp-s-day">{day}</div>
//                                                                 <div className="cdp-s-mon">{mon}</div>
//                                                             </div>
//                                                             <div className="cdp-s-info">
//                                                                 <div className="cdp-s-title">{weekday} — Full day</div>
//                                                                 <div className="cdp-s-meta">{cleanTime} – {s.endTime} &nbsp;·&nbsp; {cleanLoc}</div>
//                                                             </div>
//                                                             <div className={`cdp-s-spots ${spotClass}`}>{spotLabel}</div>
//                                                             <button
//                                                                 className="cdp-s-btn"
//                                                                 onClick={() => navigate(`/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${fromPortal ? "&fromPortal=true" : ""}`)}
//                                                             >Book</button>
//                                                         </div>
//                                                     )
//                                                 })}
//                                                 <div className="cdp-page-indicator">{pIdx + 1} / {Math.ceil(sessions.length / 7)}</div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                                 {sessions.length > 4 && (
//                                     <button className="cdp-see-all-btn" onClick={() => setShowAllSessions(!showAllSessions)}>
//                                         {showAllSessions ? "See less" : "See all sessions"}
//                                     </button>
//                                 )}
//                             </>
//                         )}
//                     </AccordionCard>

//                     {/* ═══════════════════════════════════════════
//                         COURSE DETAIL SECTIONS (plain, no accordion)
//                         Matches screenshot design: blue bold title,
//                         seamless flow, blue rounded tick icons
//                     ═══════════════════════════════════════════ */}

//                     {/* COURSE DESCRIPTION */}
//                     {(() => {
//                         const descParagraphs = Array.isArray(course?.description)
//                             ? course.description.filter(Boolean)
//                             : course?.description
//                                 ? [course.description]
//                                 : []
                       
//                         if (descParagraphs.length === 0) return null
//                         return (
//                             <div className="cdp-section">
//                                 <h2 className="cdp-section-title">Course Description</h2>
//                                 <div className="cdp-desc-layout">
//                                     <div className="cdp-desc-text">
//                                         {descParagraphs.map((p, i) => (
//                                             <p key={i}>{p}</p>
//                                         ))}
//                                     </div>
                                
//                                 </div>
//                             </div>
//                         )
//                     })()}

//                     {/* ENTRY REQUIREMENTS */}
//                     {Array.isArray(course?.requirements) && course.requirements.filter(Boolean).length > 0 && (
//                         <div className="cdp-section">
//                             <h2 className="cdp-section-title">Entry Requirements</h2>
//                             <ul className="cdp-tick-list">
//                                 {course.requirements.filter(Boolean).map((item, i) => (
//                                     <li key={i}>
//                                         <BlueTick />
//                                         <span>{item}</span>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     )}

//                     {/* DURATION */}
//                     {course?.duration && (
//                         <div className="cdp-section">
//                             <h2 className="cdp-section-title">Duration</h2>
//                             <p className="cdp-section-text">
//                                 The total duration is {course.duration}. Training and assessment are conducted in our training centre.
//                             </p>
//                         </div>
//                     )}

//                     {/* TRAINING OVERVIEW */}
//                     {Array.isArray(course?.trainingOverview) && course.trainingOverview.filter(Boolean).length > 0 && (
//                         <div className="cdp-section">
//                             <h2 className="cdp-section-title">Training Overview</h2>
//                             <ul className="cdp-tick-list">
//                                 {course.trainingOverview.filter(Boolean).map((item, i) => (
//                                     <li key={i}>
//                                         <BlueTick />
//                                         <span>{item}</span>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     )}

//                     {/* VOCATIONAL OUTCOME */}
//                     {Array.isArray(course?.vocationalOutcome) && course.vocationalOutcome.filter(Boolean).length > 0 && (() => {
//                         const items = course.vocationalOutcome.filter(Boolean)
//                         // First item is often a long intro sentence, render as plain text
//                         const firstIsIntro = items.length > 1 && items[0].length > 80
//                         const intro = firstIsIntro ? items[0] : null
//                         const bullets = firstIsIntro ? items.slice(1) : items
//                         return (
//                             <div className="cdp-section">
//                                 <h2 className="cdp-section-title">Vocational Outcome</h2>
//                                 {intro && <p className="cdp-section-text">{intro}</p>}
//                                 {bullets.length > 0 && (
//                                     <ul className="cdp-tick-list">
//                                         {bullets.map((item, i) => (
//                                             <li key={i}>
//                                                 <BlueTick />
//                                                 <span>{item}</span>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 )}
//                             </div>
//                         )
//                     })()}

//                     {/* WHAT YOU WILL LEARN */}
//                     {Array.isArray(course?.outcomePoints) && course.outcomePoints.filter(Boolean).length > 0 && (
//                         <div className="cdp-section">
//                             <h2 className="cdp-section-title">What you will learn</h2>
//                             <ul className="cdp-tick-list">
//                                 {course.outcomePoints.filter(Boolean).map((item, i) => (
//                                     <li key={i}>
//                                         <BlueTick />
//                                         <span>{item}</span>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     )}

//                     {/* PATHWAYS */}
//                     {Array.isArray(course?.pathways) && course.pathways.filter(Boolean).length > 0 && (
//                         <div className="cdp-section">
//                             <h2 className="cdp-section-title">Pathways</h2>
//                             {course.pathways.filter(Boolean).map((p, i) => (
//                                 <p key={i} className="cdp-section-text cdp-section-italic">{p}</p>
//                             ))}
//                         </div>
//                     )}

//                     {/* FEES AND CHARGES */}
//                     {Array.isArray(course?.feesCharges) && course.feesCharges.filter(Boolean).length > 0 && (
//                         <div className="cdp-section">
//                             <h2 className="cdp-section-title">Fees and Charges</h2>
//                             <ul className="cdp-tick-list">
//                                 {course.feesCharges.filter(Boolean).map((item, i) => (
//                                     <li key={i}>
//                                         <BlueTick />
//                                         <span>{item}</span>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     )}

//                     {/* OPTIONAL */}
//                     {Array.isArray(course?.optionalCharges) && course.optionalCharges.filter(Boolean).length > 0 && (
//                         <div className="cdp-section">
//                             <h2 className="cdp-section-title">Optional</h2>
//                             {course.optionalCharges.filter(Boolean).map((p, i) => (
//                                 <p key={i} className="cdp-section-text">{p}</p>
//                             ))}
//                         </div>
//                     )}

//                     {/* ═══════════════════════════════════════
//                         ACCORDION SECTIONS (collapsible)
//                     ═══════════════════════════════════════ */}


//                     {/* WHY CHOOSE SafeTricks */}
//                     <AccordionCard title="Why choose SafeTricks">
//                         <div className="cdp-trust-grid">
//                             {[
//                                 { icon: "⭐", title: googleReviewsTrustTitle },
//                                 { icon: "🏛", title: "SafeWork NSW Approved Provider" },
//                                 { icon: "📜", title: "Certificate Issued Same Day" },
//                                 { icon: "📅", title: "Sunday Sessions Available" },
//                                 { icon: "💰", title: "All-Inclusive Pricing — No Hidden Fees" },
//                                 { icon: "📍", title: "Easy Location with Free Parking" },
//                             ].map((b, i) => (
//                                 <div className="cdp-trust-badge" key={i}>
//                                     <span className="cdp-tb-icon">{b.icon}</span>
//                                     <span className="cdp-tb-title">{b.title}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </AccordionCard>

//                     {/* WHAT STUDENTS SAY */}
//                     <AccordionCard title="What students say">
//                         <div className="cdp-rating-bar">
//                             <div className="cdp-rating-num">{Number(placeRating).toFixed(1)}</div>
//                             <div>
//                                 <div className="cdp-stars">★★★★★</div>
//                                 <div className="cdp-rating-count">{reviewCountLabel}</div>
//                                 <div className="cdp-rating-site">safetricks.com.au</div>
//                             </div>
//                         </div>
//                         <div className="cdp-review-grid">
//                             {courseReviews.map((r, i) => (
//                                 <div className="cdp-review-card" key={i}>
//                                     <div className="cdp-rc-name">{r.name}</div>
//                                     <div className="cdp-rc-course">{r.course}</div>
//                                     <div className="cdp-stars" style={{ fontSize: "13px", marginBottom: "6px" }}>★★★★★</div>
//                                     <div className="cdp-rc-text">"{r.text}"</div>
//                                 </div>
//                             ))}
//                         </div>
//                     </AccordionCard>

//                 </div>


//                 {/* SIDEBAR */}
//                 <div className="cdp-sidebar">

//                     <SidebarPriceCard />

//                     {/* Handbook Cards (Sidebar - Only show striped card if NO large cardImage exists) */}
//                     {(() => {
//                         if (course.handbook?.cardImage) return null; // Hide striped card if large image exists

//                         const finalUrl = (() => {
//                             let hUrl = course.handbook?.url || course.handbook?.pdf;
//                             if (!hUrl) return null;
//                             let clean = hUrl.replace(/^https?:\/\//, "").replace(/^\/+/, "");
//                             return `https://${clean}`;
//                         })();

//                         if (!finalUrl) return null;

//                         return (
//                             <div
//                                 onClick={() => handleViewPDF(course.handbook?.url || course.handbook?.pdf)}
//                                 style={{ cursor: 'pointer' }}
//                                 className="cdp-hb-card"
//                             >
//                                 <div className="cdp-hb-inner">
//                                     <img src={logo} alt="SafeTricks Logo" className="cdp-hb-logo" />
//                                     <h3 className="cdp-hb-title">{course.handbook?.title || "CODE OF PRACTICE"}</h3>
//                                     <div className="cdp-hb-subtitle">Click to download the {course.handbook?.title || "CODE OF PRACTICE"} [PDF]</div>
//                                 </div>
//                             </div>
//                         );
//                     })()}

//                     <div
//                         onClick={() => handleViewPDF("/resources/participant-handbook.pdf")}
//                         style={{ cursor: 'pointer' }}
//                         className="cdp-hb-card"
//                     >
//                         <div className="cdp-hb-inner">
//                             <img src={logo} alt="SafeTricks Logo" className="cdp-hb-logo" />
//                             <h3 className="cdp-hb-title">Participant Handbook</h3>
//                             <div className="cdp-hb-subtitle">Click to download the Participant Handbook [PDF]</div>
//                         </div>
//                     </div>


//                     {relatedCourses.length > 0 && (
//                         <div className="cdp-sb-card">
//                             <div className="cdp-sb-title">Course of Practice</div>
//                             <div className="cdp-marquee-wrapper">
//                                 <div className="cdp-marquee-track">
//                                     {[...relatedCourses, ...relatedCourses, ...relatedCourses].map((c, i) => (
//                                         <div
//                                             className="cdp-marquee-item"
//                                             key={i}
//                                             onClick={() => window.location.href = `/course/${c.slug}`}
//                                         >
//                                             <span className="cdp-marquee-icon">📋</span>
//                                             <div>
//                                                 <div className="cdp-marquee-name">{c.title}</div>
//                                                 <div className="cdp-marquee-price">From ${c.sellingPrice || c.withoutExperiencePrice || c.withExperiencePrice || c.slSinglePrice || c.slblPrice || 0}</div>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     <div className="cdp-sb-card cdp-sb-card--dark">
//                         <div className="cdp-sb-title cdp-sb-title--light">Need help?</div>
//                         <p className="cdp-sb-help-text">
//                             Our team can answer questions about course suitability, dates, and group bookings.
//                         </p>
//                         <a href={ORG_PHONE_1300.tel} className="cdp-sb-btn-cyan">☎ {ORG_PHONE_1300.display}</a>
//                         <a href="mailto:info@safetricks.com.au" className="cdp-sb-btn-ghost">✉ Email us</a>
//                         <div className="cdp-sb-email">info@safetricks.com.au</div>
//                     </div>

//                 </div>
//             </div>

//             {/* ── STICKY BOTTOM BAR ── */}
//             <div className="cdp-sticky">
//                 <div className="cdp-sticky-info">
//                     <div>
//                         <div className="cdp-sticky-name">{course?.title}</div>
//                         <div className="cdp-sticky-facts">
//                             📅 {course?.duration} &nbsp;·&nbsp;
//                             📍 {course?.location} &nbsp;·&nbsp;
//                             🎓 
//                         </div>
//                     </div>
//                     <div className="cdp-sticky-price">
//                         {isSlbl
//                             ? `From $${fromPrice}`
//                             : isExperience
//                                 ? `From $${course.withExperiencePrice}`
//                                 : `$${sellingPrice}`
//                         }
//                     </div>
//                 </div>
//                 <div className="cdp-sticky-btns">
//                     {isSlbl ? (
//                         <>
//                             <button
//                                 className="cdp-sticky-book"
//                                 onClick={() => openBooking("sl", true)}
//                             >
//                                 SL — ${slVariant?.price ?? 0}
//                             </button>
//                             <button
//                                 className="cdp-sticky-book cdp-sticky-book--dark"
//                                 onClick={() => openBooking("slbl", true)}
//                             >
//                                 SL+BL — ${slblVariant?.price ?? 0}
//                             </button>
//                         </>
//                     ) : (
//                         <button
//                             className="cdp-sticky-book"
//                             onClick={() => openBooking()}
//                         >
//                             Book Now — Pick a Date
//                         </button>
//                     )}
//                 </div>
//             </div>

//             <Footer courses={courses} />
//             {showModal && (
//                 <BookingModal
//                     course={course}
//                     onClose={() => {
//                         setShowModal(false)
//                         setSelectedOptionId(null)
//                     }}
//                     initialSelection={selectedOptionId}
//                     extraQueryParams={fromPortal ? "fromPortal=true" : ""}
//                 />
//             )}
//         </div>
//     )
// }

// export default CourseDetails

import { colors } from '../constants/theme';
// import { useParams } from "react-router-dom"
// import { useEffect, useState, useRef, useMemo } from "react"
// import axios from "axios"
// import "../styles/CourseDetails.css"
// import PublicNavbar from "../components/PublicNavbar"
// import Footer from "../components/landingPage/Footer"
// import ViewCourseDetailMobile from "../components/mobile/components/ViewCourseDetailMobile"
// import { API_URL } from "../data/service"
// import { ACTIVE_COURSES_URL, isActiveCourse } from "../utils/courseStatus"
// import { useNavigate, useLocation } from "react-router-dom"
// import { cdnImage } from "../utils/cdnImage"
// import { ORG_PHONE_1300 } from "../utils/organizationPhones"
// import {
//     getCoursePricingType,
//     getCourseVariants,
//     getCoursePriceNumber,
// } from "../utils/coursePrice"
// import BookingModal from "../components/course/BookingModal"
// import logo from "../assets/staLogo.png"
// import PdfViewer from '../components/common/PdfViewer';
// import { useGoogleReviews, shortAuthorName, getReviewDisplayText, GOOGLE_REVIEWS_MAX } from "../hooks/useGoogleReviews"
// import { FALLBACK_COURSE_REVIEWS } from "../data/reviewsFallback"

// function chunkArray(arr, size) {
//     if (!arr) return []
//     const res = []
//     for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size))
//     return res
// }

// function useIsMobile(breakpoint = 768) {
//     const [isMobile, setIsMobile] = useState(
//         () => window.innerWidth <= breakpoint
//     )
//     useEffect(() => {
//         const handler = () => setIsMobile(window.innerWidth <= breakpoint)
//         window.addEventListener("resize", handler)
//         return () => window.removeEventListener("resize", handler)
//     }, [breakpoint])
//     return isMobile
// }

// function CourseDetails() {
//     const navigate = useNavigate()
//     const location = useLocation()
//     const searchParams = new URLSearchParams(location.search)
//     const fromPortal = searchParams.get("fromPortal") === "true"
//     // Route is /course/:slug. We support a legacy fallback where the param
//     // still ends with -<ObjectId> (LegacyCourseRedirect rewrites the URL,
//     // but the redirect runs in an effect so the first render still has the
//     // raw param — handle both shapes here).
//     const { slug } = useParams()
//     const legacyMatch = slug?.match(/^[a-z0-9-]+-([a-f0-9]{24})$/i)
//     const fetchSlug = legacyMatch ? slug.replace(`-${legacyMatch[1]}`, "") : slug
//     const fallbackId = legacyMatch ? legacyMatch[1] : null

//     const [course, setCourse] = useState(null)
//     const [courseUnavailable, setCourseUnavailable] = useState(false)
//     const [courses, setCourses] = useState([])
//     const [sessions, setSessions] = useState([])
//     const [loadingSessions, setLoadingSessions] = useState(true)
//     const [showAllSessions, setShowAllSessions] = useState(false)
//     const [showModal, setShowModal] = useState(false)
//     const [selectedOptionId, setSelectedOptionId] = useState(null)
//     const swipeRef = useRef(null)
//     const isMobile = useIsMobile()
//     const {
//         reviews: apiReviews,
//         reviewCountLabel,
//         reviewCountFormatted,
//         placeRating,
//     } = useGoogleReviews()

//     const googleReviewsTrustTitle = `${reviewCountFormatted} Five-Star Google Reviews`

//     const courseReviews = useMemo(() => {
//         if (!apiReviews.length) return FALLBACK_COURSE_REVIEWS
//         return apiReviews.slice(0, GOOGLE_REVIEWS_MAX).map((r) => ({
//             name: shortAuthorName(r.name),
//             course: r.relativeTime || "Google Review",
//             text: getReviewDisplayText(r),
//         }))
//     }, [apiReviews])

//     const handleViewPDF = (pdfUrl) => {
//         if (!pdfUrl) return;
//         let fixedUrl = pdfUrl;
//         if (pdfUrl.includes("res.cloudinary.com")) {
//             // Remove any existing fl_attachment flag first
//             fixedUrl = pdfUrl.replace(/\/fl_attachment[^/]*\//g, "/");
//             // For raw uploads: add fl_attachment:false so browser displays inline instead of downloading
//             if (fixedUrl.includes("/raw/upload/")) {
//                 fixedUrl = fixedUrl.replace("/raw/upload/", "/raw/upload/fl_attachment:false/");
//             }
//             if (!fixedUrl.startsWith("http")) fixedUrl = `https://${fixedUrl.replace(/^\/+/, "")}`;
//         } else if (!pdfUrl.startsWith("http")) {
//             fixedUrl = `${API_URL}/${pdfUrl}`;
//         }
//         window.open(fixedUrl, "_blank");
//     };

//     useEffect(() => {
//         if (!fetchSlug && !fallbackId) return
//         // Primary: slug lookup. Falls back to id lookup only if a legacy
//         // URL slipped past the redirect (e.g. server-rendered link cached
//         // before the redirect mounted).
//         const url = fetchSlug
//             ? `${API_URL}/api/courses/slug/${encodeURIComponent(fetchSlug)}`
//             : `${API_URL}/api/courses/${fallbackId}`

//         setCourseUnavailable(false)
//         setCourse(null)

//         const applyCourse = (data) => {
//             if (!isActiveCourse(data)) {
//                 setCourseUnavailable(true)
//                 return
//             }
//             setCourse(data)
//         }

//         axios.get(url)
//             .then(res => applyCourse(res.data))
//             .catch(err => {
//                 if (fetchSlug && fallbackId) {
//                     axios.get(`${API_URL}/api/courses/${fallbackId}`)
//                         .then(r => applyCourse(r.data))
//                         .catch(() => setCourseUnavailable(true))
//                 } else {
//                     setCourseUnavailable(true)
//                     console.error("Course fetch error:", err)
//                 }
//             })

//         axios.get(ACTIVE_COURSES_URL(API_URL))
//             .then(res => setCourses(res.data))
//             .catch(err => console.error("Courses fetch error:", err))
//     }, [fetchSlug, fallbackId])

//     useEffect(() => {
//         if (!course?._id) return
//         setLoadingSessions(true)
//         axios.get(`${API_URL}/api/schedules/course/${course._id}`)
//             .then(res => {
//                 const rows = []
//                 res.data.forEach(sched => {
//                     sched.sessions
//                         .filter(s => s.status === "Active")
//                         .forEach(s => {
//                             rows.push({
//                                 id: s._id,
//                                 scheduleId: sched._id,
//                                 date: sched.date,
//                                 startTime: s.startTime,
//                                 endTime: s.endTime,
//                                 location: s.location || course.location || "NSW",
//                                 availableSlots: s.availableSlots
//                             })
//                         })
//                 })
//                 rows.sort((a, b) => new Date(a.date) - new Date(b.date))
//                 setSessions(rows)
//             })
//             .catch(err => console.error("Session fetch error:", err))
//             .finally(() => setLoadingSessions(false))
//     }, [course?._id])

//     useEffect(() => {
//         if (!course) return

//         const defaultTitle = "SafeTricks | Sydney NSW"
//         const defaultDesc =
//             "SafeTricks — RTO 45234. Forklift, White Card, EWP, Working at Heights, Confined Space and more. Sydney NSW."

//         const prevTitle = document.title
//         const metaEl = document.querySelector('meta[name="description"]')
//         const prevDesc = metaEl?.getAttribute("content") ?? defaultDesc

//         const pageTitle = course.metaTitle?.trim() || course.title?.trim()
//         document.title = pageTitle || defaultTitle

//         const pageDesc =
//             course.metaDescription?.trim() ||
//             (Array.isArray(course.description) ? course.description[0] : course.description)?.trim()
//         if (pageDesc && metaEl) metaEl.setAttribute("content", pageDesc)

//         return () => {
//             document.title = prevTitle
//             if (metaEl) metaEl.setAttribute("content", prevDesc)
//         }
//     }, [course])

//     if (isMobile) {
//         return <ViewCourseDetailMobile course={course} courses={courses} fromPortal={fromPortal} />
//     }

//     if (courseUnavailable) {
//         return (
//             <section>
//                 <PublicNavbar courses={courses} />
//                 <div className="cdp-loading" style={{ padding: "4rem 2rem", textAlign: "center" }}>
//                     <h2>Course not available</h2>
//                     <p style={{ marginTop: "1rem", color: colors.textFaint }}>
//                         This course is no longer offered. Browse our current courses below.
//                     </p>
//                     <button
//                         type="button"
//                         style={{ marginTop: "1.5rem" }}
//                         onClick={() => navigate("/all-courses")}
//                     >
//                         View all courses
//                     </button>
//                 </div>
//                 <Footer />
//             </section>
//         )
//     }

//     if (!course) {
//         return (
//             <div className="cdp-loading">
//                 <PublicNavbar courses={courses} />
//             </div>
//         )
//     }

//     const originalPrice = course?.originalPrice || 0
//     const sellingPrice = course?.sellingPrice || 0
//     const savings = originalPrice - sellingPrice

//     const bypassKeywords = ["excavator", "haul truck", "skid steer"]
//     const isBypass = bypassKeywords.some(kw => course?.title?.toLowerCase().includes(kw))
//     const pricingType = getCoursePricingType(course)
//     const variants = getCourseVariants(course)
//     const isSlbl = pricingType === "slbl"
//     const isExperience = (pricingType === "experience" || isBypass) && !isSlbl
//     const slVariant = variants.find((v) => v.key === "sl")
//     const slblVariant = variants.find((v) => v.key === "slbl")
//     const fromPrice = getCoursePriceNumber(course)

//     const relatedCourses = courses
//         .filter(c => c._id !== course._id)

//     const openBooking = (type, forceSkipModal = false) => {
//         if ((isExperience || isSlbl) && !forceSkipModal) {
//             setSelectedOptionId(type || null)
//             setShowModal(true)
//         } else {
//             const query = fromPortal ? "?fromPortal=true" : ""
//             const typeParam = type ? `${query ? "&" : "?"}type=${type}` : ""
//             navigate(`/book-now/course/${course.slug}${query}${typeParam}`)
//         }
//     }

//     // ── Hero price card ────────────────────────────────────────────────────
//     const HeroPriceCard = () => (
//         <div className="cdp-price-card">

//             {isSlbl && (
//                 <>
//                     <div className="cdp-pc-slbl-row">
//                         <div className="cdp-pc-exp-block">
//                             <p className="cdp-pc-slbl-label">Single License (SL or BL)</p>
//                             <span className="cdp-price-now">${slVariant?.price ?? 0}</span>
//                             {slVariant?.original && slVariant.original > slVariant.price && (
//                                 <span className="cdp-price-old">${slVariant.original}</span>
//                             )}
//                         </div>
//                         <div className="cdp-pc-exp-block">
//                             <p className="cdp-pc-slbl-label">Both Licenses (SL + BL)</p>
//                             <span className="cdp-price-now">${slblVariant?.price ?? 0}</span>
//                             {slblVariant?.original && slblVariant.original > slblVariant.price && (
//                                 <span className="cdp-price-old">${slblVariant.original}</span>
//                             )}
//                         </div>
//                     </div>
//                     <p className="cdp-price-note">
//                         All inclusive — no hidden fees · SafeWork NSW card fee included
//                     </p>
//                     <div className="cdp-exp-btns">
//                         <button
//                             className="cdp-btn-book cdp-btn-exp-with"
//                             onClick={() => openBooking("sl", true)}
//                         >
//                             ${slVariant?.price ?? 0} &nbsp; Book {slVariant?.label || "SL or BL"}
//                         </button>
//                         <button
//                             className="cdp-btn-book cdp-btn-slbl"
//                             onClick={() => openBooking("slbl", true)}
//                         >
//                             ${slblVariant?.price ?? 0} &nbsp; Book {slblVariant?.label || "SL + BL"}
//                         </button>
//                     </div>
//                 </>
//             )}

//             {isExperience && (
//                 <>
//                     <div className="cdp-price-row">
//                         <span className="cdp-price-now">${course.withExperiencePrice}</span>
//                         {course.withExperienceOriginal && (
//                             <span className="cdp-price-old">${course.withExperienceOriginal}</span>
//                         )}
//                         {(course.withExperienceOriginal || originalPrice) > course.withExperiencePrice && (
//                             <span className="cdp-save-badge">Save ${(course.withExperienceOriginal || originalPrice) - course.withExperiencePrice}</span>
//                         )}
//                     </div>
//                     <p className="cdp-price-note">
//                         All inclusive — no hidden fees · SafeWork NSW card fee included
//                     </p>
//                     <div className="cdp-exp-btns">
//                         <button
//                             className="cdp-btn-book cdp-btn-exp-with"
//                             onClick={() => openBooking("with-experience", true)}
//                         >
//                             ${course.withExperiencePrice} &nbsp; Book With Experience
//                         </button>
//                         <button
//                             className="cdp-btn-book cdp-btn-exp-without"
//                             onClick={() => openBooking("without-experience", true)}
//                         >
//                             ${course.withoutExperiencePrice} &nbsp; Book Without Experience
//                         </button>
//                     </div>
//                 </>
//             )}

//             {/* STANDARD */}
//             {!isSlbl && !isExperience && (
//                 <>
//                     <div className="cdp-price-row">
//                         <span className="cdp-price-now">${sellingPrice}</span>
//                         {originalPrice > sellingPrice && (
//                             <span className="cdp-price-old">${originalPrice}</span>
//                         )}
//                         {savings > 0 && (
//                             <span className="cdp-save-badge">Save ${savings}</span>
//                         )}
//                     </div>
//                     <p className="cdp-price-note">
//                         All inclusive — no hidden fees · SafeWork NSW card fee included
//                     </p>
//                     <button
//                         className="cdp-btn-book"
//                         onClick={() => openBooking(null, true)}
//                     >
//                         Book Now — Pick a Date
//                     </button>
//                 </>
//             )}

//             <button className="cdp-btn-voc" onClick={() => navigate(`/voc?courseId=${course._id}${fromPortal ? "&fromPortal=true" : ""}`)}>
//                 Already Trained? Book VOC
//             </button>
//             <ul className="cdp-trust-list">
//                 <li><span className="cdp-check">✓</span> Certificate issued same day</li>
//                 <li><span className="cdp-check">✓</span> Sunday sessions available</li>
//                 <li><span className="cdp-check">✓</span> SafeWork NSW approved RTO</li>
//                 <li><span className="cdp-check">✓</span> {reviewCountFormatted} five-star Google reviews</li>
//             </ul>
//         </div>
//     )

//     // ── Sidebar price card ─────────────────────────────────────────────────
//     const SidebarPriceCard = () => (
//         <div className="cdp-sb-card">
//             <div className="cdp-sb-title">Enrol in this course</div>

//             {/* SLBL */}
//             {isSlbl && (
//                 <>
//                     <div className="cdp-sb-exp-row">
//                         <span className="cdp-sb-exp-label">Single License (SL or BL)</span>
//                         <span className="cdp-sb-price">${slVariant?.price ?? 0}</span>
//                     </div>
//                     <div className="cdp-sb-exp-row">
//                         <span className="cdp-sb-exp-label">Both Licenses (SL + BL)</span>
//                         <span className="cdp-sb-price">${slblVariant?.price ?? 0}</span>
//                     </div>
//                     <div className="cdp-sb-note">All inclusive · SafeWork NSW card fee included</div>
//                     <button
//                         className="cdp-sb-btn-exp-with"
//                         onClick={() => openBooking("sl", true)}
//                     >
//                         ${slVariant?.price ?? 0} &nbsp; Book {slVariant?.label || "SL or BL"}
//                     </button>
//                     <button
//                         className="cdp-sb-btn-slbl"
//                         onClick={() => openBooking("slbl", true)}
//                     >
//                         ${slblVariant?.price ?? 0} &nbsp; Book {slblVariant?.label || "SL + BL"}
//                     </button>
//                 </>
//             )}

//             {/* EXPERIENCE */}
//             {isExperience && (
//                 <>
//                     <div className="cdp-sb-exp-row">
//                         <span className="cdp-sb-exp-label">With experience</span>
//                         <span className="cdp-sb-price">${course.withExperiencePrice}</span>
//                     </div>
//                     <div className="cdp-sb-exp-row">
//                         <span className="cdp-sb-exp-label">Without experience</span>
//                         <span className="cdp-sb-price">${course.withoutExperiencePrice}</span>
//                     </div>
//                     <div className="cdp-sb-note">All inclusive · SafeWork NSW card fee included</div>
//                     <button
//                         className="cdp-sb-btn-exp-with"
//                         onClick={() => openBooking("with-experience")}
//                     >
//                         ${course.withExperiencePrice} &nbsp; Book With Experience
//                     </button>
//                     <button
//                         className="cdp-sb-btn-exp-without"
//                         onClick={() => openBooking("without-experience")}
//                     >
//                         ${course.withoutExperiencePrice} &nbsp; Book Without Experience
//                     </button>
//                 </>
//             )}

//             {/* STANDARD */}
//             {!isSlbl && !isExperience && (
//                 <>
//                     <div className="cdp-sb-price-row">
//                         <span className="cdp-sb-price">${sellingPrice}</span>
//                         {originalPrice > sellingPrice && (
//                             <span className="cdp-sb-orig">${originalPrice}</span>
//                         )}
//                     </div>
//                     <div className="cdp-sb-note">All inclusive · SafeWork NSW card fee included</div>
//                     <button
//                         className="cdp-sb-btn-main"
//                         onClick={() => openBooking()}
//                     >
//                         Book Now — Pick a Date
//                     </button>
//                 </>
//             )}

//             <button className="cdp-sb-btn-voc" onClick={() => navigate(`/voc?courseId=${course._id}${fromPortal ? "&fromPortal=true" : ""}`)}>
//                 Already Trained? Book VOC
//             </button>
//             <ul className="cdp-sb-mini-list">
//                 <li><span>✓</span> Certificate same day</li>
//                 <li><span>✓</span> Sunday sessions available</li>
//                 <li><span>✓</span> No prior experience required</li>
//                 <li><span>✓</span> Nationally valid in all states</li>
//             </ul>
//         </div>
//     )

//     return (
//         <div className="cdp">

//             <PublicNavbar courses={courses} />

//             {/* ── HERO ──
//                  Real <img> behind the overlay so the LCP image is preloaded
//                  with fetchpriority="high" instead of waiting for CSS to
//                  resolve a background-image URL.
//             */}
//             <div className="cdp-hero">
//                 {course?.image && (
//                     <img
//                         className="cdp-hero-bg"
//                         src={cdnImage(course.image, { w: 1600 })}
//                         alt={course?.title || ""}
//                         loading="eager"
//                         fetchpriority="high"
//                         decoding="async"
//                     />
//                 )}
//                 <div className="cdp-hero-inner">
//                     <div className="cdp-hero-left">
//                         <div className="cdp-tag">
//                             {course?.courseCode ? `${course.courseCode} — ` : ""}{course?.category}
//                         </div>
//                         <h1 className="cdp-title">{course?.title}</h1>
//                         <div className="cdp-code">
//                             {course?.courseCode} &nbsp;·&nbsp; Nationally Recognised Training
//                         </div>
//                         <p className="cdp-desc">
//                             {Array.isArray(course?.description)
//                                 ? course.description[0]
//                                 : course?.description || ""}
//                         </p>
//                     </div>

//                     <div className="cdp-hero-right">
//                         <HeroPriceCard />
//                     </div>
//                 </div>

//                 {/* ── QUICK FACTS BAR ── */}
//                 <div className="cdp-qfbar">
//                     {[
//                         { icon: "📅", val: course?.trainingDuration || "", label: "Course duration" },
//                         { icon: "⏰", val: "8:30am – 4:30pm", label: "Class hours" },
//                         { icon: "📍", val: course?.location || "Sefton NSW", label: "Training location" },
//                         { icon: "🎓", val: "", label: "Accredited provider" },
//                         { icon: "📜", val: "Same Day", label: "Certificate issued" },
//                         { icon: "🗺", val: "All States", label: "Nationally recognised" },
//                     ].map((item, i) => (
//                         <div className="cdp-qf-item" key={i}>
//                             <div className="cdp-qf-icon">{item.icon}</div>
//                             <div>
//                                 <div className="cdp-qf-val">{item.val}</div>
//                                 <div className="cdp-qf-label">{item.label}</div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {showModal && (
//                 <BookingModal
//                     course={course}
//                     onClose={() => {
//                         setShowModal(false)
//                         setSelectedOptionId(null)
//                     }}
//                     initialSelection={selectedOptionId}
//                     extraQueryParams={fromPortal ? "fromPortal=true" : ""}
//                 />
//             )}

//             {/* ── MAIN LAYOUT ── */}
//             <div className="cdp-main">

//                 <div className="cdp-content">

//                     <div className="cdp-card">
//                         <div className="cdp-card-title">Available dates &amp; locations</div>
//                         {loadingSessions ? (
//                             <div className="cdp-sessions-loading">Loading sessions...</div>
//                         ) : sessions.length === 0 ? (
//                             <p className="cdp-no-sessions">no dates available for booking</p>
//                         ) : (
//                             <>
//                                 {!showAllSessions ? (
//                                     <div className="cdp-sessions-list">
//                                                 {sessions.slice(0, 4).map((s, i) => {
//                                                     const d = new Date(s.date)
//                                                     const day = d.getDate()
//                                                     const mon = d.toLocaleString("en-AU", { month: "short" }).toUpperCase()
//                                                     const weekday = d.toLocaleString("en-AU", { weekday: "long" })
//                                                     const cleanLoc = (s.location || "").replace(/Face to Face/gi, "").replace(/Sefton/gi, "").replace(/Safton/gi, "Sefton").replace(/·\s*$/g, "").trim()

//                                                     // Urgency Logic
//                                                     const today = new Date();
//                                                     const diffTime = d - today;
//                                                     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//                                                     let spotLabel = "Seats Available";
//                                                     let spotClass = "";

//                                                     if (s.availableSlots <= 3) {
//                                                         spotLabel = "Filling Fast";
//                                                         spotClass = "cdp-s-spots--low";
//                                                     } else if (diffDays < 20 || s.availableSlots <= 10) {
//                                                         spotLabel = "Limited Seats";
//                                                         spotClass = "cdp-s-spots--medium";
//                                                     } else {
//                                                         spotLabel = "Seats Available";
//                                                         spotClass = ""; // Green by default
//                                                     }

//                                                     return (
//                                                         <div className="cdp-session-row" key={i}>
//                                                             <div className="cdp-s-date">
//                                                                 <div className="cdp-s-day">{day}</div>
//                                                                 <div className="cdp-s-mon">{mon}</div>
//                                                             </div>
//                                                             <div className="cdp-s-info">
//                                                                 <div className="cdp-s-title">{weekday}</div>
//                                                                 <div className="cdp-s-meta">
//                                                                     {s.startTime} – {s.endTime}
//                                                                 </div>
//                                                             </div>
//                                                             <div className="cdp-s-meta-desktop">
//                                                                 {cleanLoc}
//                                                             </div>
//                                                             <div className={`cdp-s-spots ${spotClass}`}>
//                                                                 {spotLabel}
//                                                             </div>
//                                                     <button
//                                                         className="cdp-s-btn"
//                                                         onClick={() => navigate(`/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${fromPortal ? "&fromPortal=true" : ""}`)}
//                                                     >
//                                                         Book
//                                                     </button>
//                                                 </div>
//                                             )
//                                         })}
//                                     </div>
//                                 ) : (
//                                     <div className="cdp-sessions-expanded">
//                                         {chunkArray(sessions, 7).map((page, pIdx) => (
//                                             <div key={pIdx} className="cdp-expanded-page">
//                                                 {page.map((s, i) => {
//                                                     const d = new Date(s.date)
//                                                     const day = d.getDate()
//                                                     const mon = d.toLocaleString("en-AU", { month: "short" }).toUpperCase()
//                                                     const weekday = d.toLocaleString("en-AU", { weekday: "long" })
//                                                     const cleanLoc = (s.location || "").replace(/Face to Face/gi, "").replace(/Sefton/gi, "").replace(/Safton/gi, "Sefton").replace(/·\s*$/g, "").trim()
//                                                     const cleanTime = (s.startTime || "").replace(/Face to Face/gi, "").trim()

//                                                     // Urgency Logic
//                                                     const today = new Date();
//                                                     const diffTime = d - today;
//                                                     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//                                                     let spotLabel = "Seats Available";
//                                                     let spotClass = "";

//                                                     if (s.availableSlots <= 3) {
//                                                         spotLabel = "Filling Fast";
//                                                         spotClass = "cdp-s-spots--low";
//                                                     } else if (diffDays < 20 || s.availableSlots <= 10) {
//                                                         spotLabel = "Limited Seats";
//                                                         spotClass = "cdp-s-spots--medium";
//                                                     } else {
//                                                         spotLabel = "Seats Available";
//                                                         spotClass = ""; // Green by default
//                                                     }

//                                                     return (
//                                                         <div className="cdp-session-row expanded" key={i}>
//                                                             <div className="cdp-s-date">
//                                                                 <div className="cdp-s-day">{day}</div>
//                                                                 <div className="cdp-s-mon">{mon}</div>
//                                                             </div>
//                                                             <div className="cdp-s-info">
//                                                                 <div className="cdp-s-title">{weekday} — Full day</div>
//                                                                 <div className="cdp-s-meta">
//                                                                     {cleanTime} – {s.endTime} &nbsp;·&nbsp; {cleanLoc}
//                                                                 </div>
//                                                             </div>
//                                                             <div className={`cdp-s-spots ${spotClass}`}>
//                                                                 {spotLabel}
//                                                             </div>
//                                                             <button
//                                                                 className="cdp-s-btn"
//                                                                 onClick={() => navigate(`/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${fromPortal ? "&fromPortal=true" : ""}`)}
//                                                             >
//                                                                 Book
//                                                             </button>
//                                                         </div>
//                                                     )
//                                                 })}
//                                                 <div className="cdp-page-indicator">
//                                                     {pIdx + 1} / {Math.ceil(sessions.length / 7)}
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                                 {sessions.length > 4 && (
//                                     <button
//                                         className="cdp-see-all-btn"
//                                         onClick={() => setShowAllSessions(!showAllSessions)}
//                                     >
//                                         {showAllSessions ? "See less" : `See all sessions`}
//                                     </button>
//                                 )}
//                             </>
//                         )}
//                     </div>

//                     <div className="cdp-card">
//                         <div className="cdp-card-title">
//                             About this course
//                         </div>
//                         <div className="cdp-card-body">
//                             {Array.isArray(course?.trainingOverview) && course.trainingOverview.filter(Boolean).length > 0
//                                 ? course.trainingOverview.filter(Boolean).map((p, i) => <p key={i}>{p}</p>)
//                                 : <p>This nationally recognised qualification is issued by a SafeWork NSW approved Registered Training Organisation and is valid in all Australian states and territories.</p>
//                             }
//                         </div>
//                     </div>


//                     {Array.isArray(course?.outcomePoints) && course.outcomePoints.filter(Boolean).length > 0 && (
//                         <div className="cdp-card">
//                             <div className="cdp-card-title">What you will learn</div>
//                             <ul className="cdp-checklist">
//                                 {course.outcomePoints.filter(Boolean).map((item, i) => (
//                                     <li key={i}><span className="cdp-check-circle">✓</span>{item}</li>
//                                 ))}
//                             </ul>
//                         </div>
//                     )}

//                     {Array.isArray(course?.requirements) && course.requirements.filter(Boolean).length > 0 && (
//                         <div className="cdp-card">
//                             <div className="cdp-card-title">Entry requirements</div>
//                             <ul className="cdp-checklist">
//                                 {course.requirements.filter(Boolean).map((item, i) => (
//                                     <li key={i}><span className="cdp-check-circle">✓</span>{item}</li>
//                                 ))}
//                             </ul>
//                         </div>
//                     )}

//                     {Array.isArray(course?.feesCharges) && course.feesCharges.filter(Boolean).length > 0 && (
//                         <div className="cdp-card">
//                             <div className="cdp-card-title">Fees &amp; Charges</div>
//                             <ul className="cdp-checklist">
//                                 {course.feesCharges.filter(Boolean).map((item, i) => (
//                                     <li key={i}><span className="cdp-check-circle">✓</span>{item}</li>
//                                 ))}
//                             </ul>
//                         </div>
//                     )}

//                     <div className="cdp-card">
//                         <div className="cdp-card-title">Why choose SafeTricks</div>
//                         <div className="cdp-trust-grid">
//                             {[
//                                 { icon: "⭐", title: googleReviewsTrustTitle },
//                                 { icon: "🏛", title: "SafeWork NSW Approved Provider" },
//                                 { icon: "📜", title: "Certificate Issued Same Day" },
//                                 { icon: "📅", title: "Sunday Sessions Available" },
//                                 { icon: "💰", title: "All-Inclusive Pricing — No Hidden Fees" },
//                                 { icon: "📍", title: "Easy Location with Free Parking" },
//                             ].map((b, i) => (
//                                 <div className="cdp-trust-badge" key={i}>
//                                     <span className="cdp-tb-icon">{b.icon}</span>
//                                     <span className="cdp-tb-title">{b.title}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <div className="cdp-card">
//                         <div className="cdp-card-title">What students say</div>
//                         <div className="cdp-rating-bar">
//                             <div className="cdp-rating-num">{Number(placeRating).toFixed(1)}</div>
//                             <div>
//                                 <div className="cdp-stars">★★★★★</div>
//                                 <div className="cdp-rating-count">{reviewCountLabel}</div>
//                                 <div className="cdp-rating-site">safetricks.com.au</div>
//                             </div>
//                         </div>
//                         <div className="cdp-review-grid">
//                             {courseReviews.map((r, i) => (
//                                 <div className="cdp-review-card" key={i}>
//                                     <div className="cdp-rc-name">{r.name}</div>
//                                     <div className="cdp-rc-course">{r.course}</div>
//                                     <div className="cdp-stars" style={{ fontSize: "13px", marginBottom: "6px" }}>★★★★★</div>
//                                     <div className="cdp-rc-text">"{r.text}"</div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                 </div>

//                 {/* SIDEBAR */}
//                 <div className="cdp-sidebar">

//                     <SidebarPriceCard />

//                     {/* Handbook Cards (Sidebar - Only show striped card if NO large cardImage exists) */}
//                     {(() => {
//                         if (course.handbook?.cardImage) return null; // Hide striped card if large image exists

//                         const finalUrl = (() => {
//                             let hUrl = course.handbook?.url || course.handbook?.pdf;
//                             if (!hUrl) return null;
//                             let clean = hUrl.replace(/^https?:\/\//, "").replace(/^\/+/, "");
//                             return `https://${clean}`;
//                         })();

//                         if (!finalUrl) return null;

//                         return (
//                             <div
//                                 onClick={() => handleViewPDF(course.handbook?.url || course.handbook?.pdf)}
//                                 style={{ cursor: 'pointer' }}
//                                 className="cdp-hb-card"
//                             >
//                                 <div className="cdp-hb-inner">
//                                     <img src={logo} alt="SafeTricks Logo" className="cdp-hb-logo" />
//                                     <h3 className="cdp-hb-title">{course.handbook?.title || "CODE OF PRACTICE"}</h3>
//                                     <div className="cdp-hb-subtitle">Click to download the {course.handbook?.title || "CODE OF PRACTICE"} [PDF]</div>
//                                 </div>
//                             </div>
//                         );
//                     })()}

//                     <div
//                         onClick={() => handleViewPDF("/resources/participant-handbook.pdf")}
//                         style={{ cursor: 'pointer' }}
//                         className="cdp-hb-card"
//                     >
//                         <div className="cdp-hb-inner">
//                             <img src={logo} alt="SafeTricks Logo" className="cdp-hb-logo" />
//                             <h3 className="cdp-hb-title">Participant Handbook</h3>
//                             <div className="cdp-hb-subtitle">Click to download the Participant Handbook [PDF]</div>
//                         </div>
//                     </div>


//                     {relatedCourses.length > 0 && (
//                         <div className="cdp-sb-card">
//                             <div className="cdp-sb-title">Course of Practice</div>
//                             <div className="cdp-marquee-wrapper">
//                                 <div className="cdp-marquee-track">
//                                     {[...relatedCourses, ...relatedCourses, ...relatedCourses].map((c, i) => (
//                                         <div
//                                             className="cdp-marquee-item"
//                                             key={i}
//                                             onClick={() => window.location.href = `/course/${c.slug}`}
//                                         >
//                                             <span className="cdp-marquee-icon">📋</span>
//                                             <div>
//                                                 <div className="cdp-marquee-name">{c.title}</div>
//                                                 <div className="cdp-marquee-price">From ${c.sellingPrice || c.withoutExperiencePrice || c.withExperiencePrice || c.slSinglePrice || c.slblPrice || 0}</div>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     <div className="cdp-sb-card cdp-sb-card--dark">
//                         <div className="cdp-sb-title cdp-sb-title--light">Need help?</div>
//                         <p className="cdp-sb-help-text">
//                             Our team can answer questions about course suitability, dates, and group bookings.
//                         </p>
//                         <a href={ORG_PHONE_1300.tel} className="cdp-sb-btn-cyan">☎ {ORG_PHONE_1300.display}</a>
//                         <a href="mailto:info@safetricks.com.au" className="cdp-sb-btn-ghost">✉ Email us</a>
//                         <div className="cdp-sb-email">info@safetricks.com.au</div>
//                     </div>

//                 </div>
//             </div>

//             {/* ── STICKY BOTTOM BAR ── */}
//             <div className="cdp-sticky">
//                 <div className="cdp-sticky-info">
//                     <div>
//                         <div className="cdp-sticky-name">{course?.title}</div>
//                         <div className="cdp-sticky-facts">
//                             📅 {course?.duration} &nbsp;·&nbsp;
//                             📍 {course?.location} &nbsp;·&nbsp;
//                             🎓 
//                         </div>
//                     </div>
//                     <div className="cdp-sticky-price">
//                         {isSlbl
//                             ? `From $${fromPrice}`
//                             : isExperience
//                                 ? `From $${course.withExperiencePrice}`
//                                 : `$${sellingPrice}`
//                         }
//                     </div>
//                 </div>
//                 <div className="cdp-sticky-btns">
//                     {isSlbl ? (
//                         <>
//                             <button
//                                 className="cdp-sticky-book"
//                                 onClick={() => openBooking("sl", true)}
//                             >
//                                 SL — ${slVariant?.price ?? 0}
//                             </button>
//                             <button
//                                 className="cdp-sticky-book cdp-sticky-book--dark"
//                                 onClick={() => openBooking("slbl", true)}
//                             >
//                                 SL+BL — ${slblVariant?.price ?? 0}
//                             </button>
//                         </>
//                     ) : (
//                         <button
//                             className="cdp-sticky-book"
//                             onClick={() => openBooking()}
//                         >
//                             Book Now — Pick a Date
//                         </button>
//                     )}
//                 </div>
//             </div>

//             <Footer courses={courses} />
//             {showModal && (
//                 <BookingModal
//                     course={course}
//                     onClose={() => {
//                         setShowModal(false)
//                         setSelectedOptionId(null)
//                     }}
//                     initialSelection={selectedOptionId}
//                     extraQueryParams={fromPortal ? "fromPortal=true" : ""}
//                 />
//             )}
//         </div>
//     )
// }

// export default CourseDetails


import { useParams } from "react-router-dom"
import { useEffect, useState, useRef, useMemo } from "react"
import axios from "axios"
import "../styles/CourseDetails.css"
import PublicNavbar from "../components/PublicNavbar"
import Footer from "../components/landingPage/Footer"
import ViewCourseDetailMobile from "../components/mobile/components/ViewCourseDetailMobile"
import { API_URL } from "../data/service"
import { ACTIVE_COURSES_URL, isActiveCourse } from "../utils/courseStatus"
import { useNavigate, useLocation } from "react-router-dom"
import { cdnImage } from "../utils/cdnImage"
import { ORG_PHONE_1300 } from "../utils/organizationPhones"
import {
    getCoursePricingType,
    getCourseVariants,
    getCoursePriceNumber,
} from "../utils/coursePrice"
import BookingModal from "../components/course/BookingModal"
import logo from "../assets/staLogo.png"
import PdfViewer from '../components/common/PdfViewer';
import { ChevronDown } from "lucide-react"

// Collapsible "FAQ style" wrapper for the cards in the left/main column.
// Click the header to open or close — defaults to open so nothing important
// is hidden until the visitor chooses to tidy the page up.
function AccordionCard({ title, defaultOpen = true, children }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="cdp-card cdp-accordion">
            <button
                type="button"
                className="cdp-card-title cdp-accordion-toggle"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
            >
                <span>{title}</span>
                <ChevronDown
                    className={`cdp-accordion-chevron${open ? "" : " is-closed"}`}
                    size={18}
                    aria-hidden="true"
                />
            </button>
            <div className={`cdp-accordion-panel${open ? "" : " is-collapsed"}`}>
                <div className="cdp-accordion-panel-inner">
                    {children}
                </div>
            </div>
        </div>
    )
}

// Blue rounded tick icon — matches the screenshots exactly
// Outer ring (stroke) + filled inner circle + white checkmark
function BlueTick() {
    return (
        <span className="cdp-blue-tick" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* outer thin ring */}
                <circle cx="16" cy="16" r="14.5" stroke={colors.brandPrimary} strokeWidth="1.5" fill="none"/>
                {/* filled inner circle */}
                <circle cx="16" cy="16" r="11" fill={colors.brandPrimary}/>
                {/* white checkmark */}
                <path d="M10.5 16.5L14 20L21.5 12.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </span>
    )
}

function chunkArray(arr, size) {
    if (!arr) return []
    const res = []
    for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size))
    return res
}

function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(
        () => window.innerWidth <= breakpoint
    )
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= breakpoint)
        window.addEventListener("resize", handler)
        return () => window.removeEventListener("resize", handler)
    }, [breakpoint])
    return isMobile
}

function CourseDetails() {
    const navigate = useNavigate()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const fromPortal = searchParams.get("fromPortal") === "true"
    // Route is /course/:slug. We support a legacy fallback where the param
    // still ends with -<ObjectId> (LegacyCourseRedirect rewrites the URL,
    // but the redirect runs in an effect so the first render still has the
    // raw param — handle both shapes here).
    const { slug } = useParams()
    const legacyMatch = slug?.match(/^[a-z0-9-]+-([a-f0-9]{24})$/i)
    const fetchSlug = legacyMatch ? slug.replace(`-${legacyMatch[1]}`, "") : slug
    const fallbackId = legacyMatch ? legacyMatch[1] : null

    const [course, setCourse] = useState(null)
    const [courseUnavailable, setCourseUnavailable] = useState(false)
    const [courses, setCourses] = useState([])
    const [sessions, setSessions] = useState([])
    const [loadingSessions, setLoadingSessions] = useState(true)
    const [showAllSessions, setShowAllSessions] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [selectedOptionId, setSelectedOptionId] = useState(null)
    const swipeRef = useRef(null)
    const isMobile = useIsMobile()

    // const handleViewPDF = (pdfUrl) => {
    //     if (!pdfUrl) return;
    //     let fixedUrl = pdfUrl;
    //     if (pdfUrl.includes("res.cloudinary.com")) {
    //         // Remove any existing fl_attachment flag first
    //         fixedUrl = pdfUrl.replace(/\/fl_attachment[^/]*\//g, "/");
    //         // For raw uploads: add fl_attachment:false so browser displays inline instead of downloading
    //         if (fixedUrl.includes("/raw/upload/")) {
    //             fixedUrl = fixedUrl.replace("/raw/upload/", "/raw/upload/fl_attachment:false/");
    //         }
    //         if (!fixedUrl.startsWith("http")) fixedUrl = `https://${fixedUrl.replace(/^\/+/, "")}`;
    //     } else if (!pdfUrl.startsWith("http")) {
    //         fixedUrl = `${API_URL}/${pdfUrl}`;
    //     }
    //     window.open(fixedUrl, "_blank");
    // };
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
    // Open via Google Docs viewer — displays PDF inline, no download prompt
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fixedUrl)}&embedded=true`;
    window.open(googleViewerUrl, "_blank");
};
    useEffect(() => {
        if (!fetchSlug && !fallbackId) return
        // Primary: slug lookup. Falls back to id lookup only if a legacy
        // URL slipped past the redirect (e.g. server-rendered link cached
        // before the redirect mounted).
        const url = fetchSlug
            ? `${API_URL}/api/courses/slug/${encodeURIComponent(fetchSlug)}`
            : `${API_URL}/api/courses/${fallbackId}`

        setCourseUnavailable(false)
        setCourse(null)

        const applyCourse = (data) => {
            if (!isActiveCourse(data)) {
                setCourseUnavailable(true)
                return
            }
            setCourse(data)
        }

        axios.get(url)
            .then(res => applyCourse(res.data))
            .catch(err => {
                if (fetchSlug && fallbackId) {
                    axios.get(`${API_URL}/api/courses/${fallbackId}`)
                        .then(r => applyCourse(r.data))
                        .catch(() => setCourseUnavailable(true))
                } else {
                    setCourseUnavailable(true)
                    console.error("Course fetch error:", err)
                }
            })

        axios.get(ACTIVE_COURSES_URL(API_URL))
            .then(res => setCourses(res.data))
            .catch(err => console.error("Courses fetch error:", err))
    }, [fetchSlug, fallbackId])

    useEffect(() => {
        if (!course?._id) return
        setLoadingSessions(true)
        axios.get(`${API_URL}/api/schedules/course/${course._id}`)
            .then(res => {
                const rows = []
                res.data.forEach(sched => {
                    sched.sessions
                        .filter(s => s.status === "Active")
                        .forEach(s => {
                            rows.push({
                                id: s._id,
                                scheduleId: sched._id,
                                date: sched.date,
                                startTime: s.startTime,
                                endTime: s.endTime,
                                location: s.location || course.location || "NSW",
                                availableSlots: s.availableSlots
                            })
                        })
                })
                rows.sort((a, b) => new Date(a.date) - new Date(b.date))
                setSessions(rows)
            })
            .catch(err => console.error("Session fetch error:", err))
            .finally(() => setLoadingSessions(false))
    }, [course?._id])

    useEffect(() => {
        if (!course) return

        const defaultTitle = "SafeTricks | Sydney NSW"
        const defaultDesc =
            "SafeTricks — RTO 45234. Forklift, White Card, EWP, Working at Heights, Confined Space and more. Sydney NSW."

        const prevTitle = document.title
        const metaEl = document.querySelector('meta[name="description"]')
        const prevDesc = metaEl?.getAttribute("content") ?? defaultDesc

        const pageTitle = course.metaTitle?.trim() || course.title?.trim()
        document.title = pageTitle || defaultTitle

        const pageDesc =
            course.metaDescription?.trim() ||
            (Array.isArray(course.description) ? course.description[0] : course.description)?.trim()
        if (pageDesc && metaEl) metaEl.setAttribute("content", pageDesc)

        return () => {
            document.title = prevTitle
            if (metaEl) metaEl.setAttribute("content", prevDesc)
        }
    }, [course])

    if (isMobile) {
        return <ViewCourseDetailMobile course={course} courses={courses} fromPortal={fromPortal} />
    }

    if (courseUnavailable) {
        return (
            <section>
                <PublicNavbar courses={courses} />
                <div className="cdp-loading" style={{ padding: "4rem 2rem", textAlign: "center" }}>
                    <h2>Course not available</h2>
                    <p style={{ marginTop: "1rem", color: colors.textFaint }}>
                        This course is no longer offered. Browse our current courses below.
                    </p>
                    <button
                        type="button"
                        style={{ marginTop: "1.5rem" }}
                        onClick={() => navigate("/all-courses")}
                    >
                        View all courses
                    </button>
                </div>
                <Footer />
            </section>
        )
    }

    if (!course) {
        return (
            <div className="cdp-loading">
                <PublicNavbar courses={courses} />
            </div>
        )
    }

    const originalPrice = course?.originalPrice || 0
    const sellingPrice = course?.sellingPrice || 0
    const savings = originalPrice - sellingPrice

    const bypassKeywords = ["excavator", "haul truck", "skid steer"]
    const isBypass = bypassKeywords.some(kw => course?.title?.toLowerCase().includes(kw))
    const pricingType = getCoursePricingType(course)
    const variants = getCourseVariants(course)
    const isSlbl = pricingType === "slbl"
    const isExperience = (pricingType === "experience" || isBypass) && !isSlbl
    const slVariant = variants.find((v) => v.key === "sl")
    const slblVariant = variants.find((v) => v.key === "slbl")
    const fromPrice = getCoursePriceNumber(course)

    const relatedCourses = courses
        .filter(c => c._id !== course._id)

    const openBooking = (type, forceSkipModal = false) => {
        if ((isExperience || isSlbl) && !forceSkipModal) {
            setSelectedOptionId(type || null)
            setShowModal(true)
        } else {
            const query = fromPortal ? "?fromPortal=true" : ""
            const typeParam = type ? `${query ? "&" : "?"}type=${type}` : ""
            navigate(`/book-now/course/${course.slug}${query}${typeParam}`)
        }
    }

    // ── Hero price card ────────────────────────────────────────────────────
    const HeroPriceCard = () => (
        <div className="cdp-price-card">

            {isSlbl && (
                <>
                    <div className="cdp-pc-slbl-row">
                        <div className="cdp-pc-exp-block">
                            <p className="cdp-pc-slbl-label">Single License (SL or BL)</p>
                            <span className="cdp-price-now">${slVariant?.price ?? 0}</span>
                            {slVariant?.original && slVariant.original > slVariant.price && (
                                <span className="cdp-price-old">${slVariant.original}</span>
                            )}
                        </div>
                        <div className="cdp-pc-exp-block">
                            <p className="cdp-pc-slbl-label">Both Licenses (SL + BL)</p>
                            <span className="cdp-price-now">${slblVariant?.price ?? 0}</span>
                            {slblVariant?.original && slblVariant.original > slblVariant.price && (
                                <span className="cdp-price-old">${slblVariant.original}</span>
                            )}
                        </div>
                    </div>
                    <p className="cdp-price-note">
                        All inclusive — no hidden fees · SafeWork NSW card fee included
                    </p>
                    <div className="cdp-exp-btns">
                        <button
                            className="cdp-btn-book cdp-btn-exp-with"
                            onClick={() => openBooking("sl", true)}
                        >
                            ${slVariant?.price ?? 0} &nbsp; Book {slVariant?.label || "SL or BL"}
                        </button>
                        <button
                            className="cdp-btn-book cdp-btn-slbl"
                            onClick={() => openBooking("slbl", true)}
                        >
                            ${slblVariant?.price ?? 0} &nbsp; Book {slblVariant?.label || "SL + BL"}
                        </button>
                    </div>
                </>
            )}

            {isExperience && (
                <>
                    <div className="cdp-price-row">
                        <span className="cdp-price-now">${course.withExperiencePrice}</span>
                        {course.withExperienceOriginal && (
                            <span className="cdp-price-old">${course.withExperienceOriginal}</span>
                        )}
                        {(course.withExperienceOriginal || originalPrice) > course.withExperiencePrice && (
                            <span className="cdp-save-badge">Save ${(course.withExperienceOriginal || originalPrice) - course.withExperiencePrice}</span>
                        )}
                    </div>
                    <p className="cdp-price-note">
                        All inclusive — no hidden fees · SafeWork NSW card fee included
                    </p>
                    <div className="cdp-exp-btns">
                        <button
                            className="cdp-btn-book cdp-btn-exp-with"
                            onClick={() => openBooking("with-experience", true)}
                        >
                            ${course.withExperiencePrice} &nbsp; Book With Experience
                        </button>
                        <button
                            className="cdp-btn-book cdp-btn-exp-without"
                            onClick={() => openBooking("without-experience", true)}
                        >
                            ${course.withoutExperiencePrice} &nbsp; Book Without Experience
                        </button>
                    </div>
                </>
            )}

            {/* STANDARD */}
            {!isSlbl && !isExperience && (
                <>
                    <div className="cdp-price-row">
                        <span className="cdp-price-now">${sellingPrice}</span>
                        {originalPrice > sellingPrice && (
                            <span className="cdp-price-old">${originalPrice}</span>
                        )}
                        {savings > 0 && (
                            <span className="cdp-save-badge">Save ${savings}</span>
                        )}
                    </div>
                    <p className="cdp-price-note">
                        All inclusive — no hidden fees · SafeWork NSW card fee included
                    </p>
                    <button
                        className="cdp-btn-book"
                        onClick={() => openBooking(null, true)}
                    >
                        Book Now — Pick a Date
                    </button>
                </>
            )}

            <button className="cdp-btn-voc" onClick={() => navigate(`/voc?courseId=${course._id}${fromPortal ? "&fromPortal=true" : ""}`)}>
                Already Trained? Book VOC
            </button>
            <ul className="cdp-trust-list">
                <li><span className="cdp-check">✓</span> Certificate issued same day</li>
                <li><span className="cdp-check">✓</span> Sunday sessions available</li>
                <li><span className="cdp-check">✓</span> SafeWork NSW approved RTO</li>
            </ul>
        </div>
    )

    // ── Sidebar price card ─────────────────────────────────────────────────
    const SidebarPriceCard = () => (
        <div className="cdp-sb-card">
            <div className="cdp-sb-title">Enrol in this course</div>

            {/* SLBL */}
            {isSlbl && (
                <>
                    <div className="cdp-sb-exp-row">
                        <span className="cdp-sb-exp-label">Single License (SL or BL)</span>
                        <span className="cdp-sb-price">${slVariant?.price ?? 0}</span>
                    </div>
                    <div className="cdp-sb-exp-row">
                        <span className="cdp-sb-exp-label">Both Licenses (SL + BL)</span>
                        <span className="cdp-sb-price">${slblVariant?.price ?? 0}</span>
                    </div>
                    <div className="cdp-sb-note">All inclusive · SafeWork NSW card fee included</div>
                    <button
                        className="cdp-sb-btn-exp-with"
                        onClick={() => openBooking("sl", true)}
                    >
                        ${slVariant?.price ?? 0} &nbsp; Book {slVariant?.label || "SL or BL"}
                    </button>
                    <button
                        className="cdp-sb-btn-slbl"
                        onClick={() => openBooking("slbl", true)}
                    >
                        ${slblVariant?.price ?? 0} &nbsp; Book {slblVariant?.label || "SL + BL"}
                    </button>
                </>
            )}

            {/* EXPERIENCE */}
            {isExperience && (
                <>
                    <div className="cdp-sb-exp-row">
                        <span className="cdp-sb-exp-label">With experience</span>
                        <span className="cdp-sb-price">${course.withExperiencePrice}</span>
                    </div>
                    <div className="cdp-sb-exp-row">
                        <span className="cdp-sb-exp-label">Without experience</span>
                        <span className="cdp-sb-price">${course.withoutExperiencePrice}</span>
                    </div>
                    <div className="cdp-sb-note">All inclusive · SafeWork NSW card fee included</div>
                    <button
                        className="cdp-sb-btn-exp-with"
                        onClick={() => openBooking("with-experience")}
                    >
                        ${course.withExperiencePrice} &nbsp; Book With Experience
                    </button>
                    <button
                        className="cdp-sb-btn-exp-without"
                        onClick={() => openBooking("without-experience")}
                    >
                        ${course.withoutExperiencePrice} &nbsp; Book Without Experience
                    </button>
                </>
            )}

            {/* STANDARD */}
            {!isSlbl && !isExperience && (
                <>
                    <div className="cdp-sb-price-row">
                        <span className="cdp-sb-price">${sellingPrice}</span>
                        {originalPrice > sellingPrice && (
                            <span className="cdp-sb-orig">${originalPrice}</span>
                        )}
                    </div>
                    <div className="cdp-sb-note">All inclusive · SafeWork NSW card fee included</div>
                    <button
                        className="cdp-sb-btn-main"
                        onClick={() => openBooking()}
                    >
                        Book Now — Pick a Date
                    </button>
                </>
            )}

            <button className="cdp-sb-btn-voc" onClick={() => navigate(`/voc?courseId=${course._id}${fromPortal ? "&fromPortal=true" : ""}`)}>
                Already Trained? Book VOC
            </button>
            <ul className="cdp-sb-mini-list">
                <li><span>✓</span> Certificate same day</li>
                <li><span>✓</span> Sunday sessions available</li>
                <li><span>✓</span> No prior experience required</li>
                <li><span>✓</span> Nationally valid in all states</li>
            </ul>
        </div>
    )

    return (
        <div className="cdp">

            <PublicNavbar courses={courses} />

            {/* ── HERO ──
                 Real <img> behind the overlay so the LCP image is preloaded
                 with fetchpriority="high" instead of waiting for CSS to
                 resolve a background-image URL.
            */}
            <div className="cdp-hero">
                {course?.image && (
                    <img
                        className="cdp-hero-bg"
                        src={cdnImage(course.image, { w: 1600 })}
                        alt={course?.title || ""}
                        loading="eager"
                        fetchpriority="high"
                        decoding="async"
                    />
                )}
                <div className="cdp-hero-inner">
                    <div className="cdp-hero-left">
                        <div className="cdp-tag">
                            {course?.courseCode ? `${course.courseCode} — ` : ""}{course?.category}
                        </div>
                        <h1 className="cdp-title">{course?.title}</h1>
                        <div className="cdp-code">
                            {course?.courseCode} &nbsp;·&nbsp; Nationally Recognised Training
                        </div>
                        <p className="cdp-desc">
                            {Array.isArray(course?.description)
                                ? course.description[0]
                                : course?.description || ""}
                        </p>
                    </div>

                    <div className="cdp-hero-right">
                        <HeroPriceCard />
                    </div>
                </div>

                {/* ── QUICK FACTS BAR ── */}
                <div className="cdp-qfbar">
                    {[
                        { icon: "📅", val: course?.trainingDuration || "", label: "Course duration" },
                        { icon: "⏰", val: "8:30am – 4:30pm", label: "Class hours" },
                        { icon: "📍", val: course?.location || "Sefton NSW", label: "Training location" },
                        { icon: "🎓", val: "", label: "Accredited provider" },
                        { icon: "📜", val: "Same Day", label: "Certificate issued" },
                        { icon: "🗺", val: "All States", label: "Nationally recognised" },
                    ].map((item, i) => (
                        <div className="cdp-qf-item" key={i}>
                            <div className="cdp-qf-icon">{item.icon}</div>
                            <div>
                                <div className="cdp-qf-val">{item.val}</div>
                                <div className="cdp-qf-label">{item.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <BookingModal
                    course={course}
                    onClose={() => {
                        setShowModal(false)
                        setSelectedOptionId(null)
                    }}
                    initialSelection={selectedOptionId}
                    extraQueryParams={fromPortal ? "fromPortal=true" : ""}
                />
            )}
            

            {/* ── MAIN LAYOUT ── */}
            {/* ── MAIN LAYOUT ── */}
            <div className="cdp-main">

                <div className="cdp-content">
                    
                    {/* AVAILABLE DATES & LOCATIONS — after all plain sections */}
                    <AccordionCard title="Available dates & locations">
                        {loadingSessions ? (
                            <div className="cdp-sessions-loading">Loading sessions...</div>
                        ) : sessions.length === 0 ? (
                            <p className="cdp-no-sessions">no dates available for booking</p>
                        ) : (
                            <>
                                {!showAllSessions ? (
                                    <div className="cdp-sessions-list">
                                        {sessions.slice(0, 4).map((s, i) => {
                                            const d = new Date(s.date)
                                            const day = d.getDate()
                                            const mon = d.toLocaleString("en-AU", { month: "short" }).toUpperCase()
                                            const weekday = d.toLocaleString("en-AU", { weekday: "long" })
                                            const cleanLoc = (s.location || "").replace(/Face to Face/gi, "").replace(/Sefton/gi, "").replace(/Safton/gi, "Sefton").replace(/·\s*$/g, "").trim()
                                            const today = new Date()
                                            const diffDays = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
                                            let spotLabel = "Seats Available", spotClass = ""
                                            if (s.availableSlots <= 3) { spotLabel = "Filling Fast"; spotClass = "cdp-s-spots--low" }
                                            else if (diffDays < 20 || s.availableSlots <= 10) { spotLabel = "Limited Seats"; spotClass = "cdp-s-spots--medium" }
                                            return (
                                                <div className="cdp-session-row" key={i}>
                                                    <div className="cdp-s-date">
                                                        <div className="cdp-s-day">{day}</div>
                                                        <div className="cdp-s-mon">{mon}</div>
                                                    </div>
                                                    <div className="cdp-s-info">
                                                        <div className="cdp-s-title">{weekday}</div>
                                                        <div className="cdp-s-meta">{s.startTime} – {s.endTime}</div>
                                                    </div>
                                                    <div className="cdp-s-meta-desktop">{cleanLoc}</div>
                                                    <div className={`cdp-s-spots ${spotClass}`}>{spotLabel}</div>
                                                    <button
                                                        className="cdp-s-btn"
                                                        onClick={() => navigate(`/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${fromPortal ? "&fromPortal=true" : ""}`)}
                                                    >Book</button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="cdp-sessions-expanded">
                                        {chunkArray(sessions, 7).map((page, pIdx) => (
                                            <div key={pIdx} className="cdp-expanded-page">
                                                {page.map((s, i) => {
                                                    const d = new Date(s.date)
                                                    const day = d.getDate()
                                                    const mon = d.toLocaleString("en-AU", { month: "short" }).toUpperCase()
                                                    const weekday = d.toLocaleString("en-AU", { weekday: "long" })
                                                    const cleanLoc = (s.location || "").replace(/Face to Face/gi, "").replace(/Sefton/gi, "").replace(/Safton/gi, "Sefton").replace(/·\s*$/g, "").trim()
                                                    const cleanTime = (s.startTime || "").replace(/Face to Face/gi, "").trim()
                                                    const today = new Date()
                                                    const diffDays = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
                                                    let spotLabel = "Seats Available", spotClass = ""
                                                    if (s.availableSlots <= 3) { spotLabel = "Filling Fast"; spotClass = "cdp-s-spots--low" }
                                                    else if (diffDays < 20 || s.availableSlots <= 10) { spotLabel = "Limited Seats"; spotClass = "cdp-s-spots--medium" }
                                                    return (
                                                        <div className="cdp-session-row expanded" key={i}>
                                                            <div className="cdp-s-date">
                                                                <div className="cdp-s-day">{day}</div>
                                                                <div className="cdp-s-mon">{mon}</div>
                                                            </div>
                                                            <div className="cdp-s-info">
                                                                <div className="cdp-s-title">{weekday} — Full day</div>
                                                                <div className="cdp-s-meta">{cleanTime} – {s.endTime} &nbsp;·&nbsp; {cleanLoc}</div>
                                                            </div>
                                                            <div className={`cdp-s-spots ${spotClass}`}>{spotLabel}</div>
                                                            <button
                                                                className="cdp-s-btn"
                                                                onClick={() => navigate(`/book-now/course/${course.slug}?scheduleId=${s.scheduleId}&sessionId=${s.id}${fromPortal ? "&fromPortal=true" : ""}`)}
                                                            >Book</button>
                                                        </div>
                                                    )
                                                })}
                                                <div className="cdp-page-indicator">{pIdx + 1} / {Math.ceil(sessions.length / 7)}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {sessions.length > 4 && (
                                    <button className="cdp-see-all-btn" onClick={() => setShowAllSessions(!showAllSessions)}>
                                        {showAllSessions ? "See less" : "See all sessions"}
                                    </button>
                                )}
                            </>
                        )}
                    </AccordionCard>

                    {/* ═══════════════════════════════════════════
                        COURSE DETAIL SECTIONS (plain, no accordion)
                        Matches screenshot design: blue bold title,
                        seamless flow, blue rounded tick icons
                    ═══════════════════════════════════════════ */}

                    {/* COURSE DESCRIPTION */}
                    {(() => {
                        const descParagraphs = Array.isArray(course?.description)
                            ? course.description.filter(Boolean)
                            : course?.description
                                ? [course.description]
                                : []
                       
                        if (descParagraphs.length === 0) return null
                        return (
                            <div className="cdp-section">
                                <h2 className="cdp-section-title">Course Description</h2>
                                <div className="cdp-desc-layout">
                                    <div className="cdp-desc-text">
                                        {descParagraphs.map((p, i) => (
                                            <p key={i}>{p}</p>
                                        ))}
                                    </div>
                                
                                </div>
                            </div>
                        )
                    })()}

                    {/* ENTRY REQUIREMENTS */}
                    {Array.isArray(course?.requirements) && course.requirements.filter(Boolean).length > 0 && (
                        <div className="cdp-section">
                            <h2 className="cdp-section-title">Entry Requirements</h2>
                            <ul className="cdp-tick-list">
                                {course.requirements.filter(Boolean).map((item, i) => (
                                    <li key={i}>
                                        <BlueTick />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* DURATION */}
                    {course?.trainingDuration && (
                        <div className="cdp-section">
                            <h2 className="cdp-section-title">Duration</h2>
                            <p className="cdp-section-text">
                                The total duration is {course.trainingDuration}. Training and assessment are conducted in our training centre.
                            </p>
                        </div>
                    )}

                    {/* TRAINING OVERVIEW */}
                    {Array.isArray(course?.trainingOverview) && course.trainingOverview.filter(Boolean).length > 0 && (
                        <div className="cdp-section">
                            <h2 className="cdp-section-title">Training Overview</h2>
                            <ul className="cdp-tick-list">
                                {course.trainingOverview.filter(Boolean).map((item, i) => (
                                    <li key={i}>
                                        <BlueTick />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* VOCATIONAL OUTCOME */}
                    {Array.isArray(course?.vocationalOutcome) && course.vocationalOutcome.filter(Boolean).length > 0 && (() => {
                        const items = course.vocationalOutcome.filter(Boolean)
                        // First item is often a long intro sentence, render as plain text
                        const firstIsIntro = items.length > 1 && items[0].length > 80
                        const intro = firstIsIntro ? items[0] : null
                        const bullets = firstIsIntro ? items.slice(1) : items
                        return (
                            <div className="cdp-section">
                                <h2 className="cdp-section-title">Vocational Outcome</h2>
                                {intro && <p className="cdp-section-text">{intro}</p>}
                                {bullets.length > 0 && (
                                    <ul className="cdp-tick-list">
                                        {bullets.map((item, i) => (
                                            <li key={i}>
                                                <BlueTick />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )
                    })()}

                    {/* WHAT YOU WILL LEARN */}
                    {Array.isArray(course?.outcomePoints) && course.outcomePoints.filter(Boolean).length > 0 && (
                        <div className="cdp-section">
                            <h2 className="cdp-section-title">What you will learn</h2>
                            <ul className="cdp-tick-list">
                                {course.outcomePoints.filter(Boolean).map((item, i) => (
                                    <li key={i}>
                                        <BlueTick />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* PATHWAYS */}
                    {Array.isArray(course?.pathways) && course.pathways.filter(Boolean).length > 0 && (
                        <div className="cdp-section">
                            <h2 className="cdp-section-title">Pathways</h2>
                            {course.pathways.filter(Boolean).map((p, i) => (
                                <p key={i} className="cdp-section-text cdp-section-italic">{p}</p>
                            ))}
                        </div>
                    )}

                    {/* FEES AND CHARGES */}
                    {Array.isArray(course?.feesCharges) && course.feesCharges.filter(Boolean).length > 0 && (
                        <div className="cdp-section">
                            <h2 className="cdp-section-title">Fees and Charges</h2>
                            <ul className="cdp-tick-list">
                                {course.feesCharges.filter(Boolean).map((item, i) => (
                                    <li key={i}>
                                        <BlueTick />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* OPTIONAL */}
                    {Array.isArray(course?.optionalCharges) && course.optionalCharges.filter(Boolean).length > 0 && (
                        <div className="cdp-section">
                            <h2 className="cdp-section-title">Optional</h2>
                            {course.optionalCharges.filter(Boolean).map((p, i) => (
                                <p key={i} className="cdp-section-text">{p}</p>
                            ))}
                        </div>
                    )}

                    {/* ═══════════════════════════════════════
                        ACCORDION SECTIONS (collapsible)
                    ═══════════════════════════════════════ */}


                    {/* WHY CHOOSE SafeTricks */}
                    <AccordionCard title="Why choose SafeTricks">
                        <div className="cdp-trust-grid">
                            {[
                                { icon: "🏛", title: "SafeWork NSW Approved Provider" },
                                { icon: "📜", title: "Certificate Issued Same Day" },
                                { icon: "📅", title: "Sunday Sessions Available" },
                                { icon: "💰", title: "All-Inclusive Pricing — No Hidden Fees" },
                                { icon: "📍", title: "Easy Location with Free Parking" },
                            ].map((b, i) => (
                                <div className="cdp-trust-badge" key={i}>
                                    <span className="cdp-tb-icon">{b.icon}</span>
                                    <span className="cdp-tb-title">{b.title}</span>
                                </div>
                            ))}
                        </div>
                    </AccordionCard>

                </div>


                {/* SIDEBAR */}
                <div className="cdp-sidebar">

                    <SidebarPriceCard />

                    {/* Handbook Cards (Sidebar - Only show striped card if NO large cardImage exists) */}
                    {(() => {
                        if (course.handbook?.cardImage) return null; // Hide striped card if large image exists

                        const finalUrl = (() => {
                            let hUrl = course.handbook?.url || course.handbook?.pdf;
                            if (!hUrl) return null;
                            let clean = hUrl.replace(/^https?:\/\//, "").replace(/^\/+/, "");
                            return `https://${clean}`;
                        })();

                        if (!finalUrl) return null;

                        return (
                            <div
                                onClick={() => handleViewPDF(course.handbook?.url || course.handbook?.pdf)}
                                style={{ cursor: 'pointer' }}
                                className="cdp-hb-card"
                            >
                                <div className="cdp-hb-inner">
                                    <img src={logo} alt="SafeTricks Logo" className="cdp-hb-logo" />
                                    <h3 className="cdp-hb-title">{course.handbook?.title || "CODE OF PRACTICE"}</h3>
                                    <div className="cdp-hb-subtitle">Click to download the {course.handbook?.title || "CODE OF PRACTICE"} [PDF]</div>
                                </div>
                            </div>
                        );
                    })()}

                    <div
                        onClick={() => handleViewPDF("/resources/participant-handbook.pdf")}
                        style={{ cursor: 'pointer' }}
                        className="cdp-hb-card"
                    >
                        <div className="cdp-hb-inner">
                            <img src={logo} alt="SafeTricks Logo" className="cdp-hb-logo" />
                            <h3 className="cdp-hb-title">Participant Handbook</h3>
                            <div className="cdp-hb-subtitle">Click to download the Participant Handbook [PDF]</div>
                        </div>
                    </div>


                    {relatedCourses.length > 0 && (
                        <div className="cdp-sb-card">
                            <div className="cdp-sb-title">Course of Practice</div>
                            <div className="cdp-marquee-wrapper">
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
                    )}

                    <div className="cdp-sb-card cdp-sb-card--dark">
                        <div className="cdp-sb-title cdp-sb-title--light">Need help?</div>
                        <p className="cdp-sb-help-text">
                            Our team can answer questions about course suitability, dates, and group bookings.
                        </p>
                        <a href={ORG_PHONE_1300.tel} className="cdp-sb-btn-cyan">☎ {ORG_PHONE_1300.display}</a>
                        <a href="mailto:info@safetricks.com.au" className="cdp-sb-btn-ghost">✉ Email us</a>
                        <div className="cdp-sb-email">info@safetricks.com.au</div>
                    </div>

                </div>
            </div>

            {/* ── STICKY BOTTOM BAR ── */}
            <div className="cdp-sticky">
                <div className="cdp-sticky-info">
                    <div>
                        <div className="cdp-sticky-name">{course?.title}</div>
                        <div className="cdp-sticky-facts">
                            📅 {course?.trainingDuration} &nbsp;·&nbsp;
                            📍 {course?.location} &nbsp;·&nbsp;
                            🎓 
                        </div>
                    </div>
                    <div className="cdp-sticky-price">
                        {isSlbl
                            ? `From $${fromPrice}`
                            : isExperience
                                ? `From $${course.withExperiencePrice}`
                                : `$${sellingPrice}`
                        }
                    </div>
                </div>
                <div className="cdp-sticky-btns">
                    {isSlbl ? (
                        <>
                            <button
                                className="cdp-sticky-book"
                                onClick={() => openBooking("sl", true)}
                            >
                                SL — ${slVariant?.price ?? 0}
                            </button>
                            <button
                                className="cdp-sticky-book cdp-sticky-book--dark"
                                onClick={() => openBooking("slbl", true)}
                            >
                                SL+BL — ${slblVariant?.price ?? 0}
                            </button>
                        </>
                    ) : (
                        <button
                            className="cdp-sticky-book"
                            onClick={() => openBooking()}
                        >
                            Book Now — Pick a Date
                        </button>
                    )}
                </div>
            </div>

            <Footer courses={courses} />
            {showModal && (
                <BookingModal
                    course={course}
                    onClose={() => {
                        setShowModal(false)
                        setSelectedOptionId(null)
                    }}
                    initialSelection={selectedOptionId}
                    extraQueryParams={fromPortal ? "fromPortal=true" : ""}
                />
            )}
        </div>
    )
}

export default CourseDetails