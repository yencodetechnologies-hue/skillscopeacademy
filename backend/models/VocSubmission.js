const mongoose = require("mongoose")

const VOC_PRICE_PER_COURSE = 150

const vocSubmissionSchema = new mongoose.Schema(
    {
        // ── Step 1: personal & contact ─────────────────────────
        firstName:     { type: String, required: true, trim: true },
        lastName:      { type: String, required: true, trim: true },
        email:         { type: String, required: true, trim: true, lowercase: true, index: true },
        phone:         { type: String, required: true, trim: true },
        studentId:     { type: String, default: "", trim: true },

        streetAddress: { type: String, required: true, trim: true },
        city:          { type: String, required: true, trim: true },
        state:         { type: String, required: true, trim: true },
        postcode:      { type: String, required: true, trim: true },

        // ── Step 2: courses ────────────────────────────────────
        courses: {
            type: [{
                _id:  false,
                name: { type: String, required: true },
                price: { type: Number, default: 150 },
                date: { type: String, required: true }, // human-readable, e.g. "Tue, 12 May 2026"
            }],
            validate: v => Array.isArray(v) && v.length > 0,
        },

        // Server-computed (= courses.length * VOC_PRICE_PER_COURSE)
        amount: { type: Number, required: true, min: 0 },

        // ── Step 3: payment ────────────────────────────────────
        paymentMethod: {
            type: String,
            enum: ["card", "bank"],
            required: true,
        },

        // Card path — only safe metadata. Never persist raw PAN / CVV.
        card: {
            name:          { type: String, default: "" },
            last4:         { type: String, default: "" },
            expiryMonth:   { type: String, default: "" },
            expiryYear:    { type: String, default: "" },
            transactionId: { type: String, default: "" },
        },

        ewayTransactionId:    { type: String, default: "" },
        gatewayTransactionId: { type: String, default: "" },

        // Bank path
        bank: {
            refId:    { type: String, default: "" },
            proofUrl: { type: String, default: "" },
        },

        // ── Workflow ───────────────────────────────────────────
        status: {
            type: String,
            enum: ["Pending", "Verified", "Rejected"],
            default: "Pending",
            index: true,
        },

        reviewedAt: { type: Date, default: null },
    },
    { timestamps: true }
)

// Convenience constant for controllers / routes
vocSubmissionSchema.statics.PRICE_PER_COURSE = VOC_PRICE_PER_COURSE

module.exports = mongoose.model("VocSubmission", vocSubmissionSchema)
