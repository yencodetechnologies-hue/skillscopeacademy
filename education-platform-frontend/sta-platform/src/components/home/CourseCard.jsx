// import './coursecard.css'

// const CourseCard = ({ course }) => {
//   const saving = course.originalPrice - course.price

//   return (
//     <div className='course-card'>
//       <div className='card-img-wrap'>
//         <img src={course.image} alt={course.title} />
//         <span className='card-badge'>{course.category}</span>
//         <span className='card-duration'>{course.duration}</span>
//       </div>

//       <div className='card-body'>
//         <div className='card-price-row'>
//           <span className='card-price'>${course.price}</span>
//           <span className='card-original'>${course.originalPrice}</span>
//           <span className='card-save'>Save ${saving}</span>
//         </div>

//         <p className='card-code'>{course.code}</p>
//         <h3 className='card-title'>{course.title}</h3>

//         <div className='card-meta'>
//           <span>📅 {course.days} {course.days === 1 ? 'Day' : 'Days'}</span>
//           <span>📍 {course.location}</span>
//           <span>👥 {course.type}</span>
//         </div>

//         <p className='card-select-label'>SELECT OPTION</p>

//         <div className='card-options'>
//           <div className='option-box'>
//             <p>Standard</p>
//             <strong>${course.standardPrice}</strong>
//           </div>
//           <div className='option-box'>
//             <p>VOC</p>
//             <strong>${course.vocPrice}</strong>
//           </div>
//         </div>

//         <button className='card-book-btn'>Book Now →</button>
//         <button className='card-details-btn'>View Details ℹ</button>
//       </div>
//     </div>
//   )
// }

// export default CourseCard

import { useState } from 'react'
import { useCart }  from '../Cartcontext'
import './coursecard.css'

const CourseCard = ({ course }) => {
  const { addToCart, isInCart } = useCart()

  const price      = Number(course.price)      || 0
  const comboPrice = Number(course.comboPrice) || 0
  // derive an "original" (crossed-out) price: 20 % above if not stored
  const origPrice  = Number(course.originalPrice) || (price > 0 ? Math.round(price * 1.2) : 0)
  const saving     = origPrice > price ? origPrice - price : 0

  const [selectedOption, setSelectedOption] = useState('Standard')

  const displayPrice =
    selectedOption === 'Combo' && comboPrice > 0 ? comboPrice : price

  const inCart = isInCart(course._id)

  // Parse numeric days from "1 Day" or "3 Days" or course.days
  const days = course.days
    || (course.duration ? parseInt(course.duration, 10) || null : null)

  return (
    <div className="course-card">

      {/* ── Image ── */}
      <div className="card-img-wrap">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} loading="lazy"/>
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
          <span className="card-price">${displayPrice.toLocaleString()}</span>
          {saving > 0 && (
            <>
              <span className="card-original">${origPrice.toLocaleString()}</span>
              <span className="card-save">Save ${saving.toLocaleString()}</span>
            </>
          )}
        </div>

        {/* Code */}
        {(course.code || course.urlSlug) && (
          <p className="card-code">{course.code || course.urlSlug}</p>
        )}

        <h3 className="card-title">{course.title}</h3>

        {/* Meta */}
        <div className="card-meta">
          {days             && <span>📅 {days} {days === 1 ? 'Day' : 'Days'}</span>}
          {course.location  && <span>📍 {course.location}</span>}
          {course.instructor && <span>👥 {course.instructor}</span>}
          {course.type      && <span>👥 {course.type}</span>}
        </div>

        {/* Select option */}
        <p className="card-select-label">SELECT OPTION</p>
        <div className="card-options">
          {/* Standard — always shown */}
          <button
            className={`option-box${selectedOption === 'Standard' ? ' option-active' : ''}`}
            onClick={() => setSelectedOption('Standard')}
          >
            <p>Standard</p>
            <strong>${price.toLocaleString()}</strong>
          </button>

          {/* Combo — only if enabled with a price */}
          {course.comboEnabled && comboPrice > 0 && (
            <button
              className={`option-box${selectedOption === 'Combo' ? ' option-active' : ''}`}
              onClick={() => setSelectedOption('Combo')}
            >
              <p>Combo</p>
              <strong>${comboPrice.toLocaleString()}</strong>
            </button>
          )}

          {/* VOC fallback */}
          {(!course.comboEnabled || !comboPrice) && course.vocPrice && (
            <button
              className={`option-box${selectedOption === 'VOC' ? ' option-active' : ''}`}
              onClick={() => setSelectedOption('VOC')}
            >
              <p>VOC</p>
              <strong>${Number(course.vocPrice).toLocaleString()}</strong>
            </button>
          )}
        </div>

        {/* Book Now / Added */}
        <button
          className={`card-book-btn${inCart ? ' card-book-btn--added' : ''}`}
          onClick={() => addToCart(course, selectedOption)}
        >
          {inCart ? '✓ Added to Cart' : 'Book Now →'}
        </button>

        <button className="card-details-btn">View Details ℹ</button>
      </div>
    </div>
  )
}

export default CourseCard;
