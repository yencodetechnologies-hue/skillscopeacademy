

// import { useState } from 'react'
// import { useCart }  from '../Cartcontext'
// import './coursecard.css'

// const CourseCard = ({ course }) => {
//   const { addToCart, isInCart } = useCart()

//   const price      = Number(course.price)      || 0
//   const comboPrice = Number(course.comboPrice) || 0
//   // derive an "original" (crossed-out) price: 20 % above if not stored
//   const origPrice  = Number(course.originalPrice) || (price > 0 ? Math.round(price * 1.2) : 0)
//   const saving     = origPrice > price ? origPrice - price : 0

//   const [selectedOption, setSelectedOption] = useState('Standard')

//   const displayPrice =
//     selectedOption === 'Combo' && comboPrice > 0 ? comboPrice : price

//   const inCart = isInCart(course._id)

//   // Parse numeric days from "1 Day" or "3 Days" or course.days
//   const days = course.days
//     || (course.duration ? parseInt(course.duration, 10) || null : null)

//   return (
//     <div className="course-card">

//       {/* ── Image ── */}
//       <div className="card-img-wrap">
//         {course.thumbnail
//           ? <img src={course.thumbnail} alt={course.title} loading="lazy"/>
//           : <div className="card-img-ph">📖</div>
//         }
//         <span className="card-badge">{course.category?.name || 'Course'}</span>
//         {days && (
//           <span className="card-duration">
//             {days} {days === 1 ? 'Day' : 'Days'}
//           </span>
//         )}
//       </div>

//       {/* ── Body ── */}
//       <div className="card-body">

//         {/* Price row */}
//         <div className="card-price-row">
//           <span className="card-price">${displayPrice.toLocaleString()}</span>
//           {saving > 0 && (
//             <>
//               <span className="card-original">${origPrice.toLocaleString()}</span>
//               <span className="card-save">Save ${saving.toLocaleString()}</span>
//             </>
//           )}
//         </div>

//         {/* Code */}
//         {(course.code || course.urlSlug) && (
//           <p className="card-code">{course.code || course.urlSlug}</p>
//         )}

//         <h3 className="card-title">{course.title}</h3>

//         {/* Meta */}
//         <div className="card-meta">
//           {days             && <span>📅 {days} {days === 1 ? 'Day' : 'Days'}</span>}
//           {course.location  && <span>📍 {course.location}</span>}
//           {course.instructor && <span>👥 {course.instructor}</span>}
//           {course.type      && <span>👥 {course.type}</span>}
//         </div>

//         {/* Select option */}
//         <p className="card-select-label">SELECT OPTION</p>
//         <div className="card-options">
//           {/* Standard — always shown */}
//           <button
//             className={`option-box${selectedOption === 'Standard' ? ' option-active' : ''}`}
//             onClick={() => setSelectedOption('Standard')}
//           >
//             <p>Standard</p>
//             <strong>${price.toLocaleString()}</strong>
//           </button>

//           {/* Combo — only if enabled with a price */}
//           {course.comboEnabled && comboPrice > 0 && (
//             <button
//               className={`option-box${selectedOption === 'Combo' ? ' option-active' : ''}`}
//               onClick={() => setSelectedOption('Combo')}
//             >
//               <p>Combo</p>
//               <strong>${comboPrice.toLocaleString()}</strong>
//             </button>
//           )}

//           {/* VOC fallback */}
//           {(!course.comboEnabled || !comboPrice) && course.vocPrice && (
//             <button
//               className={`option-box${selectedOption === 'VOC' ? ' option-active' : ''}`}
//               onClick={() => setSelectedOption('VOC')}
//             >
//               <p>VOC</p>
//               <strong>${Number(course.vocPrice).toLocaleString()}</strong>
//             </button>
//           )}
//         </div>

//         {/* Book Now / Added */}
//         <button
//           className={`card-book-btn${inCart ? ' card-book-btn--added' : ''}`}
//           onClick={() => addToCart(course, selectedOption)}
//         >
//           {inCart ? '✓ Added to Cart' : 'Book Now →'}
//         </button>

