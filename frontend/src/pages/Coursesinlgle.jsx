// import { useEffect, useState } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import MainLayout from '../layouts/MainLayout'
// import { useCart } from '../components/Cartcontext'
// import API from '../services/api'
// import './coursesingle.css'

// export default function CourseSingle() {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const { addToCart, removeFromCart, increaseQty, decreaseQty, items } = useCart()

//   const [course, setCourse]   = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError]     = useState('')
//   const [tab, setTab]         = useState('overview')

//   useEffect(() => {
//     setLoading(true)
//     API.get(`/courses/${id}`)
//       .then(r => {
//         const c = r.data?.course || r.data?.data || r.data
//         setCourse(c)
//       })
//       .catch(() => setError('Course not found.'))
//       .finally(() => setLoading(false))
//   }, [id])

//   const cartItem = items.find(i => i.course._id === id && i.option === 'Standard')
//   const qty = cartItem?.qty || 0
//   const inCart = qty > 0

//   if (loading) return (
//     <MainLayout>
//       <div className="cs-loading">
//         <div className="cs-spinner" />
//         <p>Loading course...</p>
//       </div>
//     </MainLayout>
//   )

//   if (error || !course) return (
//     <MainLayout>
//       <div className="cs-error">
//         <div className="cs-error-icon">😕</div>
//         <h2>Course Not Found</h2>
//         <p>{error || 'This course could not be loaded.'}</p>
//         <button onClick={() => navigate('/courses')}>← Back to Courses</button>
//       </div>
//     </MainLayout>
//   )

//   const price     = Number(course.price) || 0
//   const origPrice = Number(course.originalPrice) || (price > 0 ? Math.round(price * 1.2) : 0)
//   const saving    = origPrice > price ? origPrice - price : 0
//   const days      = course.days || (course.duration ? parseInt(course.duration) || null : null)

//   return (
//     <MainLayout>
//       <div className="cs-page">

//         {/* ── Breadcrumb ── */}
//         <div className="cs-breadcrumb">
//           <div className="container">
//             <span onClick={() => navigate('/')} className="cs-bc-link">Home</span>
//             <span className="cs-bc-sep">›</span>
//             <span onClick={() => navigate('/courses')} className="cs-bc-link">Courses</span>
//             <span className="cs-bc-sep">›</span>
//             <span className="cs-bc-current">{course.title}</span>
//           </div>
//         </div>

//         <div className="container cs-inner">

//           {/* ── LEFT: details ── */}
//           <div className="cs-left">

//             {/* Hero image */}
//             <div className="cs-hero-img">
//               {course.thumbnail
//                 ? <img src={course.thumbnail} alt={course.title} />
//                 : <div className="cs-img-ph">📖</div>
//               }
//               {course.category?.name && (
//                 <span className="cs-badge">{course.category.name}</span>
//               )}
//             </div>

//             {/* Tabs */}
//             <div className="cs-tabs">
//               {['overview', 'details', 'instructor'].map(t => (
//                 <button
//                   key={t}
//                   className={`cs-tab${tab === t ? ' cs-tab-active' : ''}`}
//                   onClick={() => setTab(t)}
//                 >
//                   {t.charAt(0).toUpperCase() + t.slice(1)}
//                 </button>
//               ))}
//             </div>

