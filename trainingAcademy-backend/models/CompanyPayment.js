const mongoose = require("mongoose");

const companyPaymentSchema = new mongoose.Schema(
    {
        // ── References ──────────────────────────────────────────
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
        },
        flowId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EnrollmentFlow",
            default: null,
        },

        // ── Order Info ───────────────────────────────────────────
        orderId: {
            type: String,
            unique: true,
            default: () => "TXN-" + Date.now(),
        },
        courses: [
            {
                courseId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Course",
                    required: true,
                },
                courseName: { type: String, default: "" },
                courseCode: { type: String, default: "" },
                quantity: { type: Number, default: 1 },
                pricePerPerson: { type: Number, default: 0 },

                // Session details
                sessionId: { type: String, default: "" },
                sessionDate: { type: Date, default: null },
                startTime: { type: String, default: "" },
                endTime: { type: String, default: "" },
            }
        ],
        // ── Company Snapshot ─────────────────────────────────────
        companyName: { type: String, default: "" },
        email: { type: String, default: "" },
        mobile: { type: String, default: "" },

        // ── Payment Details ──────────────────────────────────────
        courseCount: { type: Number, default: 1 },
        amount: { type: Number, required: true },
        paymentMethod: {
            type: String,
            enum: ["Bank Transfer", "Card", "Card Payment", "Pay Later", "pay later"],
            default: "Bank Transfer",
        },

        // ── Receipt ──────────────────────────────────────────────
        receiptUrl: { type: String, default: "" },  // Cloudinary URL

        // ── Status ───────────────────────────────────────────────
        status: {
            type: String,
            enum: ["pending", "success", "failed"],
            default: "pending",
        },
        confirmed: { type: Boolean, default: false },
        confirmedAt: { type: Date, default: null },
        confirmedBy: { type: String, default: "" }, // admin name/id

        // ── Card Payment Details (eWAY) ──────────────────────────
        gatewayTransactionId: { type: String, default: "" },
        authorizationCode: { type: String, default: "" },

        // ── Bank Transfer Details ────────────────────────────────
        transactionReference: { type: String, default: "" },

        // ── Notes ───────────────────────────────────────────────
        notes: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("CompanyPayment", companyPaymentSchema);