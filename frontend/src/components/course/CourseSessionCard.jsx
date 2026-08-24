import React from "react";
import "../../styles/CourseSessionCard.css";

/* Exact booking type identifier from BookingModal */
export function getBookingType(course) {
  if (!course) return "standard";
  const pt = course?.pricingType || (course?.experienceBasedBooking ? "experience" : "standard");
  if (pt === "experience") return "experience";
  if (pt === "slbl" || course?.slblPrice) return "slbl";

  const bypassKeywords = ["excavator", "haul truck", "skid steer"];
  const isBypass = bypassKeywords.some((kw) =>
    course?.title?.toLowerCase()?.includes(kw)
  );
  if (isBypass) return "experience";

  return "standard";
}

/* Exact option generator from BookingModal */
export function getBookingOptions(course) {
  if (!course) return [];
  const type = getBookingType(course);

  if (type === "experience") {
    return [
      {
        id: "with-experience",
        label: "With Exp",
        price: course.withExperiencePrice || course.comboPrice || course.sellingPrice,
        originalPrice: course.withExperienceOriginal || course.originalPrice,
      },
      {
        id: "without-experience",
        label: "Without Exp",
        price: course.withoutExperiencePrice || course.comboPrice || course.sellingPrice,
        originalPrice: course.withoutExperienceOriginal || course.originalPrice,
      },
      {
        id: "voc",
        label: "VOC",
        price: course.vocPrice || course.sellingPrice,
        originalPrice: course.withoutExperienceOriginal || course.originalPrice,
      },
    ];
  }

  if (type === "slbl") {
    return [
      {
        id: "slbl",
        label: "SL + BL",
        price: course.slblPrice,
        originalPrice: course.slblStrikePrice,
      },
      {
        id: "sl",
        label: "SL / BL",
        price: course.slSinglePrice || course.sellingPrice,
        originalPrice: course.slSingleStrikePrice || course.originalPrice,
      },
      {
        id: "voc",
        label: "VOC",
        price: course.vocPrice || course.sellingPrice,
        originalPrice: course.slSingleStrikePrice || course.originalPrice,
      },
    ];
  }
  

  return [
    {
      id: "standard",
      label: "Standard",
      price: course.sellingPrice,
      originalPrice: course.originalPrice,
    },
    {
      id: "voc",
      label: "VOC",
      price: course.vocPrice || course.sellingPrice,
      originalPrice: course.originalPrice,
    },
  ];
}

export default function CourseSessionCard({ group, courses = [], onBookNow, onDetails }) {
  if (!group) return null;

  const firstSession = group.sessions?.[0];
  const fullCourse = courses.find((course) => course._id === group.courseId) || {};

  const courseTitle =
    group.courseName ||
    fullCourse?.title ||
    fullCourse?.courseName ||
    fullCourse?.name ||
    "Course Name";

  const courseCode = group.code || fullCourse?.code || fullCourse?.courseCode;
  const location = firstSession?.location || fullCourse?.location || "Sefton";
  const deliveryMode = fullCourse?.deliveryMode || "Face to Face Training";

  // Dynamic Duration Display
  const durationVal =
    fullCourse?.duration ||
    group?.duration ||
    (fullCourse?.durationWithExp
      ? `${fullCourse.durationWithExp} / ${fullCourse.durationWithoutExp || "2 Days"}`
      : "1 Day");

  // Dynamic booking options
  const options = getBookingOptions(fullCourse);
  const mainPrice = options[0]?.price || fullCourse?.sellingPrice || 0;

  const handleBookNow = () => {
    if (onBookNow) onBookNow(group);
  };

  const handleDetails = () => {
    if (onDetails) onDetails(group);
  };

  return (
    <div className="mlp-card-container">
      {/* HEADER: TITLE, AVATAR, CODE & PRICING BREAKDOWN */}
      <div className="mlp-card-header">
        <div className="mlp-card-left-group">
          {fullCourse?.image ? (
            <img src={fullCourse.image} alt={courseTitle} className="mlp-card-avatar" />
          ) : (
            <div className="mlp-card-avatar-placeholder">📷</div>
          )}

          <div className="mlp-card-title-group">
            <h4 className="mlp-card-title">{courseTitle}</h4>

            {/* CODE + PRICES FLEX ROW */}
            <div className="mlp-code-price-row">
              {courseCode && <span className="mlp-card-code">({courseCode})</span>}

              <div className="mlp-horizontal-prices">
                {options.map((opt, index) => (
                  <React.Fragment key={opt.id}>
                    <div className="mlp-hprice-item">
                      <span className="mlp-hp-label">{opt.label}:</span>
                      {opt.originalPrice && opt.originalPrice > opt.price && (
                        <span className="mlp-hp-strike">${opt.originalPrice}</span>
                      )}
                      <span className="mlp-hp-val">${opt.price || 0}</span>
                    </div>
                    {index < options.length - 1 && <span className="mlp-hp-divider">|</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mlp-card-main-price">${mainPrice}</div>
      </div>

      {/* FLEX ROW: DURATION/LOCATION BANNER + TAGS */}
      <div className="mlp-info-flex-row">
        <div className="mlp-duration-banner">
          <div className="mlp-banner-item">
            <span className="mlp-icon">⏱</span>
            <span className="mlp-banner-text">{durationVal}</span>
          </div>

          <div className="mlp-banner-item location-item">
            <span className="mlp-icon">📍</span>
            <span className="mlp-banner-text">{location}</span>
            
          </div>
          <div className="mlp-banner-item location-item">
            <span className="mlp-icon">🔄</span>
            <span className="mlp-banner-text">{deliveryMode}</span>
            
          </div>
        </div>
{/* 
        <div className="mlp-card-tags">
          <span className="mlp-card-tag">{deliveryMode}</span>
        </div> */}
      </div>

      {/* ACTIONS */}
      <div className="mlp-card-actions">
        <button type="button" className="mlp-btn-book" onClick={handleBookNow}>
          Book Now &rarr;
        </button>
        <button type="button" className="mlp-btn-details" onClick={handleDetails}>
          Details
        </button>
      </div>
    </div>
  );
}