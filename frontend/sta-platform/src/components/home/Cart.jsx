import { Link }   from 'react-router-dom'
import { useCart } from '../Cartcontext'
import Topbar from '../common/Topbar'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import './cart.css'

// ── Icons ─────────────────────────────────────────────────────
const Minus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
)
const Plus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)
const Trash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

// ── Single cart row ───────────────────────────────────────────
const CartItem = ({ item }) => {
  const { increaseQty, decreaseQty, removeFromCart } = useCart()
  const { course, option, qty } = item

  const price =
    option === 'Combo' && course.comboPrice
      ? Number(course.comboPrice)
      : Number(course.price) || 0

  const lineTotal = price * qty

  return (
    <div className="ci">
      {/* Thumbnail */}
      <div className="ci-img">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title}/>
          : <div className="ci-img-ph">📖</div>
        }
      </div>

      {/* Info */}
      <div className="ci-info">
        <p className="ci-cat">{course.category?.name || 'Course'}</p>
        <h3 className="ci-title">{course.title}</h3>
        {course.duration  && <p className="ci-meta">📅 {course.duration}</p>}
        {course.instructor && <p className="ci-meta">🎓 {course.instructor}</p>}
        <p className="ci-option">Option: <strong>{option}</strong></p>

        {/* Controls */}
        <div className="ci-controls">
          {/* Quantity */}
          <div className="qty-row">
            <button
              className="qty-btn"
              onClick={() => decreaseQty(course._id, option)}
              aria-label="Decrease"
            ><Minus/></button>
            <span className="qty-val">{qty}</span>
            <button
              className="qty-btn"
              onClick={() => increaseQty(course._id, option)}
              aria-label="Increase"
            ><Plus/></button>
          </div>

          {/* Remove */}
          <button
            className="ci-remove"
            onClick={() => removeFromCart(course._id, option)}
          >
            <Trash/> Remove
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="ci-price">
        <p className="ci-unit">${price.toLocaleString()} × {qty}</p>
        <p className="ci-total">${lineTotal.toLocaleString()}</p>
      </div>
    </div>
  )
}

// ── Order summary card ────────────────────────────────────────
const Summary = () => {
  const { items, totalPrice, totalItems, clearCart } = useCart()
  const gst   = Math.round(totalPrice * 0.1)
  const grand = totalPrice + gst

  return (
    <div className="summary-card">
      <h2 className="summary-title">Order Summary</h2>

      <div className="summary-lines">
        <div className="summary-line">
          <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
          <span>${totalPrice.toLocaleString()}</span>
        </div>
        <div className="summary-line">
          <span>GST (10%)</span>
          <span>${gst.toLocaleString()}</span>
        </div>
        <div className="summary-line summary-line--green">
          <span>Discount</span>
          <span>$0</span>
        </div>
        <div className="summary-sep"/>
        <div className="summary-line summary-line--total">
          <span>Total</span>
          <span>${grand.toLocaleString()}</span>
        </div>
      </div>

      <Link to="/checkout" className="btn-checkout">
        Proceed to Checkout →
      </Link>

      <Link to="/" className="btn-continue">
        ← Continue Shopping
      </Link>

      <button className="btn-clear" onClick={clearCart}>
        Clear Cart
      </button>

      <div className="trust-list">
        <span>🔒 Secure Payment</span>
        <span>🏅 RTO #45234</span>
        <span>📄 Same-day Certificate</span>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CART PAGE
// ══════════════════════════════════════════════════════════════
const Cart = () => {
  const { items, totalItems } = useCart()

  return (
    <>
      <Topbar/>
      <Navbar/>

      <div className="cart-page">
        <div className="cart-wrap">

          {/* Heading */}
          <div className="cart-head">
            <h1>Shopping Cart</h1>
            {totalItems > 0 && (
              <p className="cart-head-count">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>

          {items.length === 0 ? (
            /* Empty state */
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>You haven't added any courses yet.</p>
              <Link to="/" className="btn-checkout" style={{ display: 'inline-block', width: 'auto', padding: '14px 36px' }}>
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="cart-grid">

              {/* Left: items */}
              <div className="cart-items-col">
                <div className="cart-items-header">
                  <span>Course</span>
                  <span>Price</span>
                </div>
                {items.map((item, i) => (
                  <CartItem key={`${item.course._id}-${item.option}-${i}`} item={item}/>
                ))}
              </div>

              {/* Right: summary */}
              <div className="cart-summary-col">
                <Summary/>
              </div>

            </div>
          )}

        </div>
      </div>

      <Footer/>
    </>
  )
}

export default Cart