//             <div className="cs-tab-body">
//               {tab === 'overview' && (
//                 <div className="cs-overview">
//                   <h2>{course.title}</h2>
//                   <p className="cs-desc">
//                     {course.description || 'No description available.'}
//                   </p>
//                   {course.outcomes && course.outcomes.length > 0 && (
//                     <>
//                       <h3>What You'll Learn</h3>
//                       <ul className="cs-outcomes">
//                         {course.outcomes.map((o, i) => (
//                           <li key={i}><span className="cs-check">✓</span>{o}</li>
//                         ))}
//                       </ul>
//                     </>
//                   )}
//                 </div>
//               )}
//               {tab === 'details' && (
//                 <div className="cs-details">
//                   <div className="cs-detail-grid">
//                     {days && (
//                       <div className="cs-detail-item">
//                         <span className="cs-detail-icon">📅</span>
//                         <div>
//                           <p className="cs-detail-label">Duration</p>
//                           <p className="cs-detail-val">{days} {days === 1 ? 'Day' : 'Days'}</p>
//                         </div>
//                       </div>
//                     )}
//                     {course.location && (
//                       <div className="cs-detail-item">
//                         <span className="cs-detail-icon">📍</span>
//                         <div>
//                           <p className="cs-detail-label">Location</p>
//                           <p className="cs-detail-val">{course.location}</p>
//                         </div>
//                       </div>
//                     )}
//                     {course.instructor && (
//                       <div className="cs-detail-item">
//                         <span className="cs-detail-icon">👥</span>
//                         <div>
//                           <p className="cs-detail-label">Instructor</p>
//                           <p className="cs-detail-val">{course.instructor}</p>
//                         </div>
//                       </div>
//                     )}
//                     {course.level && (
//                       <div className="cs-detail-item">
//                         <span className="cs-detail-icon">🎯</span>
//                         <div>
//                           <p className="cs-detail-label">Level</p>
//                           <p className="cs-detail-val">{course.level}</p>
//                         </div>
//                       </div>
//                     )}
//                     {course.language && (
//                       <div className="cs-detail-item">
//                         <span className="cs-detail-icon">🌐</span>
//                         <div>
//                           <p className="cs-detail-label">Language</p>
//                           <p className="cs-detail-val">{course.language}</p>
//                         </div>
//                       </div>
//                     )}
//                     {course.certificate !== undefined && (
//                       <div className="cs-detail-item">
//                         <span className="cs-detail-icon">🏆</span>
//                         <div>
//                           <p className="cs-detail-label">Certificate</p>
//                           <p className="cs-detail-val">{course.certificate ? 'Yes' : 'No'}</p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//               {tab === 'instructor' && (
//                 <div className="cs-instructor">
//                   <div className="cs-instructor-avatar">👤</div>
//                   <div>
//                     <h3>{course.instructor || 'Instructor'}</h3>
//                     <p className="cs-instructor-role">Course Instructor</p>
//                     <p className="cs-instructor-bio">
//                       {course.instructorBio || 'Experienced industry professional delivering nationally recognised training.'}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* ── RIGHT: booking card ── */}
//           <div className="cs-right">
//             <div className="cs-booking-card">

//               <div className="cs-price-row">
//                 <span className="cs-price">${price.toLocaleString()}</span>
//                 {saving > 0 && (
//                   <>
//                     <span className="cs-orig-price">${origPrice.toLocaleString()}</span>
//                     <span className="cs-save">Save ${saving.toLocaleString()}</span>
//                   </>
//                 )}
//               </div>

//               <h2 className="cs-title">{course.title}</h2>

//               <div className="cs-meta-list">
//                 {days && (
//                   <div className="cs-meta-row">
//                     <span>📅</span>
//                     <span>{days} {days === 1 ? 'Day' : 'Days'}</span>
//                   </div>
//                 )}
//                 {course.instructor && (
//                   <div className="cs-meta-row">
//                     <span>👥</span>
//                     <span>{course.instructor}</span>
//                   </div>
//                 )}
//                 {course.location && (
//                   <div className="cs-meta-row">
//                     <span>📍</span>
//                     <span>{course.location}</span>
//                   </div>
//                 )}
//               </div>

//               <p className="cs-option-label">SELECT OPTION</p>
//               <div className="cs-option-box cs-option-active">
//                 <span>Standard</span>
//                 <strong>${price.toLocaleString()}</strong>
//               </div>
//               {course.vocPrice && (
//                 <div className="cs-option-box">
//                   <span>VOC Renewal</span>
//                   <strong>${Number(course.vocPrice).toLocaleString()}</strong>
//                 </div>
//               )}

//               {/* Add to cart / Qty controls */}
//               {!inCart ? (
//                 <button
//                   className="cs-book-btn"
//                   onClick={() => addToCart(course, 'Standard')}
//                 >
//                   Book Now →
//                 </button>
//               ) : (
//                 <div className="cs-qty-controls">
//                   <button
//                     className="cs-qty-btn"
//                     onClick={() => qty === 1 ? removeFromCart(course._id, 'Standard') : decreaseQty(course._id, 'Standard')}
//                   >−</button>
//                   <span className="cs-qty-num">{qty}</span>
//                   <button
//                     className="cs-qty-btn"
//                     onClick={() => increaseQty(course._id, 'Standard')}
//                   >+</button>
//                 </div>
//               )}

//               <button
//                 className="cs-voc-btn"
//                 onClick={() => navigate('/voc')}
//               >
//                 VOC Renewal →
//               </button>

