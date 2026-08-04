

const mongoose = require("mongoose");

const EnrollmentFlowSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentMain",
      required: false,
      default: null,
      index: true
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null
    },

    enrollmentType: {
      type: String,
      enum: ["Individual", "Company", "individual", "company", "agent", "Agent"],
      default: "Individual"
    },

    source: {
      type: String,
      enum: ["Company Link", "Booking Link", "Enrollment Link", "individual", "Manual Admin Add"],
      default: "individual"
    },

    sourceToken: { type: String, default: "" },

    items: [
      {
        course: {
          courseId: mongoose.Schema.Types.ObjectId,
          courseName: String,
          courseCategory: String,
          price: Number
        },

        payment: {
          status: {
            type: String,
            enum: ["pending", "success", "failed", "unpaid"],
            default: "pending"
          },
          paymentId: String,
          amount: Number,
          paidAt: Date,
          method: String,
          transactionId: String,
          gatewayTransactionId: String,
          slipUrl: String,
          rejectionReason: String
        },

        status: {
          type: String,
          enum: ["selected", "paid", "completed"],
          default: "selected"
        }
      }
    ],

    llnd: {
      answers: [
        {
          questionId: String,
          answer: String
        }
      ],

      summary: {
        total: Number,
        correct: Number,
        percentage: Number,
        sections: [
          {
            name: String,
            score: Number,
            correct: Number,
            total: Number,
            status: String
          }
        ]
      },

      score: Number,

      status: {
        type: String,
        enum: ["not_started", "completed"],
        default: "not_started"
      },

      completedAt: {
        type: Date,
        default: null
      }
    },

    sessionDate: Date,
    startTime: String,
    endTime: String,

    enrollmentFormId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "enrollmenforms"
    },

    enrollmentStatus: {
      type: String,
      enum: ["pending", "enrolled", "completed"],
      default: "pending"
    },
    enrolledAt: { type: Date },

    currentStep: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 1,
      index: true
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true
    },

    meta: {
      createdFromIP: String,
      userAgent: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EnrollmentFlow", EnrollmentFlowSchema);