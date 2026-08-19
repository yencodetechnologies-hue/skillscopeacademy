import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/CourseSessionCard.css";

/* =========================================================
   BOOKING TYPE
   Exact booking type identifier from BookingModal
========================================================= */

export function getBookingType(course) {
  if (!course) return "standard";

  const pt =
    course?.pricingType ||
    (course?.experienceBasedBooking
      ? "experience"
      : "standard");

  if (pt === "experience") {
    return "experience";
  }

  if (pt === "slbl" || course?.slblPrice) {
    return "slbl";
  }

  const bypassKeywords = [
    "excavator",
    "haul truck",
    "skid steer",
  ];

  const isBypass = bypassKeywords.some((kw) =>
    course?.title
      ?.toLowerCase()
      ?.includes(kw)
  );

  if (isBypass) {
    return "experience";
  }

  return "standard";
}

/* =========================================================
   BOOKING OPTIONS
   Exact option generator from BookingModal
========================================================= */

export function getBookingOptions(course) {
  if (!course) return [];

  const type = getBookingType(course);

  /* =====================================================
     EXPERIENCE
  ===================================================== */

  if (type === "experience") {
    return [
      {
        id: "with-experience",
        label: "With Exp",
        price:
          course.withExperiencePrice ||
          course.comboPrice ||
          course.sellingPrice,
        originalPrice:
          course.withExperienceOriginal ||
          course.originalPrice,
      },

      {
        id: "without-experience",
        label: "Without Exp",
        price:
          course.withoutExperiencePrice ||
          course.comboPrice ||
          course.sellingPrice,
        originalPrice:
          course.withoutExperienceOriginal ||
          course.originalPrice,
      },

      {
        id: "voc",
        label: "VOC",
        price:
          course.vocPrice ||
          course.sellingPrice,
        originalPrice:
          course.withoutExperienceOriginal ||
          course.originalPrice,
      },
    ];
  }

  /* =====================================================
     SLBL
  ===================================================== */

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
        price:
          course.slSinglePrice ||
          course.sellingPrice,
        originalPrice:
          course.slSingleStrikePrice ||
          course.originalPrice,
      },

      {
        id: "voc",
        label: "VOC",
        price:
          course.vocPrice ||
          course.sellingPrice,
        originalPrice:
          course.slSingleStrikePrice ||
          course.originalPrice,
      },
    ];
  }

  /* =====================================================
     STANDARD
  ===================================================== */

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
      price:
        course.vocPrice ||
        course.sellingPrice,
      originalPrice: course.originalPrice,
    },
  ];
}

/* =========================================================
   COMPONENT
========================================================= */

