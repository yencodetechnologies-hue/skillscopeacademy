const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },

    // Fixed amount discount
    discountAmount: {
      type: Number,
      required: true,
      min: 0
    },

    // Who can use the coupon — 'individual' and/or 'company'.
    // Stored as an array so a single coupon can cover both types,
    // or two separate coupons can each cover one type for the
    // same course.
    type: {
      type: [String],
      enum: ['individual', 'company'],
      required: true,
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message:
          'At least one coupon type (individual and/or company) is required.',
      },
    },

    validFrom: {
      type: Date,
      required: true,
    },

    validUntil: {
      type: Date,
      required: true,
    },

    // Courses this coupon applies to
    courses: [
      {
        courseId: {
          type: String,
          required: true,
        },
        courseCode: String,
        title: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

/*
 * Coupon is valid for the complete validUntil day.
 *
 * Example:
 * validUntil = Aug 31, 2026
 *
 * Coupon remains valid until:
 * Aug 31, 2026 23:59:59
 */
CouponSchema.methods.isExpired = function () {
  const now = new Date();

  if (this.status !== 'Active') {
    return true;
  }

  const validFrom = new Date(this.validFrom);

  const validUntil = new Date(this.validUntil);

  // End of validUntil day
  validUntil.setHours(23, 59, 59, 999);

  return now < validFrom || now > validUntil;
};

module.exports = mongoose.model('Coupon', CouponSchema);
