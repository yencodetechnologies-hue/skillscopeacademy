import "../../styles/Hero.css"
import TrustBar from "./TrustBar"
import sliderOne from "../../assets/Slider1.jpeg"
import sliderTwo from "../../assets/Slider2.jpeg"
import sliderThree from "../../assets/Slider3.jpeg"
import { useNavigate } from "react-router-dom"
import { API_URL } from "../../data/service"
import { ACTIVE_COURSES_URL, filterActiveCourses } from "../../utils/courseStatus"
import { useState,useRef,useEffect } from "react"
import { cdnImage } from "../../utils/cdnImage"

// Builds the short overlay copy for a course from real API data, with a
// safe fallback while courses are still loading.
function buildSlideInfo(course) {
  if (!course) {
    return { badge: "COURSES", title: "Explore Our Courses", desc: "Nationally recognised training across a range of industries." }
  }
  const descText = Array.isArray(course.description)
    ? course.description.filter(Boolean).join(" ")
    : (course.description || "")
  const trimmedDesc = descText.length > 110 ? `${descText.slice(0, 110).trim()}…` : descText
  return {
    badge: course.category || "COURSES",
    title: course.title || "Explore Our Courses",
    desc: trimmedDesc || "Nationally recognised training designed for real workplaces.",
  }
}

