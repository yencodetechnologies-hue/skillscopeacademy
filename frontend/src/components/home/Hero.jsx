// import { useState, useEffect, useCallback, useRef } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { heroData, statsData } from '../../services/mockData'
// import { FaBook, FaUser, FaPhone } from 'react-icons/fa'
// import { getCourses } from '../../services/courseService'
// import HeroSlider from './HeroSlider'
// import './hero.css'

// const buttonRoutes = {
//   'Start Enrolment Now →': '/courses',
//   'VOC (Verification of Competency)': '/voc',
// }

// // ── Course Card Slider (right side) ──────────────────────────
// function CourseCardSlider({ navigate }) {
//   const [courses, setCourses]   = useState([])
//   const [current, setCurrent]   = useState(0)
//   const timerRef                = useRef(null)

//   useEffect(() => {
//     getCourses()
//       .then(r => {
//         const all = r.data?.courses || r.data?.data || r.data || []
//         // Use courses that have thumbnails; fallback to all
//         const withImg = all.filter(c => c.thumbnail)
//         setCourses((withImg.length > 0 ? withImg : all).slice(0, 6))
//       })
//       .catch(() => {})
//   }, [])

//   const startTimer = useCallback(() => {
//     clearInterval(timerRef.current)
//     if (courses.length < 2) return
//     timerRef.current = setInterval(() => {
//       setCurrent(c => (c + 1) % courses.length)
//     }, 4000)
//   }, [courses.length])

//   useEffect(() => {
//     startTimer()
//     return () => clearInterval(timerRef.current)
//   }, [startTimer])

//   const goTo = (idx) => { setCurrent(idx); startTimer() }
//   const prev = () => goTo((current - 1 + courses.length) % courses.length)
//   const next = () => goTo((current + 1) % courses.length)

//   if (courses.length === 0) return (
//     <div className="hcc-wrap hcc-empty">
//       <div className="hcc-loading">Loading courses…</div>
//     </div>
//   )

//   const course = courses[current]
//   const price  = Number(course.price) || 0
//   const orig   = Number(course.originalPrice) || 0

//   return (
//     <div className="hcc-wrap">
//       {/* Course image */}
//       <div className="hcc-img-wrap">
//         {course.thumbnail
//           ? <img src={course.thumbnail} alt={course.title} className="hcc-img" />
//           : <div className="hcc-img-ph">📖</div>
//         }

//         {/* Category pill */}
//         {course.category?.name && (
//           <span className="hcc-cat-pill">
//             <span className="hcc-cat-dot" />
//             {course.category.name.toUpperCase()}
//           </span>
//         )}

//         {/* Slide dots indicator */}
//         {courses.length > 1 && (
//           <div className="hcc-progress">
//             {courses.map((_, i) => (
//               <button
//                 key={i}
//                 className={`hcc-dot${i === current ? ' active' : ''}`}
//                 onClick={() => goTo(i)}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Course info footer */}
//       <div className="hcc-info">
//         <div className="hcc-info-text">
//           <h3 className="hcc-title">{course.title}</h3>
//           {course.description && (
//             <p className="hcc-desc">
//               {course.description.length > 80
//                 ? course.description.slice(0, 80) + '…'
//                 : course.description}
//             </p>
//           )}
//           {price > 0 && (
//             <div className="hcc-price-row">
//               <span className="hcc-price">${price.toLocaleString()}</span>
//               {orig > price && (
//                 <span className="hcc-orig">${orig.toLocaleString()}</span>
//               )}
//             </div>
//           )}
//         </div>
//         <button
//           className="hcc-book-btn"
//           onClick={() => navigate(`/courses/${course._id}`)}
//         >
//           View →
//         </button>
//       </div>

//       {/* Prev / Next arrows */}
//       {courses.length > 1 && (
//         <>
//           <button className="hcc-arrow hcc-prev" onClick={prev}>‹</button>
//           <button className="hcc-arrow hcc-next" onClick={next}>›</button>
//         </>
//       )}
//     </div>
//   )
// }

// // ── Main Hero ─────────────────────────────────────────────────
// const Hero = () => {
//   const navigate = useNavigate()

//   return (
//     <section className="hero">

//       {/* Background slider */}
//       <div className="hero-slider-wrap">
//         <HeroSlider />
//       </div>

//       {/* Single dark tint via ::before on .hero */}
//       <div className="hero-overlay">
//         <div className="container hero-wrapper">

//           {/* ── Main row: left text + right course card ── */}
//           <div className="hero-content">

//             {/* LEFT */}
//             <div className="hero-left">
//               <h1>
//                 {heroData.heading1}<br />
//                 {heroData.heading2}<br />
//                 <span className="hero-highlight">{heroData.highlight}</span>
//               </h1>
//               <p className="hero-desc">{heroData.description}</p>

//               {/* Buttons BELOW heading — no search box */}
//               <div className="hero-action-bar">
//                 <button
//                   className="hero-primary-btn"
//                   onClick={() => navigate('/courses')}
//                 >
//                   <FaBook /> View All Courses
//                 </button>
//                 <button
//                   className="hero-secondary-btn"
//                   onClick={() => navigate('/contact')}
//                 >
//                   <FaPhone /> Get in touch
//                 </button>
//               </div>
//             </div>

//             {/* RIGHT — Course image card slider */}
//             <CourseCardSlider navigate={navigate} />

//           </div>
//         </div>
//       </div>

//       {/* Stats strip — inside hero so slider covers it */}
//       <div className="hero-stats">
//         <div className="hero-stats-inner">
//           {statsData.map((s, i) => (
//             <div key={i} className="hero-stat-item">
//               <span className="hero-stat-icon">{s.icon}</span>
//               <div>
//                 <strong>{s.value}</strong>
//                 <span>{s.label}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//     </section>
//   )
// }

