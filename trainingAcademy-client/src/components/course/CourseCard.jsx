import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../../styles/CourseCard.css"
import { cdnImage } from "../../utils/cdnImage"

import BookingModal, { getBookingOptions } from "./BookingModal"

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ course, fromPortal }) {
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
                    {course.duration && (
                        <span className="course-dur-badge">{course.duration}</span>
                    )}
                    <span className="course-cat-badge">{course.category}</span>
                </div>

                {/* BODY */}
                <div className="course-body">

                    {/* Price */}
                    <div className="course-price-row">
                        <div className="course-exp-prices">
                            <span className="course-price-main">${displayPrice}</span>
                            {displayOriginal && displayOriginal > displayPrice && (
                                <span className="course-price-old">${displayOriginal}</span>
                            )}
                            {savings > 0 && (
                                <span className="course-save-badge">Save ${savings}</span>
                            )}
                        </div>
                    </div>
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

                    {/* ── DISPLAY OPTIONS — card-ல காட்டு, VOC மட்டும் direct navigate ── */}
                    <div className="cc-card-opts">
                        <div className="cc-card-opts-lbl">Select option</div>
                        <div className="cc-card-opt-boxes">
                            {options.map((opt, i) => (
                                <div
                                    key={i}
                                    className={`cc-card-opt-box ${opt.isVoc ? "cc-card-opt-box--voc" : "cc-card-opt-box--display"}`}
                                    onClick={() => {
                                        setSelectedOptionId(opt.id)
                                        setShowModal(true)
                                    }}
                                    title={`Click to book ${opt.label}`}
                                >
                                    <div className="cc-cob-label">{opt.label}</div>
                                    <div className="cc-cob-price">${opt.price}</div>
                                    <div className="cc-cob-dur">{opt.dur}</div>
                                    {opt.originalPrice && opt.originalPrice > opt.price && (
                                        <div className="cc-cob-was">${opt.originalPrice}</div>
                                    )}
                                </div>
                            ))}
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