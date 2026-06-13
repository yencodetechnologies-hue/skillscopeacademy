import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../services/api'
import { upcomingCourses as fallbackCourses } from '../../services/mockData'
import './upcoming.css'

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return {
    day:   d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleString('en-AU', { month: 'short' }).toUpperCase(),
  }
}

const spotsLabel = (slots) => {
  if (slots === 0) return { text: 'Full', cls: 'full' }
  if (slots <= 3)  return { text: `⚠ ${slots} left`, cls: 'low-spots' }
  return { text: `${slots} spots`, cls: '' }
}

const UpcomingCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const trackRef  = useRef(null)
  const animRef   = useRef(null)
  const posRef    = useRef(0)
  const navigate  = useNavigate()

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res       = await API.get('/schedules')
        const schedules = res.data?.schedules || []
        const today     = new Date(); today.setHours(0,0,0,0)
        const upcoming  = schedules
          .filter(s => s.isActive && new Date(s.date) >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 20)
        if (upcoming.length > 0) {
          setCourses(upcoming)
        } else {
          setCourses(fallbackCourses.map(c => ({
            _id:         c.id,
            date:        `2025-${c.month === 'MAY' ? '05' : '06'}-${c.day}`,
            startTime:   c.time,
            activeSlots: c.status === 'Full' ? 0 : 8,
            location:    c.location || 'Sydney CBD',
            courseId:    { title: c.title, category: { name: c.category || 'Course' } },
            price:       c.price,
          })))
        }
      } catch {
        setCourses(fallbackCourses.map(c => ({
          _id:         c.id,
          date:        `2025-${c.month === 'MAY' ? '05' : '06'}-${c.day}`,
          startTime:   c.time,
          activeSlots: c.status === 'Full' ? 0 : 8,
          location:    c.location || 'Sydney CBD',
          courseId:    { title: c.title, category: { name: c.category || 'Course' } },
          price:       c.price,
        })))
      } finally {
        setLoading(false)
      }
    }
    fetchSchedules()
  }, [])

  /* Auto-scroll */
  useEffect(() => {
    if (!courses.length || loading) return
    const track = trackRef.current
    if (!track) return
    let speed    = 0.5
    let paused   = false

    const animate = () => {
      if (!paused) {
        posRef.current -= speed
        const half = track.scrollWidth / 2
        if (Math.abs(posRef.current) >= half) posRef.current = 0
        track.style.transform = `translateX(${posRef.current}px)`
      }
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)

    const pause  = () => { paused = true }
    const resume = () => { paused = false }
    track.addEventListener('mouseenter', pause)
    track.addEventListener('mouseleave', resume)
    return () => {
      cancelAnimationFrame(animRef.current)
      track.removeEventListener('mouseenter', pause)
      track.removeEventListener('mouseleave', resume)
    }
  }, [courses, loading])

  if (loading) {
    return (
      <section className="upcoming">
        <div className="container">
          <div className="upcoming-header-row">
            <div className="upcoming-header-left">
              <span className="upcoming-label">DON'T MISS OUT</span>
              <span className="upcoming-heading">Upcoming Courses</span>
            </div>
          </div>
          <div className="upcoming-loading">Loading upcoming courses…</div>
        </div>
      </section>
    )
  }

  const doubled = [...courses, ...courses]

  return (
    <section className="upcoming">
      <div className="container">
        <div className="upcoming-header-row">
          <div className="upcoming-header-left">
            <span className="upcoming-label">DON'T MISS OUT</span>
            <span className="upcoming-heading">Upcoming Courses</span>
          </div>
          <button className="upcoming-view-all" onClick={() => navigate('/courses')}>
            View All →
          </button>
        </div>

        <div className="upcoming-slider-viewport">
          <div className="upcoming-slider-track" ref={trackRef}>
            {doubled.map((c, i) => {
              const { day, month }   = formatDate(c.date)
              const isFull           = c.activeSlots === 0
              const spots            = spotsLabel(c.activeSlots)
              const title            = c.courseId?.title || 'Course'
              const categoryName     = c.courseId?.category?.name || c.sessionType || 'Course'
              const price            = c.price ? `$${c.price}` : ''
              const sessionTypeLabel = c.sessionType && c.sessionType !== 'General' ? c.sessionType : null

              return (
                <div
                  key={`${c._id}-${i}`}
                  className="upcoming-card"
                  onClick={() => !isFull && navigate('/courses')}
                >
                  {/* Date Block */}
                  <div className="upcoming-date-block">
                    <span className="upc-day">{day}</span>
                    <span className="upc-month">{month}</span>
                  </div>

                  {/* Card Body */}
                  <div className="upcoming-card-body">
                    <div className="upcoming-card-top">
                      <span className="upc-category-tag">{categoryName.toUpperCase()}</span>
                      <span className={`upc-spots-badge ${spots.cls}`}>{spots.text}</span>
                    </div>

                    <div className="upcoming-card-title">{title}</div>

                    <div className="upcoming-card-meta">
                      {c.startTime && (
                        <span className="upc-meta-row">
                          <span className="upc-meta-icon">🕐</span>
                          {c.startTime} · {sessionTypeLabel || 'Full Day'}
                        </span>
                      )}
                      {c.location && (
                        <span className="upc-meta-row">
                          <span className="upc-meta-icon">📍</span>
                          {c.location}
                        </span>
                      )}
                    </div>

                    <div className="upcoming-card-footer">
                      {price && <span className="upc-price">{price}</span>}
                      <button
                        className="upc-book-btn"
                        onClick={e => { e.stopPropagation(); !isFull && navigate('/courses') }}
                        disabled={isFull}
                      >
                        {isFull ? 'Full' : 'Book →'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default UpcomingCourses