// export default Hero

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { statsData } from '../../services/mockData'
import { FaBook } from 'react-icons/fa'
import { getCourses } from '../../services/courseService'
import HeroSlider from './HeroSlider'
import './hero.css'

// ── Course Slideshow (right side) ────────────────────────────
function CourseSlideshow({ navigate }) {
  const [courses, setCourses]   = useState([])
  const [current, setCurrent]   = useState(0)
  const [entering, setEntering] = useState(false)
  const [paused, setPaused]     = useState(false)
  const timerRef                = useRef(null)
  const DURATION                = 4500

  useEffect(() => {
    getCourses()
      .then(r => {
        const all = r.data?.courses || r.data?.data || r.data || []
        const withImg = all.filter(c => c.thumbnail)
        setCourses((withImg.length > 0 ? withImg : all).slice(0, 6))
      })
      .catch(() => {})
  }, [])

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    if (paused || courses.length < 2) return
    timerRef.current = setInterval(() => {
      setCurrent(c => {
        const next = (c + 1) % courses.length
        setEntering(true)
        setTimeout(() => setEntering(false), 900)
        return next
      })
    }, DURATION)
  }, [paused, courses.length])

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [startTimer])

  const goTo = (idx) => {
    setEntering(true)
    setCurrent(idx)
    setTimeout(() => setEntering(false), 900)
    startTimer()
  }
  const prev = () => goTo((current - 1 + courses.length) % courses.length)
  const next = () => goTo((current + 1) % courses.length)

  if (courses.length === 0) return (
    <div className="ss-wrap ss-empty"><div className="ss-spinner" /></div>
  )

  return (
    <div className="ss-wrap">
      {/* Controls — top right */}
      <div className="ss-controls">
        <button className="ss-ctrl" onClick={() => setPaused(p => !p)}>
          {paused ? '▶' : '⏸'}
        </button>
        <button className="ss-ctrl" onClick={prev}>‹</button>
        <button className="ss-ctrl" onClick={next}>›</button>
      </div>

      {/* Slides */}
      {courses.map((slide, i) => (
        <div
          key={slide._id}
          className={`ss-slide${i === current ? ` ss-active${entering ? ' ss-entering' : ''}` : ''}`}
          onClick={() => navigate(`/courses/${slide._id}`)}
        >
          {slide.thumbnail
            ? <img src={slide.thumbnail} alt={slide.title} />
            : <div className="ss-ph">📖</div>
          }
          <div className="ss-overlay" />
          <div className="ss-content">
            {slide.category?.name && (
              <div className="ss-tag">
                <span className="ss-tag-dot" />
                <span>{slide.category.name.toUpperCase()}</span>
              </div>
            )}
            <h3 className="ss-title">{slide.title}</h3>
            {slide.description && (
              <p className="ss-sub">
                {slide.description.length > 90
                  ? slide.description.slice(0, 90) + '…'
                  : slide.description}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Thumb strip — each pill has a fill that runs like a timer */}
      {courses.length > 1 && (
        <div className="ss-thumbs">
          {courses.map((_, i) => (
            <button key={i} className={`ss-thumb${i === current ? ' ss-thumb-on' : ''}`} onClick={() => goTo(i)}>
              {i === current && !paused
                ? <span key={`fill-${current}`} className="ss-thumb-fill ss-thumb-fill-active" style={{ animationDuration: `${DURATION}ms` }} />
                : i < current
                  ? <span className="ss-thumb-fill" style={{ width: '100%' }} />
                  : <span className="ss-thumb-fill" style={{ width: '0%' }} />
              }
            </button>
          ))}
        </div>
      )}

      {/* Bottom red progress bar — runs like a timer for the current slide */}
      <div className="ss-progress">
        {!paused && courses.length > 1 && (
          <div
            key={`bar-${current}`}
            className="ss-bar ss-bar-animate"
            style={{ animationDuration: `${DURATION}ms` }}
          />
        )}
      </div>
    </div>
  )
}

// ── Hero ──────────────────────────────────────────────────────
const Hero = () => {
  const navigate = useNavigate()

  return (
    <section className="hero">

      {/* Background slider */}
      <div className="hero-slider-wrap">
        <HeroSlider />
      </div>

      {/* Dark tint */}
      <div className="hero-overlay">
        <div className="hero-inner">

          {/* ── LEFT — no box, text sits on background ── */}
          <div className="hero-left">

            {/* 🟢 Green dot pill — new addition */}
            <div className="hero-pill">
              <span className="hero-pill-dot" />
              <span>NATIONALLY RECOGNISED TRAINING</span>
            </div>

            {/* Updated heading */}
            <h1 className="hero-h1">
              Australia's trusted<br />
              <span className="hero-blue">safety training</span><br />
              provider.
            </h1>

            {/* Updated description */}
            <p className="hero-desc">
              Accredited courses for construction, civil, and industrial
              workplaces. Get your team certified fast with training that
              meets every Australian compliance standard.
            </p>

            {/* Buttons — same as before */}
            <div className="hero-btns">
              <button className="hero-btn-primary" onClick={() => navigate('/courses')}>
                <FaBook /> View All Courses
              </button>
              <button className="hero-btn-ghost" onClick={() => navigate('/contact')}>
                Get in touch
              </button>
            </div>

          </div>

          {/* ── RIGHT — Course slideshow ── */}
          <CourseSlideshow navigate={navigate} />

        </div>
      </div>

      {/* Stats strip — full width at bottom, same as before */}
      <div className="hero-stats">
        <div className="hero-stats-inner">
          {statsData.map((s, i) => (
            <div key={i} className="hero-stat-item">
              <span className="hero-stat-icon">{s.icon}</span>
              <div>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}

export default Hero