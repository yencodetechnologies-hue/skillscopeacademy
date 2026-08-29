const Coupon = require('../models/Coupon');

const ALLOWED_TYPES = ['individual', 'company'];

// Normalizes a coupon's `type` to an array, whether it's stored as
// the old single string or the new array.
function getCouponTypes(coupon) {
  if (Array.isArray(coupon.type)) {
    return coupon.type;
  }

  return coupon.type ? [coupon.type] : [];
}

// A coupon is "live" right now: Active status and within its date
// range (validUntil is inclusive through the end of that day).
function isCouponActiveNow(coupon) {
  if (coupon.status !== 'Active') {
    return false;
  }

  const now = new Date();

  const validFrom = new Date(coupon.validFrom);
  const validUntil = new Date(coupon.validUntil);

  if (
    Number.isNaN(validFrom.getTime()) ||
    Number.isNaN(validUntil.getTime())
  ) {
    return false;
  }

  validUntil.setHours(23, 59, 59, 999);

  return now >= validFrom && now <= validUntil;
}

// Finds an active coupon (other than `excludeId`, if given) that
// already applies to at least one of `courseIds`. A course is
// considered "taken" as soon as ANY active coupon touches it,
// regardless of type — this mirrors the disable logic in the UI,
// enforced server-side so it can't be bypassed.
async function findCourseConflict(courseIds, excludeId) {
  const query = {
    status: 'Active',
    'courses.courseId': { $in: courseIds },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const candidateCoupons = await Coupon.find(query);

  return candidateCoupons.find((candidate) => {
    if (!isCouponActiveNow(candidate)) {
      return false;
    }

    return (candidate.courses || []).some((c) =>
      courseIds.includes(String(c.courseId))
    );
  });
}

// ============================================================
// POST /api/coupons
// CREATE COUPON
// ============================================================

exports.createCoupon = async (req, res) => {
  try {
    const {
      couponCode,
      status,
      discountAmount,
      type,
      validFrom,
      validUntil,
      courses,
    } = req.body;

    // ---------------------------------------------
    // Basic validation
    // ---------------------------------------------

    if (
      !couponCode ||
      discountAmount == null ||
      !validFrom ||
      !validUntil
    ) {
      return res.status(400).json({
        success: false,
        message:
          'couponCode, discountAmount, validFrom and validUntil are required.',
      });
    }

    // ---------------------------------------------
    // Validate discount amount
    // ---------------------------------------------

    const numericDiscountAmount = Number(discountAmount);

    if (
      Number.isNaN(numericDiscountAmount) ||
      numericDiscountAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Discount amount must be greater than 0.',
      });
    }

    // ---------------------------------------------
    // Validate type — array of 'individual' / 'company',
    // at least one required.
    // ---------------------------------------------

    const normalizedTypes = Array.isArray(type)
      ? type
      : type
        ? [type]
        : [];

    const uniqueTypes = [...new Set(normalizedTypes)];

    if (
      uniqueTypes.length === 0 ||
      uniqueTypes.some((t) => !ALLOWED_TYPES.includes(t))
    ) {
      return res.status(400).json({
        success: false,
        message: `type must include at least one of: ${ALLOWED_TYPES.join(
          ', '
        )}.`,
      });
    }

    // ---------------------------------------------
    // Validate courses
    // ---------------------------------------------

    if (!courses || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'Select at least one course from the table.',
      });
    }

    const courseIds = courses
      .map((c) => c && c.courseId)
      .filter(Boolean)
      .map(String);

    if (courseIds.length !== courses.length) {
      return res.status(400).json({
        success: false,
        message: 'Each course must include a courseId.',
      });
    }

    // ---------------------------------------------
    // Check duplicate coupon code
    // ---------------------------------------------

    const normalizedCode = String(couponCode)
      .trim()
      .toUpperCase();

    const existing = await Coupon.findOne({
      couponCode: normalizedCode,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Coupon code already exists.',
      });
    }

    // ---------------------------------------------
    // Prevent double-booking a course.
    //
    // A course can only ever be covered by ONE active coupon at a
    // time, regardless of type — as soon as any active coupon
    // touches a course, that course is off-limits for a new coupon
    // until the existing one is edited, expired, or deleted.
    // ---------------------------------------------

    const conflictingCoupon = await findCourseConflict(courseIds);

    if (conflictingCoupon) {
      return res.status(409).json({
        success: false,
        message:
          'One or more selected courses already has an active coupon. Edit that coupon instead of creating a new one.',
      });
    }

    // ---------------------------------------------
    // Create coupon
    // ---------------------------------------------

    const coupon = await Coupon.create({
      couponCode: normalizedCode,
      status,
      discountAmount: numericDiscountAmount,
      type: uniqueTypes,
      validFrom,
      validUntil,
      courses,
    });

    return res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (err) {
    console.error('createCoupon error:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ============================================================
// GET /api/coupons?search=SAVE&page=1&limit=8&status=Active
// GET ALL COUPONS
// ============================================================

exports.getCoupons = async (req, res) => {
  try {
    const {
      search = '',
      page = 1,
      limit = 10,
      status,
    } = req.query;

    const pageNum = Math.max(
      1,
      parseInt(page, 10) || 1
    );

    const limitNum = Math.max(
      1,
      parseInt(limit, 10) || 10
    );

    const query = {};

    // ---------------------------------------------
    // Search
    // ---------------------------------------------

    if (search && search.trim()) {
      const regex = new RegExp(
        search.trim(),
        'i'
      );

      query.$or = [
        {
          couponCode: regex,
        },
        {
          'courses.title': regex,
        },
        {
          'courses.courseCode': regex,
        },
      ];
    }

    // ---------------------------------------------
    // Status filter
    // ---------------------------------------------

    if (
      status &&
      status !== 'all'
    ) {
      query.status = status;
    }

    // ---------------------------------------------
    // Count
    // ---------------------------------------------

    const total =
      await Coupon.countDocuments(query);

    // ---------------------------------------------
    // Fetch coupons
    // ---------------------------------------------

    const coupons =
      await Coupon.find(query)
        .sort({
          createdAt: -1,
        })
        .skip(
          (pageNum - 1) * limitNum
        )
        .limit(limitNum);

    // ---------------------------------------------
    // Response
    // ---------------------------------------------

    return res.json({
      success: true,

      data: coupons,

      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.max(
          1,
          Math.ceil(
            total / limitNum
          )
        ),
      },
    });
  } catch (err) {
    console.error(
      'getCoupons error:',
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ============================================================
// GET /api/coupons/:id
// GET SINGLE COUPON
// ============================================================

exports.getCouponById = async (req, res) => {
  try {
    const coupon =
      await Coupon.findById(
        req.params.id
      );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      });
    }

    return res.json({
      success: true,
      data: coupon,
    });
  } catch (err) {
    console.error(
      'getCouponById error:',
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ============================================================
// PUT /api/coupons/:id
// UPDATE (EDIT) COUPON
//
// Everything is editable, including courses — code, status,
// discount, type, courses, and dates.
// ============================================================

exports.updateCoupon = async (req, res) => {
  try {
    const {
      couponCode,
      status,
      discountAmount,
      type,
      validFrom,
      validUntil,
      courses,
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      });
    }

    // ---------------------------------------------
    // Basic validation
    // ---------------------------------------------

    if (
      !couponCode ||
      discountAmount == null ||
      !validFrom ||
      !validUntil
    ) {
      return res.status(400).json({
        success: false,
        message:
          'couponCode, discountAmount, validFrom and validUntil are required.',
      });
    }

    const numericDiscountAmount = Number(discountAmount);

    if (
      Number.isNaN(numericDiscountAmount) ||
      numericDiscountAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Discount amount must be greater than 0.',
      });
    }

    const normalizedTypes = Array.isArray(type)
      ? type
      : type
        ? [type]
        : [];

    const uniqueTypes = [...new Set(normalizedTypes)];

    if (
      uniqueTypes.length === 0 ||
      uniqueTypes.some((t) => !ALLOWED_TYPES.includes(t))
    ) {
      return res.status(400).json({
        success: false,
        message: `type must include at least one of: ${ALLOWED_TYPES.join(
          ', '
        )}.`,
      });
    }

    if (
      new Date(validUntil) < new Date(validFrom)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Valid until date cannot be before valid from date.',
      });
    }

    // ---------------------------------------------
    // Duplicate coupon code (excluding this coupon itself)
    // ---------------------------------------------

    const normalizedCode = String(couponCode)
      .trim()
      .toUpperCase();

    if (normalizedCode !== coupon.couponCode) {
      const existing = await Coupon.findOne({
        couponCode: normalizedCode,
        _id: { $ne: coupon._id },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Coupon code already exists.',
        });
      }
    }

    // ---------------------------------------------
    // Validate courses — required, same shape as create.
    // Falls back to the coupon's existing courses if the request
    // doesn't include a `courses` field at all (e.g. a client that
    // only ever touches other fields), but an explicitly empty
    // array is rejected rather than silently ignored.
    // ---------------------------------------------

    const incomingCourses =
      courses === undefined ? coupon.courses : courses;

    if (!incomingCourses || incomingCourses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Select at least one course.',
      });
    }

    const courseIds = incomingCourses
      .map((c) => c && c.courseId)
      .filter(Boolean)
      .map(String);

    if (courseIds.length !== incomingCourses.length) {
      return res.status(400).json({
        success: false,
        message: 'Each course must include a courseId.',
      });
    }

    // A course can only ever belong to ONE active coupon at a
    // time. Make sure none of the (possibly new) selected courses
    // already belongs to a DIFFERENT active coupon.
    if (status === 'Active' && courseIds.length > 0) {
      const conflictingCoupon = await findCourseConflict(
        courseIds,
        coupon._id
      );

      if (conflictingCoupon) {
        return res.status(409).json({
          success: false,
          message:
            'One or more of these courses already has another active coupon.',
        });
      }
    }

    // ---------------------------------------------
    // Apply update
    // ---------------------------------------------

    coupon.couponCode = normalizedCode;
    coupon.status = status;
    coupon.discountAmount = numericDiscountAmount;
    coupon.type = uniqueTypes;
    coupon.validFrom = validFrom;
    coupon.validUntil = validUntil;
    coupon.courses = incomingCourses;

    await coupon.save();

    return res.json({
      success: true,
      data: coupon,
    });
  } catch (err) {
    console.error('updateCoupon error:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ============================================================
// DELETE /api/coupons/:id
// DELETE COUPON
// ============================================================

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      });
    }

    return res.json({
      success: true,
      data: coupon,
    });
  } catch (err) {
    console.error('deleteCoupon error:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ============================================================
// POST /api/coupons/validate
// VALIDATE & APPLY COUPON
// ============================================================


exports.validateCoupon = async (req, res) => {
  try {
    const {
      couponCode,
      courseId,
      type,
      amount,
    } = req.body;

    // ---------------------------------------------
    // 1. Basic validation
    // ---------------------------------------------

    if (!couponCode || !String(couponCode).trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a coupon code.",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course is required to validate the coupon.",
      });
    }

    if (!type || !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon type.",
      });
    }

    // ---------------------------------------------
    // 2. Validate course amount
    // ---------------------------------------------

    const numericAmount = Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid course amount.",
      });
    }

    // ---------------------------------------------
    // 3. Find coupon
    // ---------------------------------------------

    const normalizedCode = String(couponCode)
      .trim()
      .toUpperCase();

    const coupon = await Coupon.findOne({
      couponCode: normalizedCode,
    }).lean();

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code.",
      });
    }

    // ---------------------------------------------
    // 4. Status validation
    // ---------------------------------------------

    if (coupon.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "This coupon is inactive.",
      });
    }

    // ---------------------------------------------
    // 5. Date validation
    // ---------------------------------------------

    const now = new Date();

    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (
      Number.isNaN(validFrom.getTime()) ||
      Number.isNaN(validUntil.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon validity dates.",
      });
    }

    // Coupon remains valid until the end of validUntil date
    validUntil.setHours(23, 59, 59, 999);

    if (now < validFrom) {
      return res.status(400).json({
        success: false,
        message: `This coupon is not valid yet. It becomes valid from ${validFrom.toLocaleDateString()}.`,
      });
    }

    if (now > validUntil) {
      return res.status(400).json({
        success: false,
        message: `This coupon expired on ${validUntil.toLocaleDateString()}.`,
      });
    }

    // ---------------------------------------------
    // 6. Coupon type validation
    //
    // coupon.type is now an array — the requested enrollment
    // `type` just needs to be one of the types the coupon covers.
    // ---------------------------------------------

    const couponTypes = getCouponTypes(coupon);

    if (!couponTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `This coupon is only available for ${couponTypes.join(
          ' or '
        )} enrollment.`,
      });
    }

    // ---------------------------------------------
    // 7. Course validation
    // ---------------------------------------------

    const normalizedCourseId = String(courseId);

    const applicableCourse = (coupon.courses || []).find(
      (course) =>
        String(course.courseId) === normalizedCourseId
    );

    if (!applicableCourse) {
      return res.status(400).json({
        success: false,
        message:
          "This coupon is not applicable to the selected course.",
      });
    }

    // ---------------------------------------------
    // 8. FIXED AMOUNT DISCOUNT
    //
    // Example:
    // Course price     = $500
    // Coupon discount  = $100
    // Final amount     = $400
    // ---------------------------------------------

    /*
     * Support both fields temporarily:
     *
     * - discountAmount  -> new field
     * - discountValue   -> old field
     *
     * This prevents existing coupons from breaking.
     */
    const storedDiscount =
      coupon.discountAmount != null
        ? coupon.discountAmount
        : coupon.discountValue;

    const discountAmount = Number(storedDiscount);

    if (
      Number.isNaN(discountAmount) ||
      discountAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon discount amount.",
      });
    }

    // ---------------------------------------------
    // 9. Never allow discount above course amount
    // ---------------------------------------------

    const appliedDiscount = Math.min(
      discountAmount,
      numericAmount
    );

    // ---------------------------------------------
    // 10. Calculate final amount
    // ---------------------------------------------

    const finalAmount = Math.max(
      0,
      numericAmount - appliedDiscount
    );

    // ---------------------------------------------
    // 11. Return successful validation
    // ---------------------------------------------

    return res.status(200).json({
      success: true,

      message: "Coupon applied successfully.",

      data: {
        couponId: coupon._id,

        couponCode: coupon.couponCode,

        type: couponTypes,

        courseId: normalizedCourseId,

        // Fixed amount discount
        discountAmount: Number(
          appliedDiscount.toFixed(2)
        ),

        originalAmount: Number(
          numericAmount.toFixed(2)
        ),

        finalAmount: Number(
          finalAmount.toFixed(2)
        ),

        validFrom: coupon.validFrom,

        validUntil: coupon.validUntil,
      },
    });
  } catch (error) {
    console.error(
      "validateCoupon error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to validate coupon.",
    });
  }
};
