import { useNavigate } from 'react-router-dom'
import { useCart } from '../Cartcontext'
import './coursecard.css'

const CourseCard = ({ course }) => {
  const { addToCart, removeFromCart, increaseQty, decreaseQty, items } = useCart()
  const navigate = useNavigate()

  const price      = Number(course.price)      || 0
  const vocPrice   = Number(course.vocPrice)   || 150
  const comboPrice = Number(course.comboPrice) || 0
  const origPrice  = Number(course.originalPrice) || (price > 0 ? Math.round(price * 1.2) : 0)
  const saving     = origPrice > price ? origPrice - price : 0
  const days       = course.days || (course.duration ? parseInt(course.duration, 10) || null : null)

  const cartItemStd = items.find(i => i.course._id === course._id && i.option === 'Standard')
  const qty    = cartItemStd?.qty || 0
  const inCart = qty > 0

  const handleBookNow = (e) => { e.stopPropagation(); if (!inCart) addToCart(course, 'Standard') }
  const handleIncrease = (e) => { e.stopPropagation(); increaseQty(course._id, 'Standard') }
  const handleDecrease = (e) => {
    e.stopPropagation()
    if (qty === 1) removeFromCart(course._id, 'Standard')
    else           decreaseQty(course._id, 'Standard')
  }
  const goCheckout = (e) => {
    e.stopPropagation()
    navigate('/checkout', { state: { course, option: 'Standard', qty: qty > 0 ? qty : 1, price } })
  }
  const goVoc = (e) => {
    e.stopPropagation()
    navigate('/voc', { state: { prefillCourse: { courseId: course._id, title: course.title, price: vocPrice, date: '' } } })
  }

  const vocLabel = course.comboEnabled && comboPrice > 0 ? 'Combo' : 'VOC/RPL'
  const vocAmt   = course.comboEnabled && comboPrice > 0 ? comboPrice : vocPrice

  return (
    <div
      className="hcc-card"
      onClick={() => navigate(`/courses/${course.urlSlug || course._id}`)}
    >
      {/* ── LEFT: Image ── */}
      <div className="hcc-img-wrap">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} loading="lazy" />
          : <div className="hcc-img-ph">📖</div>
        }
        {days && <span className="hcc-duration">{days} {days === 1 ? 'Day' : 'Days'}</span>}
        {course.category?.name && (
          <span className="hcc-cat-badge">{course.category.name}</span>
        )}
      </div>

      {/* ── RIGHT: Details ── */}
      <div className="hcc-body">

        {/* Price */}
        <div className="hcc-price-row">
          <span className="hcc-price">${price.toLocaleString()}</span>
          {saving > 0 && (
            <>
              <span className="hcc-original">${origPrice.toLocaleString()}</span>
              <span className="hcc-save">Save ${saving.toLocaleString()}</span>
            </>
          )}
        </div>

        {/* Course code */}
        {(course.code || course.urlSlug) && (
          <p className="hcc-code">{course.code || course.urlSlug}</p>
        )}

        {/* Title */}
        <h3 className="hcc-title">{course.title}</h3>

        {/* Description */}
        {course.description && (
          <p className="hcc-desc">{course.description}</p>
        )}

        {/* Meta */}
        <div className="hcc-meta">
          {days               && <span><span className="hcc-icon">📅</span>{days} {days === 1 ? 'Day' : 'Days'}</span>}
          {course.location    && <span><span className="hcc-icon">📍</span>{course.location}</span>}
          {course.instructor  && <span><span className="hcc-icon">👥</span>{course.instructor}</span>}
        </div>

        {/* Option boxes */}
        <p className="hcc-select-label">SELECT OPTION</p>
        <div className="hcc-options" onClick={e => e.stopPropagation()}>
          <div className="hcc-option hcc-option-active">
            <p>Standard</p>
            <strong>${price.toLocaleString()}</strong>
          </div>
          <div className="hcc-option">
            <p>{vocLabel}</p>
            <strong>${vocAmt.toLocaleString()}</strong>
          </div>
        </div>

        {/* Actions */}
        <div className="hcc-actions" onClick={e => e.stopPropagation()}>
          {!inCart ? (
            <button className="hcc-book-btn" onClick={handleBookNow}>Book Now →</button>
          ) : (
            <>
              <div className="hcc-qty-controls">
                <button className="hcc-qty-btn" onClick={handleDecrease}>−</button>
                <span className="hcc-qty-num">{qty}</span>
                <button className="hcc-qty-btn" onClick={handleIncrease}>+</button>
              </div>
              <button className="hcc-checkout-btn" onClick={goCheckout}>Checkout →</button>
            </>
          )}
          <button
            className="hcc-details-btn"
            onClick={e => { e.stopPropagation(); navigate(`/courses/${course.urlSlug || course._id}`) }}
          >
            Details
          </button>
        </div>

      </div>
    </div>
  )
}

export default CourseCard