function Hero() {
  const navigate = useNavigate()
  const fallbackImages = [sliderOne, sliderTwo, sliderThree]
  // Admin-managed sliders are loaded async; until then we show the bundled
  // defaults so the page never flashes blank.
  const [images, setImages] = useState(fallbackImages)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const [animating, setAnimating] = useState(false)
  const [pubsearch, pubsetSearch] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [paused, setPaused] = useState(false)
  const currentIndexRef = useRef(0)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(ACTIVE_COURSES_URL(API_URL))
        if (!res.ok) throw new Error("Failed to fetch courses")
        const data = await res.json()
        setAllCourses(filterActiveCourses(data))
      } catch (error) {
        console.error("Error fetching courses:", error)
      }
    }
    fetchCourses()
  }, [])

  // Pull active sliders from the admin module. Replace fallbacks only if
  // we actually got at least one URL — otherwise keep the bundled images.
  useEffect(() => {
    let alive = true
    fetch(`${API_URL}/api/sliders?active=true`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(payload => {
        if (!alive) return
        const list = (payload?.data || [])
          .map(s => s?.imageUrl)
          .filter(Boolean)
        if (list.length > 0) {
          setImages(list)
          currentIndexRef.current = 0
          setCurrentIndex(0)
          setNextIndex(list.length > 1 ? 1 : 0)
        }
      })
      .catch(() => { /* keep fallback */ })
    return () => { alive = false }
  }, [])

  // Courses with an image, used to drive the hero slider card so it shows
  // real course photos + titles fetched from the API.
  const sliderCourses = allCourses.filter(c => c?.image).slice(0, 6)
  const slideCount = sliderCourses.length || images.length
  const slideIndex = sliderCourses.length ? currentIndex % sliderCourses.length : currentIndex
  const activeCourse = sliderCourses[slideIndex]
  const slideInfo = buildSlideInfo(activeCourse)
  const slideImage = activeCourse
    ? cdnImage(activeCourse.image, { w: 700 })
    : cdnImage(images[currentIndex], { w: 700 })

  const goToSlide = (targetIndex, immediate = false) => {
    const total = images.length
    const next = ((targetIndex % total) + total) % total

    // Manual navigation (arrow clicks) should feel instant — update the
    // slide content and background right away instead of waiting on the
    // crossfade timeout used for the automatic rotation.
    if (immediate) {
      currentIndexRef.current = next
      setCurrentIndex(next)
      setNextIndex((next + 1) % total)
      setAnimating(false)
      return
    }

    setNextIndex(next)
    setAnimating(true)
    setTimeout(() => {
      currentIndexRef.current = next
      setCurrentIndex(next)
      setAnimating(false)
    }, 1200)
  }

  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      goToSlide(currentIndexRef.current + 1)
    }, 4000)
    return () => clearInterval(interval)
  }, [paused, images.length])

  useEffect(() => {
    if (pubsearch.trim()) {
      const filtered = allCourses.filter(c =>
        c.title.toLowerCase().includes(pubsearch.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }, [pubsearch])

  return (
    <section className="hero">
      <div className="hero-bg-wrapper">
        <div
          className="hero-bg-layer"
          style={{ backgroundImage: `url(${cdnImage(images[currentIndex], { w: 1920 })})` }}
        />
        <div
          className={`hero-next-layer ${animating ? "hero-next-animate" : ""}`}
          style={{ backgroundImage: `url(${cdnImage(images[nextIndex], { w: 1920 })})` }}
        />
        <div className="hero-overlay"></div>
      </div>
      <div className="announcement-bar">
        <p>🔥 SUNDAY CLASSES AVAILABLE • ENROLL NOW • LIMITED SEATS 🔥     NATIONALLY RECOGNIZED CERTIFICATES •      GET CERTIFIED WITH CREDENTIALS THAT ARE RECOGNIZED ACROSS ALL STATES AND TERRITORIES </p>
      </div>
      <div className="hero-container">
       <div className="hero-pill">
         <span className="hero-pill-dot" />
         <span>NATIONALLY RECOGNISED TRAINING</span>
       </div>
       <div className="hero-top">

        {/* LEFT */}
        <div className="hero-left">
          <h1>
            Australia's trusted<br />
            <span>safety training</span>
            provider.
          </h1>
          <p>
            Accredited courses for construction, civil, and industrial
            workplaces. Get your team certified fast with training that
            meets every Australian compliance standard.
          </p>

          <div className="hero-buttons">
            <button className="hero-btn-primary" onClick={() => {
              const el = document.getElementById("courses")
              if (el) {
                el.scrollIntoView({ behavior: "smooth" })
              } else {
                navigate("/#courses")
              }
            }}>
              <i className="fa-solid fa-book-open"></i> View All Courses
            </button>

            <button className="hero-btn-secondary" onClick={() => navigate("/contact")}>
              Get in touch
            </button>
          </div>

        </div>

        {/* RIGHT CARD — course image slider */}
        <div
          className="hero-slider-card"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="hero-slider-image-wrap">
            <img
              key={activeCourse?._id || currentIndex}
              src={slideImage}
              alt={slideInfo.title}
              className="hero-slider-img"
            />

            <div className="hero-slider-topcontrols">
              <button
                type="button"
                className="hero-slider-iconbtn"
                aria-label="Expand"
                onClick={() => window.open(slideImage, "_blank")}
              >
                <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
              </button>
              <button
                type="button"
                className="hero-slider-iconbtn"
                aria-label={paused ? "Play" : "Pause"}
                onClick={() => setPaused(p => !p)}
              >
                <i className={`fa-solid ${paused ? "fa-play" : "fa-pause"}`}></i>
              </button>
            </div>

            <button
              type="button"
              className="hero-slider-arrow hero-slider-arrow-left"
              aria-label="Previous slide"
              onClick={() => goToSlide(currentIndexRef.current - 1, true)}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
              type="button"
              className="hero-slider-arrow hero-slider-arrow-right"
              aria-label="Next slide"
              onClick={() => goToSlide(currentIndexRef.current + 1, true)}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>

            <div
              className="hero-slider-overlay"
              onClick={() => activeCourse && navigate(`/course/${activeCourse.slug}`)}
            >
              <span className="hero-slider-badge">{slideInfo.badge}</span>
              <h4 className="hero-slider-title">{slideInfo.title}</h4>

              <div className="hero-slider-timeline">
                {Array.from({ length: slideCount }).map((_, i) => (
                  <span key={i} className="hero-slider-dash">
                    {i === slideIndex && !paused ? (
                      <span
                        key={`fill-${slideIndex}`}
                        className="hero-slider-dash-fill hero-slider-dash-fill-active"
                      />
                    ) : (
                      <span
                        className="hero-slider-dash-fill"
                        style={{ width: i < slideIndex ? "100%" : "0%" }}
                      />
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

       </div>

        {/* TRUST BAR — inside the hero, below the left copy / slider row */}
        <div className="hero-trustbar-wrap">
          <TrustBar />
        </div>

      </div>
    </section>
  )
}

export default Hero