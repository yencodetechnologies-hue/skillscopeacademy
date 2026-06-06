// import { upcomingCourses } from '../../services/mockData'
// import './upcoming.css'

// const UpcomingCourses = () => {
//   return (
//     <section className='upcoming'>
//       <div className='container'>
//         <div className='upcoming-ticker-wrap'>
//           <span className='upcoming-label'>DON&apos;T MISS OUT</span>
//           <div className='upcoming-ticker'>
//             {[...upcomingCourses, ...upcomingCourses].map((c, i) => (
//               <div key={i} className='upcoming-item'>
//                 <div className='upcoming-date'>
//                   <span className='date-day'>{c.day}</span>
//                   <span className='date-month'>{c.month}</span>
//                 </div>
//                 <div className='upcoming-info'>
//                   <p className='upcoming-title'>{c.title}</p>
//                   <p className='upcoming-meta'>{c.time} · {c.price}</p>
//                 </div>
//                 <button className={`upcoming-book ${c.status === 'Full' ? 'btn-full' : 'btn-available'}`}>
//                   {c.status === 'Full' ? 'Full' : 'Book'}
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// export default UpcomingCourses

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../services/api'
import { upcomingCourses as fallbackCourses } from '../../services/mockData'
import './upcoming.css'

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleString('en-AU', { month: 'short' }).toUpperCase(),
  }
}

const UpcomingCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const tickerRef = useRef(null)
  const animRef = useRef(null)
  const posRef = useRef(0)
  const navigate = useNavigate()

  // Fetch scheduled courses from API
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await API.get('/schedules')
        const schedules = res.data?.schedules || []
        // Only upcoming (today or future), sort by date, limit 20
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const upcoming = schedules
          .filter(s => s.isActive && new Date(s.date) >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 20)

        if (upcoming.length > 0) {
          setCourses(upcoming)
        } else {
          // fallback to mockData formatted
          setCourses(fallbackCourses.map(c => ({
            _id: c.id,
            date: `2025-${c.month === 'MAY' ? '05' : '06'}-${c.day}`,
            startTime: c.time,
            activeSlots: c.status === 'Full' ? 0 : 5,
            courseId: { title: c.title },
            price: c.price,
          })))
        }
      } catch {
        // On API error, use fallback mock data
        setCourses(fallbackCourses.map(c => ({
          _id: c.id,
          date: `2025-${c.month === 'MAY' ? '05' : '06'}-${c.day}`,
          startTime: c.time,
          activeSlots: c.status === 'Full' ? 0 : 5,
          courseId: { title: c.title },
          price: c.price,
        })))
      } finally {
        setLoading(false)
      }
    }
    fetchSchedules()
  }, [])

  // Auto-scroll animation
  useEffect(() => {
    if (!courses.length || loading) return
    const ticker = tickerRef.current
    if (!ticker) return

    let speed = 0.6
    let isPaused = false

    const animate = () => {
      if (!isPaused) {
        posRef.current -= speed
        // Reset when first set scrolled fully out of view
        const half = ticker.scrollWidth / 2
        if (Math.abs(posRef.current) >= half) {
          posRef.current = 0
        }
        ticker.style.transform = `translateX(${posRef.current}px)`
      }
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    const pause = () => { isPaused = true }
    const resume = () => { isPaused = false }
    ticker.addEventListener('mouseenter', pause)
    ticker.addEventListener('mouseleave', resume)

    return () => {
      cancelAnimationFrame(animRef.current)
      ticker.removeEventListener('mouseenter', pause)
      ticker.removeEventListener('mouseleave', resume)
    }
  }, [courses, loading])

  if (loading) {
    return (
      <section className='upcoming'>
        <div className='container'>
          <div className='upcoming-ticker-wrap'>
            <span className='upcoming-label'>DON&apos;T MISS OUT</span>
            <div className='upcoming-loading'>Loading upcoming courses...</div>
          </div>
        </div>
      </section>
    )
  }

  // Duplicate for seamless infinite loop
  const doubled = [...courses, ...courses]

  return (
    <section className='upcoming'>
      <div className='container'>
        <div className='upcoming-ticker-wrap'>
          <span className='upcoming-label'>DON&apos;T MISS OUT</span>
          <div className='upcoming-ticker-viewport'>
            <div className='upcoming-ticker' ref={tickerRef}>
              {doubled.map((c, i) => {
                const { day, month } = formatDate(c.date)
                const isFull = c.activeSlots === 0
                const title = c.courseId?.title || 'Course'
                const price = c.price || '$—'
                return (
                  <div key={`${c._id}-${i}`} className='upcoming-item'>
                    <div className='upcoming-date'>
                      <span className='date-day'>{day}</span>
                      <span className='date-month'>{month}</span>
                    </div>
                    <div className='upcoming-info'>
                      <p className='upcoming-title'>{title}</p>
                      <p className='upcoming-meta'>{c.startTime} · {price}</p>
                    </div>
                    <button
                      className={`upcoming-book ${isFull ? 'btn-full' : 'btn-available'}`}
                      onClick={() => !isFull && navigate('/courses')}
                      disabled={isFull}
                    >
                      {isFull ? 'Full' : 'Book'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UpcomingCourses
