import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { useCart } from '../components/Cartcontext'
import API from '../services/api'
import './coursesingle.css'

export default function CourseSingle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, removeFromCart, increaseQty, decreaseQty, items } = useCart()

  const [course, setCourse]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState('overview')

  useEffect(() => {
    setLoading(true)
    API.get(`/courses/${id}`)
      .then(r => {
        const c = r.data?.course || r.data?.data || r.data
        setCourse(c)
      })
      .catch(() => setError('Course not found.'))
      .finally(() => setLoading(false))
  }, [id])

  const cartItem = items.find(i => i.course._id === id && i.option === 'Standard')
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

  return (
    <MainLayout>
      <div className="cs-page">

        {/* ── Breadcrumb ── */}
        <div className="cs-breadcrumb">
          <div className="container">
            <span onClick={() => navigate('/')} className="cs-bc-link">Home</span>
            <span className="cs-bc-sep">›</span>
            <span onClick={() => navigate('/courses')} className="cs-bc-link">Courses</span>
            <span className="cs-bc-sep">›</span>
            <span className="cs-bc-current">{course.title}</span>
          </div>
        </div>

        <div className="container cs-inner">

          {/* ── LEFT: details ── */}
          <div className="cs-left">

            {/* Hero image */}
            <div className="cs-hero-img">
              {course.thumbnail
                ? <img src={course.thumbnail} alt={course.title} />
                : <div className="cs-img-ph">📖</div>
              }
              {course.category?.name && (
                <span className="cs-badge">{course.category.name}</span>
              )}
            </div>

            {/* Tabs */}
            <div className="cs-tabs">
              {['overview', 'details', 'instructor'].map(t => (
                <button
                  key={t}
                  className={`cs-tab${tab === t ? ' cs-tab-active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="cs-tab-body">
              {tab === 'overview' && (
                <div className="cs-overview">
                  <h2>{course.title}</h2>
                  <p className="cs-desc">
                    {course.description || 'No description available.'}
                  </p>
                  {course.outcomes && course.outcomes.length > 0 && (
                    <>
                      <h3>What You'll Learn</h3>
                      <ul className="cs-outcomes">
                        {course.outcomes.map((o, i) => (
                          <li key={i}><span className="cs-check">✓</span>{o}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
              {tab === 'details' && (
                <div className="cs-details">
                  <div className="cs-detail-grid">
                    {days && (
                      <div className="cs-detail-item">
                        <span className="cs-detail-icon">📅</span>
                        <div>
                          <p className="cs-detail-label">Duration</p>
                          <p className="cs-detail-val">{days} {days === 1 ? 'Day' : 'Days'}</p>
                        </div>
                      </div>
                    )}
                    {course.location && (
                      <div className="cs-detail-item">
                        <span className="cs-detail-icon">📍</span>
                        <div>
                          <p className="cs-detail-label">Location</p>
                          <p className="cs-detail-val">{course.location}</p>
                        </div>
                      </div>
                    )}
                    {course.instructor && (
                      <div className="cs-detail-item">
                        <span className="cs-detail-icon">👥</span>
                        <div>
                          <p className="cs-detail-label">Instructor</p>
                          <p className="cs-detail-val">{course.instructor}</p>
                        </div>
                      </div>
                    )}
                    {course.level && (
                      <div className="cs-detail-item">
                        <span className="cs-detail-icon">🎯</span>
                        <div>
                          <p className="cs-detail-label">Level</p>
                          <p className="cs-detail-val">{course.level}</p>
                        </div>
                      </div>
                    )}
                    {course.language && (
                      <div className="cs-detail-item">
                        <span className="cs-detail-icon">🌐</span>
                        <div>
                          <p className="cs-detail-label">Language</p>
                          <p className="cs-detail-val">{course.language}</p>
                        </div>
                      </div>
                    )}
                    {course.certificate !== undefined && (
                      <div className="cs-detail-item">
                        <span className="cs-detail-icon">🏆</span>
                        <div>
                          <p className="cs-detail-label">Certificate</p>
                          <p className="cs-detail-val">{course.certificate ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {tab === 'instructor' && (
                <div className="cs-instructor">
                  <div className="cs-instructor-avatar">👤</div>
                  <div>
                    <h3>{course.instructor || 'Instructor'}</h3>
                    <p className="cs-instructor-role">Course Instructor</p>
                    <p className="cs-instructor-bio">
                      {course.instructorBio || 'Experienced industry professional delivering nationally recognised training.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: booking card ── */}
          <div className="cs-right">
            <div className="cs-booking-card">

              <div className="cs-price-row">
                <span className="cs-price">${price.toLocaleString()}</span>
                {saving > 0 && (
                  <>
                    <span className="cs-orig-price">${origPrice.toLocaleString()}</span>
                    <span className="cs-save">Save ${saving.toLocaleString()}</span>
                  </>
                )}
              </div>

              <h2 className="cs-title">{course.title}</h2>

              <div className="cs-meta-list">
                {days && (
                  <div className="cs-meta-row">
                    <span>📅</span>
                    <span>{days} {days === 1 ? 'Day' : 'Days'}</span>
                  </div>
                )}
                {course.instructor && (
                  <div className="cs-meta-row">
                    <span>👥</span>
                    <span>{course.instructor}</span>
                  </div>
                )}
                {course.location && (
                  <div className="cs-meta-row">
                    <span>📍</span>
                    <span>{course.location}</span>
                  </div>
                )}
              </div>

              <p className="cs-option-label">SELECT OPTION</p>
              <div className="cs-option-box cs-option-active">
                <span>Standard</span>
                <strong>${price.toLocaleString()}</strong>
              </div>
              {course.vocPrice && (
                <div className="cs-option-box">
                  <span>VOC Renewal</span>
                  <strong>${Number(course.vocPrice).toLocaleString()}</strong>
                </div>
              )}

              {/* Add to cart / Qty controls */}
              {!inCart ? (
                <button
                  className="cs-book-btn"
                  onClick={() => addToCart(course, 'Standard')}
                >
                  Book Now →
                </button>
              ) : (
                <div className="cs-qty-controls">
                  <button
                    className="cs-qty-btn"
                    onClick={() => qty === 1 ? removeFromCart(course._id, 'Standard') : decreaseQty(course._id, 'Standard')}
                  >−</button>
                  <span className="cs-qty-num">{qty}</span>
                  <button
                    className="cs-qty-btn"
                    onClick={() => increaseQty(course._id, 'Standard')}
                  >+</button>
                </div>
              )}

              <button
                className="cs-voc-btn"
                onClick={() => navigate('/voc')}
              >
                VOC Renewal →
              </button>

              <div className="cs-guarantees">
                <div className="cs-guarantee-item"><span>✓</span> Certificate same day</div>
                <div className="cs-guarantee-item"><span>✓</span> Nationally recognised</div>
                <div className="cs-guarantee-item"><span>✓</span> Same-week sessions</div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}