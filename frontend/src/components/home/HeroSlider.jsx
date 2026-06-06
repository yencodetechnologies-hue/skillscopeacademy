import { useEffect, useState, useCallback, useRef } from 'react'
import { getBanners } from '../../services/adminService'
import './heroslider.css'

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600',
]

export default function HeroSlider() {
  const [slides, setSlides]     = useState([])
  const [current, setCurrent]   = useState(0)
  const [loaded, setLoaded]     = useState(false)
  const timerRef                = useRef(null)

  // Load banners from API (admin-managed slider images)
  useEffect(() => {
    getBanners()
      .then(r => {
        const banners = (r.data?.data || r.data?.banners || []).filter(b => b.isActive && b.image)
        setSlides(banners.length > 0 ? banners : FALLBACK_IMAGES.map((img, i) => ({ _id: i, image: img })))
      })
      .catch(() => {
        setSlides(FALLBACK_IMAGES.map((img, i) => ({ _id: i, image: img })))
      })
      .finally(() => setLoaded(true))
  }, [])

  // Auto-advance every 5s
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % slides.length)
    }, 5000)
  }, [slides.length])

  useEffect(() => {
    if (slides.length > 1) startTimer()
    return () => clearInterval(timerRef.current)
  }, [slides.length, startTimer])

  const goTo = (idx) => {
    setCurrent(idx)
    startTimer() // reset timer on manual nav
  }
  const prev = () => goTo((current - 1 + slides.length) % slides.length)
  const next = () => goTo((current + 1) % slides.length)

  if (!loaded || slides.length === 0) return null

  return (
    <div className="hero-slider">
      {slides.map((slide, i) => (
        <div
          key={slide._id}
          className={`hero-slide${i === current ? ' hero-slide-active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
          aria-hidden={i !== current}
        />
      ))}

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button className="hero-arrow hero-arrow-prev" onClick={prev} aria-label="Previous slide">‹</button>
          <button className="hero-arrow hero-arrow-next" onClick={next} aria-label="Next slide">›</button>

          {/* Dots */}
          <div className="hero-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`hero-dot${i === current ? ' active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}