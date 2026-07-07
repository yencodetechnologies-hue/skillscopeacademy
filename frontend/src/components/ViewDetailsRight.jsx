import "../styles/ViewDetailsRight.css"
import { useNavigate } from "react-router-dom"
import { ORG_PHONE_1300 } from "../utils/organizationPhones"

function ViewDetailsRight({ course }) {

    const navigate = useNavigate()

    return (

       <div className="view-details-right">

            {/* ✅ experienceBasedBooking ஆனா different price card */}
            {course?.experienceBasedBooking ? (
                <div className="price-card">
                    <p className="course-fee">Course Fee</p>
                    <div style={{ marginBottom: "8px" }}>
                        <p style={{ fontSize: "13px", color: "#aaa", margin: 0 }}>With experience</p>
                        <h1 className="new-price">${course?.withExperiencePrice}</h1>
                    </div>
                    <div>
                        <p style={{ fontSize: "13px", color: "#aaa", margin: 0 }}>Without experience</p>
                        <h1 className="new-price">${course?.withoutExperiencePrice}</h1>
                    </div>
                </div>
            ) : (
                <div className="price-card">
                    <p className="old-price">${course?.originalPrice}</p>
                    <h1 className="new-price">${course?.sellingPrice}</h1>
                    <p className="course-fee">Course Fees</p>
                    <p className="save-text">{`Save $${course.originalPrice - course.sellingPrice} !`}</p>

                    {course?.slblPrice && (
                        <>
                            <hr className="vdr-hr" />
                            <p className="combo-label">SL + BL</p>
                            <h3 className="combo-price">${course?.slblPrice}</h3>
                        </>
                    )}
                </div>
            )}

            <div className="course-details-box">

                <h3 className="course-detail-vdr">Course Details</h3>

                <div className="detail-item duration">
                    <div className="detail-item-div">
                        <span>🕒</span>
                        <p>Duration</p>
                    </div>
                    <strong>{course?.duration}</strong>
                </div>

                <div className="detail-item location">
                    <div className="detail-item-div">
                        <span>📍</span>
                        <p>Location</p>
                    </div>
                    <strong>{course?.deliveryMethod}</strong>
                </div>

                {course?.experienceBasedBooking ? (
                    <div className="exp-buttons">
                        <button
                            className="book-btn-courses"
                            onClick={() => navigate(`/book-now/course/${course?.slug}?type=with-experience`)}
                        >
                            <span className="old-price">${course?.withExperienceOriginal}</span>
                            <span> ${course?.withExperiencePrice || 0} </span>
                            Book With Experience
                        </button>

                        <button
                            className="book-btn-alt"
                            onClick={() => navigate(`/book-now/course/${course?.slug}?type=without-experience`)}
                        >
                            <span className="old-price">${course?.withoutExperienceOriginal}</span>
                            <span> ${course?.withoutExperiencePrice} </span>
                            Book Without Experience
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            className="book-btn-courses"
                            onClick={() => navigate(`/book-now/course/${course?.slug}`)}
                        >
                            BOOK NOW — ${course?.sellingPrice}
                        </button>

                        {course?.slblPrice && (
                            <button
                                className="book-btn-alt"
                                onClick={() => navigate(`/book-now/course/${course?.slug}?type=slbl`)}
                            >
                                Book Now SL + BL — ${course?.slblPrice}
                            </button>
                        )}
                    </>
                )}

                <hr className="vdr-hr" />

                <ul className="course-benefits">
                    <li>✅ Nationally Recognized Certification</li>
                    <li>🛡 Industry-Standard Training</li>
                    <li>⭐ Expert Instructors</li>
                </ul>

            </div>

            <div className="help-card">

                <div className="help-header">
                    <div className="help-icon">📞</div>
                    <div>
                        <h3>Need Help?</h3>
                        <p>Contact our training advisors for personalized guidance</p>
                    </div>
                </div>

                <a href={ORG_PHONE_1300.tel} style={{ textDecoration: "none" }}>
                    <button className="help-btn">📞 Call: {ORG_PHONE_1300.display}</button>
                </a>
                <a href="mailto:info@safetytrainingacademy.edu.au" style={{ textDecoration: "none" }}>
                    <button className="email-btn">✉ Email Support</button>
                </a>

            </div>

        </div>

    )

}

export default ViewDetailsRight