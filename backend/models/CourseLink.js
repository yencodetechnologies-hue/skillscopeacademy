// models/CourseLink.js

const mongoose = require("mongoose")

const courseLinkSchema = new mongoose.Schema({
    // ── References ──────────────────────────────────────
    companyPaymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyPayment",
        required: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },

    // ── Course Info ──────────────────────────────────────
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    courseName: { type: String, default: "" },
    courseCode: { type: String, default: "" },

    // ── Session Info ─────────────────────────────────────
    sessionId: { type: String, default: "" },
    sessionDate: { type: Date, default: null },
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },

    // ── Usage Tracking ───────────────────────────────────
    maxUses: { type: Number, required: true },   // = quantity
    usedCount: { type: Number, default: 0 },

    // ── Link Token ───────────────────────────────────────
    token: {
        type: String,
        unique: true,
        required: true,
    },

    // ── Status ───────────────────────────────────────────
    isActive: { type: Boolean, default: true },

}, { timestamps: true })

// ✅ Virtual: expired check
courseLinkSchema.virtual("isExpired").get(function () {
    return this.usedCount >= this.maxUses
})

module.exports = mongoose.model("CourseLink", courseLinkSchema)