//               <div className="cs-guarantees">
//                 <div className="cs-guarantee-item"><span>✓</span> Certificate same day</div>
//                 <div className="cs-guarantee-item"><span>✓</span> Nationally recognised</div>
//                 <div className="cs-guarantee-item"><span>✓</span> Same-week sessions</div>
//               </div>

//             </div>
//           </div>

//         </div>
//       </div>
//     </MainLayout>
//   )
// }

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { useCart } from '../components/Cartcontext'
import API from '../services/api'
import './coursesingle.css'

// Split a free-text field into bullet items (one per non-empty line)
function toList(text) {
  if (!text) return []
  return text
    .split('\n')
    .map(l => l.replace(/^[-•\s]+/, '').trim())
    .filter(Boolean)
}

// Build the next N upcoming weekday sessions starting from tomorrow
function buildSessions(n = 4) {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  const sessions = []
  const d = new Date()
  while (sessions.length < n) {
    d.setDate(d.getDate() + 1)
    sessions.push({
      date: d.getDate(),
      month: months[d.getMonth()],
      day: days[d.getDay()],
      time: (d.getDay() === 1 || d.getDay() === 2) ? '08:00 – 17:00' : '08:30 – 17:00',
    })
  }
  return sessions
}

export default function CourseSingle() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart, removeFromCart, increaseQty, decreaseQty, items } = useCart()

  const [course, setCourse]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    setLoading(true)
    API.get(`/courses/slug/${slug}`)
      .then(r => {
        const c = r.data?.course || r.data?.data || r.data
        setCourse(c)
      })
      .catch(() => setError('Course not found.'))
      .finally(() => setLoading(false))
  }, [slug])

  const cartItem = items.find(i => i.course._id === course?._id && i.option === 'Standard')
  const qty = cartItem?.qty || 0
  const inCart = qty > 0

  if (loading) return (
    <MainLayout>
      <div className="cs-loading">
        <div className="cs-spinner" />
        <p>Loading course...</p>
      </div>
    </MainLayout>
  )

  if (error || !course) return (
    <MainLayout>
      <div className="cs-error">
        <div className="cs-error-icon">😕</div>
        <h2>Course Not Found</h2>
        <p>{error || 'This course could not be loaded.'}</p>
        <button onClick={() => navigate('/courses')}>← Back to Courses</button>
      </div>
    </MainLayout>
  )

  const price     = Number(course.price) || 0
  const origPrice = Number(course.originalPrice) || (price > 0 ? Math.round(price * 1.2) : 0)
  const saving    = origPrice > price ? origPrice - price : 0
  const days      = course.days || (course.duration ? parseInt(course.duration) || null : null)

  const aboutItems = toList(course.trainingOverview).length
    ? toList(course.trainingOverview)
    : toList(course.outcomePoint)
  const requirementItems = toList(course.courseRequirement)
  const feeItems         = [...toList(course.feesAndCharges), ...toList(course.optionalCharges)]
  const sessions          = buildSessions(4)
  const rating            = Number(course.rating) || 4.5

  const BookingCard = ({ compact }) => (
    <div className={`cs-booking-card${compact ? ' cs-booking-compact' : ''}`}>
      {!compact && <p className="cs-enrol-label">Enrol in this course</p>}
      <div className="cs-price-row">
        <span className="cs-price">${price.toLocaleString()}</span>
        {saving > 0 && <span className="cs-orig-price">${origPrice.toLocaleString()}</span>}
        {saving > 0 && compact && <span className="cs-save">Save ${saving.toLocaleString()}</span>}
      </div>
      <p className="cs-incl-text">All inclusive · SafeWork NSW card fee included</p>

      {!inCart ? (
        <button className="cs-book-btn" onClick={() => addToCart(course, 'Standard')}>
          Book Now — Pick a Date
        </button>
      ) : (
        <div className="cs-qty-controls">
          <button
            className="cs-qty-btn"
            onClick={() => qty === 1 ? removeFromCart(course._id, 'Standard') : decreaseQty(course._id, 'Standard')}
          >−</button>
          <span className="cs-qty-num">{qty}</span>
          <button className="cs-qty-btn" onClick={() => increaseQty(course._id, 'Standard')}>+</button>
        </div>
      )}

      <button className="cs-voc-btn" onClick={() => navigate('/voc')}>
        Already Trained? Book VOC
      </button>

      <div className="cs-guarantees">
        <div className="cs-guarantee-item"><span>✓</span> Certificate same day</div>
        <div className="cs-guarantee-item"><span>✓</span> Sunday sessions available</div>
        <div className="cs-guarantee-item"><span>✓</span> No prior experience required</div>
        <div className="cs-guarantee-item"><span>✓</span> Nationally valid in all states</div>
      </div>
    </div>
  )

  return (
    <MainLayout>
      <div className="cs-page">

        {/* ── Hero banner ── */}
        <div className="cs-hero">
          {course.thumbnail
            ? <img src={course.thumbnail} alt={course.title} />
            : <div className="cs-img-ph">📖</div>
          }
          <div className="cs-hero-overlay" />

          {(course.code || course.category?.name) && (
            <span className="cs-badge">
              {course.code || course.category?.name}
              {course.category?.name ? ' — Short Courses' : ''}
            </span>
          )}

          <div className="cs-hero-content">
            <h1>{course.title}</h1>
            <p className="cs-hero-sub">
              {course.code && <>{course.code} · </>}Nationally Recognised Training
            </p>
            {course.description && (
              <p className="cs-hero-desc">{course.description}</p>
            )}
          </div>

          <div className="cs-hero-card">
            <BookingCard compact />
          </div>
        </div>

        {/* ── Meta strip ── */}
        <div className="cs-meta-strip">
          <div className="container cs-meta-grid">
            {days && (
              <div className="cs-meta-item">
                <span className="cs-meta-icon">📅</span>
                <div>
                  <p className="cs-meta-val">{days} {days === 1 ? 'Day' : 'Days'}</p>
                  <p className="cs-meta-label">Course duration</p>
                </div>
              </div>
            )}
            <div className="cs-meta-item">
              <span className="cs-meta-icon">⏰</span>
              <div>
                <p className="cs-meta-val">8:30am – 4:30pm</p>
                <p className="cs-meta-label">Class hours</p>
              </div>
            </div>
            {course.location && (
              <div className="cs-meta-item">
                <span className="cs-meta-icon">📍</span>
                <div>
                  <p className="cs-meta-val">{course.location}</p>
                  <p className="cs-meta-label">Training location</p>
                </div>
              </div>
            )}
            <div className="cs-meta-item">
              <span className="cs-meta-icon">🎓</span>
              <div>
                <p className="cs-meta-val">Accredited</p>
                <p className="cs-meta-label">Provider</p>
              </div>
            </div>
            <div className="cs-meta-item">
              <span className="cs-meta-icon">📜</span>
              <div>
                <p className="cs-meta-val">Same Day</p>
                <p className="cs-meta-label">Certificate issued</p>
              </div>
            </div>
            <div className="cs-meta-item">
              <span className="cs-meta-icon">🌏</span>
              <div>
                <p className="cs-meta-val">All States</p>
                <p className="cs-meta-label">Nationally recognised</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="container cs-inner">

          <div className="cs-left">

            {/* Available dates & locations */}
            <section className="cs-section">
              <h2>Available dates &amp; locations</h2>
              <div className="cs-sessions">
                {sessions.map((s, i) => (
                  <div className="cs-session-row" key={i}>
                    <div className="cs-session-date">
                      <span className="cs-session-day">{s.date}</span>
                      <span className="cs-session-month">{s.month}</span>
                    </div>
                    <div className="cs-session-info">
                      <p className="cs-session-name">{s.day}</p>
                      <p className="cs-session-time">{s.time}</p>
                    </div>
                    <span className="cs-session-badge">Limited Seats</span>
                    <button className="cs-session-book" onClick={() => addToCart(course, 'Standard')}>Book</button>
                  </div>
                ))}
              </div>
              <button className="cs-see-all" onClick={() => navigate('/courses')}>See all sessions</button>
            </section>

            {/* About this course */}
            <section className="cs-section">
              <h2>About this course</h2>
              {aboutItems.length > 0 ? (
                <div className="cs-text-list">
                  {aboutItems.map((item, i) => <p key={i}>{item}</p>)}
                </div>
              ) : (
                <p className="cs-desc">{course.description || 'No description available.'}</p>
              )}
            </section>

            {/* Entry requirements */}
            {requirementItems.length > 0 && (
              <section className="cs-section">
                <h2>Entry requirements</h2>
                <div className="cs-check-list">
                  {requirementItems.map((item, i) => (
                    <div className="cs-check-row" key={i}>
                      <span>✓</span><p>{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Fees & Charges */}
            {feeItems.length > 0 && (
              <section className="cs-section">
                <h2>Fees &amp; Charges</h2>
                <div className="cs-check-list">
                  {feeItems.map((item, i) => (
                    <div className="cs-check-row" key={i}>
                      <span>✓</span><p>{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Why choose Skill Scope Academy */}
            <section className="cs-section">
              <h2>Why choose Skill Scope Academy</h2>
              <div className="cs-why-grid">
                <div className="cs-why-item"><span>⭐</span> {rating.toFixed(1)} Star Google Reviews</div>
                <div className="cs-why-item"><span>🏛️</span> SafeWork NSW Approved Provider</div>
                <div className="cs-why-item"><span>📜</span> Certificate Issued Same Day</div>
                <div className="cs-why-item"><span>📅</span> Sunday Sessions Available</div>
                <div className="cs-why-item"><span>💰</span> All-Inclusive Pricing — No Hidden Fees</div>
                <div className="cs-why-item"><span>📍</span> Easy Location with Free Parking</div>
              </div>
            </section>

            {/* What students say */}
            <section className="cs-section">
              <h2>What students say</h2>
              <div className="cs-rating-summary">
                <span className="cs-rating-num">{rating.toFixed(1)}</span>
                <div>
                  <div className="cs-stars">★★★★★</div>
                  <p className="cs-rating-sub">Based on student feedback</p>
                </div>
              </div>
              <div className="cs-review-grid">
                <div className="cs-review-card">
                  <p className="cs-review-name">Ben R.</p>
                  <div className="cs-stars">★★★★★</div>
                  <p className="cs-review-text">"Great instructor, well organised and easy to book in."</p>
                </div>
                <div className="cs-review-card">
                  <p className="cs-review-name">Vincenzo F.</p>
                  <div className="cs-stars">★★★★★</div>
                  <p className="cs-review-text">"Very professional and informative session."</p>
                </div>
              </div>
            </section>

          </div>

          {/* ── Sidebar ── */}
          <div className="cs-right">
            <BookingCard />

            {course.codeOfPracticeFile && (
              <a
                href={course.codeOfPracticeFile}
                target="_blank"
                rel="noreferrer"
                className="cs-pdf-box cs-pdf-cop"
              >
                <div className="cs-pdf-brand">
                  <span className="cs-pdf-brand-skill">Skill</span>
                  <span className="cs-pdf-brand-scope">Scope</span>
                </div>
                <div className="cs-pdf-brand-sub">ACADEMY</div>
                <div className="cs-pdf-title">
                  {course.codeOfPracticeTitle || 'CODE OF PRACTICE'}
                </div>
                <div className="cs-pdf-cta">CLICK TO DOWNLOAD THE CODE OF PRACTICE [PDF]</div>
              </a>
            )}

            <a
              href="/Participant-Handbook.pdf"
              target="_blank"
              rel="noreferrer"
              className="cs-pdf-box cs-pdf-handbook"
            >
              <div className="cs-pdf-brand">
                <span className="cs-pdf-brand-skill">Skill</span>
                <span className="cs-pdf-brand-scope">Scope</span>
              </div>
              <div className="cs-pdf-brand-sub">ACADEMY</div>
              <div className="cs-pdf-title">PARTICIPANT HANDBOOK</div>
              <div className="cs-pdf-cta">CLICK TO DOWNLOAD THE PARTICIPANT HANDBOOK [PDF]</div>
            </a>

            <div className="cs-help-box">
              <p className="cs-help-title">Need help?</p>
              <p className="cs-help-text">
                Our team can answer questions about course suitability, dates, and group bookings.
              </p>
              <a href="tel:1300976097" className="cs-help-btn cs-help-call">☎ 1300 976 097</a>
              <a href="mailto:info@skillscopeacademy.edu.au" className="cs-help-btn cs-help-email">✉ Email us</a>
            </div>
          </div>

        </div>

        {/* ── Sticky bottom bar ── */}
        <div className="cs-sticky-bar">
          <div className="cs-sticky-info">
            <p className="cs-sticky-title">{course.title}</p>
            <p className="cs-sticky-meta">
              {days && <>📅 {days} {days === 1 ? 'Day' : 'Days'}</>}
              {course.location && <> &nbsp;·&nbsp; 📍 {course.location}</>}
            </p>
          </div>
          <span className="cs-sticky-price">${price.toLocaleString()}</span>
          <button className="cs-sticky-btn" onClick={() => addToCart(course, 'Standard')}>
            Book Now — Pick a Date
          </button>
        </div>

      </div>
    </MainLayout>
  )
}