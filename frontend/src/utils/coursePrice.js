// Course price helpers.
//
// Courses come in three pricing flavours and the price field varies per
// flavour. If the UI just reads `sellingPrice` it shows "Enquire" for
// experience- and SL/BL-based courses (because their prices live in
// withExperiencePrice / withoutExperiencePrice / slSinglePrice / slblPrice
// instead).
//
//   pricingType = "standard"   → sellingPrice
//   pricingType = "experience" → withoutExperiencePrice (cheaper variant)
//                                or withExperiencePrice as fallback
//   pricingType = "slbl"       → slSinglePrice (cheaper variant) or slblPrice
//
// We surface the cheaper variant with a "From $" prefix so the user knows
// other variants exist; the booking flow then lets them pick.

export function getCoursePricingType(course) {
  if (!course) return "standard"
  if (course.pricingType) return course.pricingType
  // Align with BookingModal.getBookingType — legacy rows may omit pricingType
  if (course.slblPrice != null || course.slSinglePrice != null) return "slbl"
  if (course.experienceBasedBooking) return "experience"
  return "standard"
}

// utils/coursePrice.js

export const SCHEDULE_PRICING_FIELDS = [
  "promotionalText",
  "originalPrice",
  "sellingPrice",
  "withExperiencePrice",
  "withExperienceOriginal",
  "withoutExperiencePrice",
  "withoutExperienceOriginal",
  "slSingleStrikePrice",
  "slSinglePrice",
  "slblStrikePrice",
  "slblPrice",
];

export function buildSchedulePricingPayload(pricing, options = {}) {
  const payload = {};
  SCHEDULE_PRICING_FIELDS.forEach((key) => {
    const val = pricing[key];
    if (options.clearEmpty && (val === "" || val == null)) {
      return;
    }
    if (val !== undefined) {
      payload[key] = val;
    }
  });
  return payload;
}
export function getDefaultSchedulePricingValues(course) {
  const empty = {
    promotionalText: "",
    originalPrice: "",
    sellingPrice: "",
    withExperiencePrice: "",
    withExperienceOriginal: "",
    withoutExperiencePrice: "",
    withoutExperienceOriginal: "",
    slSingleStrikePrice: "",
    slSinglePrice: "",
    slblStrikePrice: "",
    slblPrice: "",
  }
  if (!course) return empty
  const num = (v) => (v != null && v !== "" ? String(v) : "")
  return {
    promotionalText: "",
    originalPrice: num(course.originalPrice),
    sellingPrice: num(course.sellingPrice),
    withExperiencePrice: num(course.withExperiencePrice),
    withExperienceOriginal: num(course.withExperienceOriginal),
    withoutExperiencePrice: num(course.withoutExperiencePrice),
    withoutExperienceOriginal: num(course.withoutExperienceOriginal),
    slSingleStrikePrice: num(course.slSingleStrikePrice),
    slSinglePrice: num(course.slSinglePrice),
    slblStrikePrice: num(course.slblStrikePrice),
    slblPrice: num(course.slblPrice),
  }
}

// Display label for listings/cards/hero. Returns a string.
export function getCoursePriceDisplay(course) {
  if (!course) return "Enquire"
  const pt = getCoursePricingType(course)

  if (pt === "experience") {
    const p =   course.withExperiencePrice || course.withoutExperiencePrice
    return p ? `$${p}` : "Enquire"
  }
  if (pt === "slbl") {
    const p = course.slSinglePrice || course.slblPrice
    return p ? `$${p}` : "Enquire"
  }
  return course.sellingPrice ? `$${course.sellingPrice}` : "Enquire"
}

// Numeric "lowest price". Useful for comparisons / sorting.
export function getCoursePriceNumber(course) {
  if (!course) return 0
  const pt = getCoursePricingType(course)
  if (pt === "experience") {
    return Number(course.withoutExperiencePrice || course.withExperiencePrice || 0)
  }
  if (pt === "slbl") {
    return Number(course.slSinglePrice || course.slblPrice || 0)
  }
  return Number(course.sellingPrice || 0)
}

// Optional "strike-through" original price. Only meaningful for the
// standard pricing type — variant courses don't carry a single original.
export function getCourseOriginalDisplay(course) {
  if (!course) return null
  const pt = getCoursePricingType(course)
  if (pt !== "standard") return null
  if (
    course.originalPrice &&
    course.sellingPrice &&
    course.originalPrice > course.sellingPrice
  ) {
    return `$${course.originalPrice}`
  }
  return null
}

export function getCourseSavingDisplay(course) {
  if (!course) return null
  if (
    course.originalPrice &&
    course.sellingPrice &&
    course.originalPrice > course.sellingPrice
  ) {
    return `Save $${course.originalPrice - course.sellingPrice}`
  }
  return null
}

// Returns the list of bookable variants for a course. Standard courses
// have a single, unnamed variant (so the caller can render a normal
// "Book Now" button). Experience- and SL/BL-based courses return TWO
// variants — these power the side-by-side button rows on both desktop
// (ViewDetailsRight.jsx) and mobile (ViewCourseDetailMobile.jsx) and
// MUST stay in sync with the option list in CourseSelection.jsx so the
// `?type=` query the buttons emit matches what the booking flow reads.
//
// Each variant:
//   key:      url query value, e.g. "with-experience"
//   label:    user-facing string
//   price:    numeric price for this variant (0 if not configured)
//   original: optional strike-through price (or null)
// Inside ../utils/coursePrice.js

export function getCourseVariants(course, pricing = {}) {
  const pricingType = getCoursePricingType(course);

  if (pricingType === "experience") {
    return [
      {
        key: "withExperience",
        label: "With Experience",
        // Check pricing override first, then fallback to course default
        original: pricing.withExperienceOriginal || course.withExperienceOriginal,
        price: pricing.withExperiencePrice || course.withExperiencePrice,
      },
      {
        key: "withoutExperience",
        label: "Without Experience",
        original: pricing.withoutExperienceOriginal || course.withoutExperienceOriginal,
        price: pricing.withoutExperiencePrice || course.withoutExperiencePrice,
      },
    ];
  }

  if (pricingType === "slbl") {
    return [
      {
        key: "slSingle",
        label: "SL or BL",
        original: pricing.slSingleStrikePrice || course.slSingleStrikePrice,
        price: pricing.slSinglePrice || course.slSinglePrice,
      },
      {
        key: "slbl",
        label: "SL + BL",
        original: pricing.slblStrikePrice || course.slblStrikePrice,
        price: pricing.slblPrice || course.slblPrice,
      },
    ];
  }

  return [];
}
