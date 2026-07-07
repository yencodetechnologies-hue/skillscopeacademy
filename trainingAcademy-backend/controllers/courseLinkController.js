// controllers/courseLinkController.js

const CourseLink = require("../models/CourseLink")
const Company = require("../models/Company")
const crypto = require("crypto")
const { dedupeCourseLinks } = require("../utils/dedupeCourseLinks")

// ─────────────────────────────────────────────────────────────
// 1. Generate links for a payment (called after payment create)
// POST /api/course-links/generate
// ─────────────────────────────────────────────────────────────
exports.generateLinks = async (req, res) => {
    try {
        const { companyPaymentId, companyId, courses } = req.body

        if (!companyPaymentId || !companyId || !courses?.length) {
            return res.status(400).json({ message: "Missing required fields" })
        }

        // Each course → one unique link; skip if already created (e.g. by createPayment)
        const links = await Promise.all(courses.map(async (course) => {
            const existing = await CourseLink.findOne({
                companyPaymentId,
                courseId: course.courseId,
            })
            if (existing) return existing

            const token = crypto.randomBytes(20).toString("hex")

            return CourseLink.create({
                companyPaymentId,
                companyId,
                courseId:    course.courseId,
                courseName:  course.courseName,
                courseCode:  course.courseCode,
                sessionId:   course.sessionId || "",
                sessionDate: course.sessionDate || null,
                startTime:   course.startTime || "",
                endTime:     course.endTime || "",
                maxUses:     course.quantity,
                usedCount:   0,
                token,
                isActive:    true,
            })
        }))

        res.status(201).json({ success: true, data: links })
    } catch (err) {
        console.error("generateLinks error:", err)
        res.status(500).json({ success: false, message: err.message })
    }
}

// ─────────────────────────────────────────────────────────────
// 2. Validate a link (called when user clicks link)
// GET /api/course-links/validate/:token
// ─────────────────────────────────────────────────────────────
exports.validateLink = async (req, res) => {
    try {
        const { token } = req.params
        const link = await CourseLink.findOne({ token })

        if (!link) {
            return res.status(404).json({ 
                valid: false, 
                message: "Invalid link" 
            })
        }

        if (!link.isActive) {
            return res.status(410).json({ 
                valid: false, 
                message: "This link has been deactivated" 
            })
        }

        if (link.usedCount >= link.maxUses) {
            return res.status(410).json({ 
                valid: false,
                expired: true,
                message: `This link has expired. All ${link.maxUses} slots have been filled.`,
                usedCount: link.usedCount,
                maxUses: link.maxUses,
            })
        }

        // ✅ Valid — return course + session info
        const company = await Company.findById(link.companyId).select("payLater")

        res.json({
            valid: true,
            data: {
                courseId:    link.courseId,
                courseName:  link.courseName,
                courseCode:  link.courseCode,
                sessionId:   link.sessionId,
                sessionDate: link.sessionDate,
                startTime:   link.startTime,
                endTime:     link.endTime,
                remaining:   link.maxUses - link.usedCount,
                maxUses:     link.maxUses,
                usedCount:   link.usedCount,
                companyId:   link.companyId,
                token:       link.token,
                payLater:    company?.payLater || false,
            }
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ─────────────────────────────────────────────────────────────
// 3. Use a link (called after enrollment complete)
// PATCH /api/course-links/use/:token
// ─────────────────────────────────────────────────────────────
exports.useLink = async (req, res) => {
    try {
        const { token } = req.params
        const link = await CourseLink.findOne({ token })

        if (!link) {
            return res.status(404).json({ message: "Link not found" })
        }

        if (link.usedCount >= link.maxUses) {
            return res.status(410).json({ 
                message: "Link expired — all slots filled" 
            })
        }

        // ✅ Increment usage
        link.usedCount += 1
        await link.save()

        res.json({
            success: true,
            remaining: link.maxUses - link.usedCount,
            usedCount: link.usedCount,
            maxUses: link.maxUses,
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ─────────────────────────────────────────────────────────────
// 4. Get links by payment ID (for success page)
// GET /api/course-links/payment/:paymentId
// ─────────────────────────────────────────────────────────────
exports.getLinksByPayment = async (req, res) => {
    try {
        const links = await CourseLink.find({
            companyPaymentId: req.params.paymentId,
        }).lean()

        res.json({ success: true, data: dedupeCourseLinks(links) })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// courseLinkController.js-ல் add பண்ணு
exports.getLinksByCompany = async (req, res) => {
    try {
        const { companyId } = req.params
        const links = await CourseLink.find({ companyId })
            .sort({ createdAt: -1 })
            .lean()
        res.json(dedupeCourseLinks(links))
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