//         <button className="card-details-btn">View Details ℹ</button>
//       </div>
//     </div>
//   )
// }

// export default CourseCard;

import { useNavigate } from 'react-router-dom'
import { useCart } from '../Cartcontext'
import './coursecard.css'

const CourseCard = ({ course }) => {
  const { addToCart, removeFromCart, increaseQty, decreaseQty, items } = useCart()
  const navigate = useNavigate()

  const price      = Number(course.price)      || 0
  const comboPrice = Number(course.comboPrice) || 0
  const origPrice  = Number(course.originalPrice) || (price > 0 ? Math.round(price * 1.2) : 0)
  const saving     = origPrice > price ? origPrice - price : 0

  const days = course.days || (course.duration ? parseInt(course.duration, 10) || null : null)

  // Find this course's cart item (Standard option by default)
  const cartItem = items.find(i => i.course._id === course._id && i.option === 'Standard')
  const qty = cartItem?.qty || 0
  const inCart = qty > 0

  const handleBookNow = () => {
    if (!inCart) {
      addToCart(course, 'Standard')
    }
  }

  const handleIncrease = (e) => {
    e.stopPropagation()
    increaseQty(course._id, 'Standard')
  }

  const handleDecrease = (e) => {
    e.stopPropagation()
    if (qty === 1) {
      removeFromCart(course._id, 'Standard')
    } else {
      decreaseQty(course._id, 'Standard')
    }
  }

  const handleViewDetails = () => {
    navigate(`/courses/${course._id}`)
  }

  const price2 = comboPrice > 0 ? comboPrice : price

  return (
    <div className="course-card">

      {/* ── Image ── */}
      <div className="card-img-wrap">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} loading="lazy" />
          : <div className="card-img-ph">📖</div>
        }
        <span className="card-badge">{course.category?.name || 'Course'}</span>
        {days && (
          <span className="card-duration">
            {days} {days === 1 ? 'Day' : 'Days'}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="card-body">

        {/* Price row */}
        <div className="card-price-row">
          <span className="card-price">${price.toLocaleString()}</span>
          {saving > 0 && (
            <>
              <span className="card-original">${origPrice.toLocaleString()}</span>
              <span className="card-save">Save ${saving.toLocaleString()}</span>
            </>
          )}
        </div>

        {(course.code || course.urlSlug) && (
          <p className="card-code">{course.code || course.urlSlug}</p>
        )}

        <h3 className="card-title">{course.title}</h3>

        <div className="card-meta">
          {days              && <span>📅 {days} {days === 1 ? 'Day' : 'Days'}</span>}
          {course.instructor && <span>👥 {course.instructor}</span>}
          {course.location   && <span>📍 {course.location}</span>}
        </div>

        <p className="card-select-label">SELECT OPTION</p>
        <div className="card-options">
          <div className="option-box option-active">
            <p>Standard</p>
            <strong>${price.toLocaleString()}</strong>
          </div>
          {course.comboEnabled && comboPrice > 0 && (
            <div className="option-box">
              <p>Combo</p>
              <strong>${comboPrice.toLocaleString()}</strong>
            </div>
          )}
          {(!course.comboEnabled || !comboPrice) && course.vocPrice && (
            <div className="option-box">
              <p>VOC</p>
              <strong>${Number(course.vocPrice).toLocaleString()}</strong>
            </div>
          )}
        </div>

        {/* Book Now / Qty Controls */}
        {!inCart ? (
          <button className="card-book-btn" onClick={handleBookNow}>
            Book Now →
          </button>
        ) : (
          <div className="card-qty-controls">
            <button className="card-qty-btn card-qty-minus" onClick={handleDecrease}>
              −
            </button>
            <span className="card-qty-num">{qty}</span>
            <button className="card-qty-btn card-qty-plus" onClick={handleIncrease}>
              +
            </button>
          </div>
        )}

        <button className="card-details-btn" onClick={handleViewDetails}>
          View Details ℹ
        </button>
      </div>
    </div>
  )
}

export default CourseCard
