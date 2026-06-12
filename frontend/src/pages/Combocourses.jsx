import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import MainLayout from '../layouts/MainLayout'
import { getCourses } from '../services/courseService'
import { useCart } from '../components/Cartcontext'
import './combocourses.css'

// ── Skeleton cards ────────────────────────────────────────────
const CardSkeletons = ({ count = 6 }) => (
  <div className="combo-grid">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="combo-card-skel">
        <div className="combo-skel-img" />
        <div className="combo-skel-body">
          <div className="combo-skel-line" style={{ width: '40%' }} />
          <div className="combo-skel-line" style={{ width: '75%', height: 20 }} />
          <div className="combo-skel-line" style={{ width: '55%' }} />
          <div className="combo-skel-line" style={{ width: '30%' }} />
        </div>
      </div>
    ))}
  </div>
)

// ── Single Combo Card ─────────────────────────────────────────
function ComboCard({ course }) {
  const navigate = useNavigate()
  const { addToCart, removeFromCart, increaseQty, decreaseQty, items } = useCart()

  const price     = Number(course.price)         || 0
  const origPrice = Number(course.originalPrice) || 0
  const vocPrice  = Number(course.vocPrice)       || 150
  const saving    = origPrice > price ? origPrice - price : 0
  const days      = course.days || (course.duration ? parseInt(course.duration, 10) || null : null)

  // pricing tiers — Standard + VOC always present
  const tiers = [
    { label: 'Standard', price, sub: days ? `${days} Day${days > 1 ? 's' : ''}` : null, strikethrough: origPrice > price ? origPrice : null },
    { label: 'VOC',      price: vocPrice, sub: 'Half day', strikethrough: null },
  ]

  const [selected, setSelected] = useState('Standard')
  const cartItem = items.find(i => i.course._id === course._id && i.option === selected)
  const qty      = cartItem?.qty || 0
  const inCart   = qty > 0

  const handleBookNow = () => {
    if (!inCart) addToCart(course, selected)
  }

  const handleIncrease = (e) => { e.stopPropagation(); increaseQty(course._id, selected) }
  const handleDecrease = (e) => {
    e.stopPropagation()
    if (qty === 1) removeFromCart(course._id, selected)
    else decreaseQty(course._id, selected)
  }

  const displayPrice = selected === 'VOC' ? vocPrice : price

  return (
    <div className="combo-card">

      {/* Image */}
      <div className="combo-card-img">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} loading="lazy" />
          : <div className="combo-card-img-ph">📖</div>
        }
        {/* Hover overlay */}
        <div className="combo-card-img-overlay">
          <button className="combo-overlay-btn" onClick={() => navigate(`/courses/${course._id}`)}>
            View Details
          </button>
        </div>
        <span className="combo-badge">Combo Courses</span>
        {days && <span className="combo-duration">{days} Day{days > 1 ? 's' : ''}</span>}
      </div>

      {/* Body */}
      <div className="combo-card-body">

        {/* Price row */}
        <div className="combo-price-row">
          <span className="combo-price">${displayPrice.toLocaleString()}</span>
          {saving > 0 && selected === 'Standard' && (
            <>
              <span className="combo-orig">${origPrice.toLocaleString()}</span>
              <span className="combo-save">Save ${saving.toLocaleString()}</span>
            </>
          )}
        </div>

        {/* Code */}
        {course.code && <p className="combo-code">{course.code}</p>}

        {/* Title */}
        <h3 className="combo-title">{course.title}</h3>

        {/* Meta */}
        <div className="combo-meta">
          {days            && <span>📅 {days} Day{days > 1 ? 's' : ''}</span>}
          {course.location && <span>📍 {course.location}</span>}
          {course.deliveryMethod && <span>👥 {course.deliveryMethod}</span>}
        </div>

        {/* SELECT OPTION */}
        <p className="combo-select-label">SELECT OPTION</p>
        <div className="combo-tiers">
          {tiers.map(tier => (
            <button
              key={tier.label}
              className={`combo-tier${selected === tier.label ? ' combo-tier-active' : ''}`}
              onClick={() => setSelected(tier.label)}
            >
              <span className="combo-tier-label">{tier.label}</span>
              <strong className="combo-tier-price">${tier.price.toLocaleString()}</strong>
              {tier.sub && <span className="combo-tier-sub">{tier.sub}</span>}
              {tier.strikethrough && (
                <span className="combo-tier-strike">${tier.strikethrough.toLocaleString()}</span>
              )}
            </button>
          ))}
        </div>

        {/* Book Now / Qty */}
        {!inCart ? (
          <button className="combo-book-btn" onClick={handleBookNow}>
            Book Now <span className="combo-book-icon">⊕</span>
          </button>
        ) : (
          <div className="combo-qty-controls">
            <button className="combo-qty-btn" onClick={handleDecrease}>−</button>
            <span className="combo-qty-num">{qty}</span>
            <button className="combo-qty-btn" onClick={handleIncrease}>+</button>
          </div>
        )}

        {/* View Details */}
        <button className="combo-details-btn" onClick={() => navigate(`/courses/${course._id}`)}>
          View Details ℹ
        </button>

      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function ComboCourses() {
  const [search, setSearch] = useState('')

  const { data: cRes, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn:  getCourses,
  })

  const allCourses   = cRes?.data?.courses || []
  const comboCourses = allCourses.filter(c => c.comboEnabled)

  const filtered = comboCourses.filter(c => {
    const q = search.toLowerCase()
    return (
      !search ||
      c.title?.toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q)
    )
  })

  return (
    <MainLayout>

      {/* ── Hero ───────────────────────────────────────── */}
      <div className="combo-hero">
        <div className="container">
          <p className="combo-hero-sub">BUNDLE &amp; SAVE</p>
          <h1 className="combo-hero-title">Combo Courses</h1>
          <p className="combo-hero-desc">
            Save more with our package deals —{' '}
            <strong>{isLoading ? '…' : comboCourses.length} packages available</strong>
          </p>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────── */}
      <div className="combo-body">
        <div className="container">

          {/* Toolbar */}
          <div className="combo-toolbar">
            <div className="combo-search-wrap">
              <span className="combo-search-icon">🔍</span>
              <input
                className="combo-search"
                placeholder="Search combo courses…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="combo-search-clear" onClick={() => setSearch('')}>✕</button>
              )}
            </div>
            <p className="combo-count">
              {isLoading ? '' : `${filtered.length} package${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <CardSkeletons />
          ) : filtered.length === 0 ? (
            <div className="combo-empty">
              <p>😕 No combo courses found{search ? ` for "${search}"` : ''}.</p>
              {search && (
                <button className="combo-clear-btn" onClick={() => setSearch('')}>Clear search</button>
              )}
            </div>
          ) : (
            <div className="combo-grid">
              {filtered.map(course => (
                <ComboCard key={course._id} course={course} />
              ))}
            </div>
          )}

        </div>
      </div>

    </MainLayout>
  )
}