import { useNavigate } from 'react-router-dom'
import { useCart } from '../Cartcontext'
import './coursespagecard.css'

const CoursesPageCard = ({ course }) => {
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
  const goStandardCheckout = (e) => {
    e.stopPropagation()
    navigate('/checkout', { state: { course, option: 'Standard', qty: qty > 0 ? qty : 1, price } })
  }
  const goVocPage = (e) => {
    e.stopPropagation()
    navigate('/voc', { state: { prefillCourse: { courseId: course._id, title: course.title, price: vocPrice, date: '' } } })
  }

  return (
    <div
      className="cpc-card"
      onClick={() => navigate(`/courses/${course.urlSlug || course._id}`)}
    >
      {/* Image */}
      <div className="cpc-img-wrap">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} loading="lazy" />
          : <div className="cpc-img-ph">📖</div>
        }
        {course.category?.name && <span className="cpc-badge">{course.category.name}</span>}
        {days && <span className="cpc-duration">{days} {days === 1 ? 'Day' : 'Days'}</span>}
      </div>

      {/* Body */}
      <div className="cpc-body">
        <div className="cpc-price-row">
          <span className="cpc-price">${price.toLocaleString()}</span>
          {saving > 0 && (
            <>
              <span className="cpc-original">${origPrice.toLocaleString()}</span>
              <span className="cpc-save">Save ${saving.toLocaleString()}</span>
            </>
          )}
        </div>

        {(course.code || course.urlSlug) && (
          <p className="cpc-code">{course.code || course.urlSlug}</p>
        )}

        <h3 className="cpc-title">{course.title}</h3>

        <div className="cpc-meta">
          {days              && <span>📅 {days} {days === 1 ? 'Day' : 'Days'}</span>}
          {course.instructor && <span>👥 {course.instructor}</span>}
          {course.location   && <span>📍 {course.location}</span>}
        </div>

        <p className="cpc-select-label">SELECT OPTION</p>
        <div className="cpc-options" onClick={e => e.stopPropagation()}>
          <div className="cpc-option cpc-option-active">
            <p>Standard</p>
            <strong>${price.toLocaleString()}</strong>
          </div>
          {course.comboEnabled && comboPrice > 0 ? (
            <div className="cpc-option">
              <p>Combo</p>
              <strong>${comboPrice.toLocaleString()}</strong>
            </div>
          ) : (
            <div className="cpc-option">
              <p>VOC</p>
              <strong>${vocPrice.toLocaleString()}</strong>
            </div>
          )}
        </div>

        {!inCart ? (
          <button className="cpc-book-btn" onClick={handleBookNow}>Book Now →</button>
        ) : (
          <>
            <div className="cpc-qty-controls" onClick={e => e.stopPropagation()}>
              <button className="cpc-qty-btn" onClick={handleDecrease}>−</button>
              <span className="cpc-qty-num">{qty}</span>
              <button className="cpc-qty-btn" onClick={handleIncrease}>+</button>
            </div>
            <div className="cpc-buy-row" onClick={e => e.stopPropagation()}>
              <button className="cpc-buy-btn cpc-buy-std" onClick={goStandardCheckout}>
                Buy Standard — ${price.toLocaleString()}
              </button>
              <button className="cpc-buy-btn cpc-buy-voc" onClick={goVocPage}>
                Buy VOC — ${vocPrice.toLocaleString()}
              </button>
            </div>
          </>
        )}

        <button
          className="cpc-details-btn"
          onClick={e => { e.stopPropagation(); navigate(`/courses/${course.urlSlug || course._id}`) }}
        >
          View Details ℹ
        </button>
      </div>
    </div>
  )
}

export default CoursesPageCard