export default function CourseSessionCard({
  group,
  courses = [],
  onBookNow,
  onDetails,
}) {
  const navigate = useNavigate();

  if (!group) {
    return null;
  }

  /* =====================================================
     FIRST SESSION
  ===================================================== */

  const firstSession =
    group.sessions?.[0];

  /* =====================================================
     FULL COURSE
  ===================================================== */

  const fullCourse =
    courses.find(
      (course) =>
        course._id === group.courseId
    ) || {};

  /* =====================================================
     COURSE DETAILS
  ===================================================== */

  const courseTitle =
    group.courseName ||
    fullCourse?.title ||
    fullCourse?.courseName ||
    fullCourse?.name ||
    "Course Name";

  const courseCode =
    group.courseCode ||
    group.code ||
    fullCourse?.code ||
    fullCourse?.courseCode ||
    "";

  const location =
    firstSession?.location ||
    fullCourse?.location ||
    "Sefton";

  const deliveryMode =
    fullCourse?.deliveryMode ||
    "Face to Face Training";

  /* =====================================================
     DURATION
  ===================================================== */

  const durationVal =
    fullCourse?.duration ||
    group?.duration ||
    (fullCourse?.durationWithExp
      ? `${fullCourse.durationWithExp} / ${
          fullCourse.durationWithoutExp ||
          "2 Days"
        }`
      : "1 Day");

  /* =====================================================
     BOOKING OPTIONS
  ===================================================== */

  const options =
    getBookingOptions(fullCourse);

  const mainPrice =
    options[0]?.price ||
    fullCourse?.sellingPrice ||
    0;

  /* =====================================================
     BOOK NOW
  ===================================================== */

  const handleBookNow = () => {
    if (onBookNow) {
      onBookNow(firstSession || group);
    }
  };

  /* =====================================================
     DETAILS
  ===================================================== */

  const handleDetails = (event) => {
    event.stopPropagation();

    if (onDetails) {
      onDetails(group);
      return;
    }

    if (fullCourse?.slug) {
      navigate(
        `/course/${fullCourse.slug}`
      );
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="mlp-card-container">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mlp-card-header">

        <div className="mlp-card-left-group">

          {/* COURSE IMAGE */}

          {fullCourse?.image ? (
            <img
              src={fullCourse.image}
              alt={courseTitle}
              className="mlp-card-avatar"
            />
          ) : (
            <div className="mlp-card-avatar-placeholder">
              📷
            </div>
          )}

          {/* COURSE TITLE + CODE + PRICES */}

          <div className="mlp-card-title-group">

            <h4 className="mlp-card-title">
              {courseTitle}
            </h4>

            <div className="mlp-code-price-row">

              {/* COURSE CODE */}

              {courseCode && (
                <span className="mlp-card-code">
                  ({courseCode})
                </span>
              )}

              {/* PRICES */}

              <div className="mlp-horizontal-prices">

                {options.map(
                  (opt, index) => (
                    <React.Fragment
                      key={opt.id}
                    >

                      <div className="mlp-hprice-item">

                        <span className="mlp-hp-label">
                          {opt.label}:
                        </span>

                        {/* ORIGINAL PRICE */}

                        {opt.originalPrice &&
                          Number(
                            opt.originalPrice
                          ) >
                            Number(
                              opt.price
                            ) && (
                            <span className="mlp-hp-strike">
                              $
                              {
                                opt.originalPrice
                              }
                            </span>
                          )}

                        {/* CURRENT PRICE */}

                        <span className="mlp-hp-val">
                          $
                          {opt.price ||
                            0}
                        </span>

                      </div>

                      {/* PRICE DIVIDER */}

                      {index <
                        options.length -
                          1 && (
                        <span className="mlp-hp-divider">
                          |
                        </span>
                      )}

                    </React.Fragment>
                  )
                )}

              </div>

            </div>

          </div>

        </div>

        {/* MAIN PRICE */}

        <div className="mlp-card-main-price">
          ${mainPrice || 0}
        </div>

      </div>

      {/* =================================================
          INFORMATION
      ================================================= */}

      <div className="mlp-info-flex-row">

        <div className="mlp-duration-banner">

          {/* DURATION */}

          <div className="mlp-banner-item">

            <span className="mlp-icon">
              ⏱
            </span>

            <span className="mlp-banner-text">
              {durationVal}
            </span>

          </div>

          {/* LOCATION */}

          <div className="mlp-banner-item location-item">

            <span className="mlp-icon">
              📍
            </span>

            <span className="mlp-banner-text">
              {location}
            </span>

          </div>

          {/* DELIVERY MODE */}

          <div className="mlp-banner-item location-item">

            <span className="mlp-icon">
              🔄
            </span>

            <span className="mlp-banner-text">
              {deliveryMode}
            </span>

          </div>

        </div>

      </div>

      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="mlp-card-actions">

        {/* BOOK NOW */}

        <button
          type="button"
          className="mlp-btn-book"
          onClick={handleBookNow}
        >
          Book Now &rarr;
        </button>

        {/* DETAILS */}

        <button
          type="button"
          className="vac-btn-details"
          onClick={handleDetails}
        >
          Details
        </button>

      </div>

    </div>
  );
}