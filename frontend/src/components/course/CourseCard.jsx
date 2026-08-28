import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../../styles/CourseCard.css"
import { cdnImage } from "../../utils/cdnImage"

import BookingModal, { getBookingOptions } from "./BookingModal"

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ course, fromPortal }) {
    console.log(course,"course");
    const navigate    = useNavigate()
    const [showModal, setShowModal] = useState(false)
    const [selectedOptionId, setSelectedOptionId] = useState(null)

    const options = getBookingOptions(course)
    const sellingPrice = course?.sellingPrice || null
    const originalPrice = course?.originalPrice || null

    // Prioritize comboPrice if comboEnabled
    let displayPrice = course?.comboEnabled && course?.comboPrice 
        ? course.comboPrice 
        : (course?.pricingType === "slbl" || course?.slblPrice 
            ? (course.slSinglePrice || course.slblPrice || sellingPrice)
            : (course?.withExperiencePrice || sellingPrice))

    let displayOriginal = (course?.pricingType === "slbl" || course?.slblPrice)
        ? (course.slSingleStrikePrice || course.slblStrikePrice || originalPrice)
        : (course?.withExperienceOriginal || originalPrice)

    const savings = displayOriginal > displayPrice ? displayOriginal - displayPrice : null

    return (
        <>
            <div className="course-card">

                {/* THUMB */}
                <div
                    className="course-thumb"
                    onClick={() => navigate(`/course/${course.slug}${fromPortal ? "?fromPortal=true" : ""}`)}
                >
                    {course.image ? (
                        <img
                            src={cdnImage(course.image, { w: 480 })}
                            alt={course.title}
                            className="course-thumb-img"
                            loading="lazy"
                            decoding="async"
                            width="480"
                            height="320"
                        />
                    ) : (
                        <div className="course-thumb-placeholder">📋</div>
                    )}
                    <div className="course-thumb-overlay">View Details</div>
              
                    <span className="course-cat-badge">{course.category}</span>
                </div>

                {/* BODY */}
                <div className="course-body">

                    {/* Title */}
                    <h3
                        className="course-title"
                        onClick={() => navigate(`/course/${course.slug}${fromPortal ? "?fromPortal=true" : ""}`)}
                    >
                        <div className="course-card-code">{course.courseCode}</div>
                        {course.title}
                    </h3>

                    {/* Info */}
                    <div className="course-info-row">
                        <span className="course-info-item">
                            <i className="fa-regular fa-calendar-days" />
                             {course.duration}
                        </span>
                        <span className="course-info-item">
                            <i className="fa-solid fa-location-dot" />
                            {course.location}
                        </span>
                        <span className="course-info-item">
                            <i className="fa-solid fa-chalkboard-user" />
                            {course.deliveryMethod}
                        </span>
                    </div>

               {/* Price Toggle Banner */}
{(() => {
  const activeDisplayPrice = displayPrice || 0;
  const effectiveOriginal = displayOriginal || course?.originalPrice || 1000;
  const effectiveSavings = effectiveOriginal > activeDisplayPrice ? effectiveOriginal - activeDisplayPrice : 0;

  return (
    <div className="course-price-toggle-wrapper">
      <span className="price-toggle-original">
        ${effectiveOriginal}
      </span>
      
      <div className="price-toggle-green-pill">
        <span className="price-toggle-main-price">${activeDisplayPrice}</span>
        {effectiveSavings > 0 && (
          <span className="price-toggle-save-badge">SAVE ${effectiveSavings}</span>
        )}
      </div>
    </div>
  );
})()}

               {/* ── DISPLAY OPTIONS (With Temporary $1000 Strike Price Fallback) ── */}
<div className="cc-card-opts">
  <div className="cc-card-opts-lbl">Select option</div>
  <div className="cc-card-opt-boxes">
    {options.map((opt, i) => {
      const activePrice = opt.price || 0;
      // Temporary fallback set to 1000 if strike price is empty/missing
      const strikePrice = opt.originalPrice || displayOriginal || course?.originalPrice || 1000;
      
      const hasDiscount = Number(strikePrice) > Number(activePrice);

      return (
       <div
  key={i}
  className={`cc-card-opt-box ${opt.isVoc ? "cc-card-opt-box--voc" : "cc-card-opt-box--display"}`}
  onClick={() => {
    setSelectedOptionId(opt.id);
    setShowModal(true);
  }}
  title={`Click to book ${opt.label}`}
>
  <div className="cc-cob-label">{opt.label}</div>

  {/* Mini Price Toggle Pill */}
  <div className="cc-cob-mini-toggle">
    {hasDiscount && (
      <span className="cc-cob-toggle-old">${strikePrice}</span>
    )}
    <div className="cc-cob-toggle-active">
      <span>${activePrice}</span>
    </div>
  </div>
</div>
      );
    })}
  </div>
</div>
                    {/* Book Now */}
                    <button
                        className="course-btn course-btn--primary"
                        onClick={() => {
                            setShowModal(true)
                        }}
                    >
                        Book Now
                        <i className="fa-regular fa-circle-right" />
                    </button>

                    {/* View Details */}
                    <button
                        className="course-btn course-btn--outline"
                        onClick={() => navigate(`/course/${course.slug}${fromPortal ? "?fromPortal=true" : ""}`)}
                    >
                        View Details
                        <i className="fa-solid fa-circle-info" />
                    </button>

                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <BookingModal
                    course={course}
                    onClose={() => {
                        setShowModal(false)
                        setSelectedOptionId(null)
                    }}
                    initialSelection={selectedOptionId}
                    extraQueryParams={fromPortal ? "fromPortal=true" : ""}
                />
            )}
        </>
    )
}

export default CourseCard