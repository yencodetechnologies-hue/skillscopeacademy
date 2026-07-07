const Course = require("../models/Course")
const Category = require("../models/Category")
const EnrollmentFlow = require("../models/EnrollmentFlows")
const slugify = require("slugify")
const { logAdminActivity } = require("../utils/logAdminActivity")

// ============================================================
// Live "studentsEnrolled" count helpers
// ------------------------------------------------------------
// `Course.studentsEnrolled` is a cached counter that gets $inc'd
// when a new EnrollmentFlow is created. It is NOT decremented on
// student/flow delete (or on direct DB cleanup), so the cached
// value drifts. We always derive the count live from the actual
// source-of-truth (EnrollmentFlow) at read time.
//
// Rules (mirror the createFlow increment intent):
//   • An individual flow counts only if its linked StudentMain
//     still exists (drops orphans left by direct DB deletes).
//   • Company/agent flows (studentId is null) always count.
//   • A flow contributes once per distinct courseId it contains.
// ============================================================
const buildLiveEnrollmentCounts = async (courseIds) => {
    const validIds = (courseIds || []).filter(Boolean)
    if (validIds.length === 0) return new Map()

    const counts = await EnrollmentFlow.aggregate([
        {
            $lookup: {
                from: "studentmains",
                localField: "studentId",
                foreignField: "_id",
                as: "_studentRef",
            },
        },
        {
            $match: {
                $or: [
                    { studentId: null },
                    { studentId: { $exists: false } },
                    { "_studentRef.0": { $exists: true } },
                ],
            },
        },
        { $unwind: "$items" },
        {
            $match: {
                "items.course.courseId": { $in: validIds },
            },
        },
        {
            $group: {
                _id: "$items.course.courseId",
                flowIds: { $addToSet: "$_id" },
            },
        },
        { $project: { _id: 1, count: { $size: "$flowIds" } } },
    ])

    return new Map(counts.map(c => [String(c._id), c.count]))
}

// Helper to parse FormData types correctly
const parseBody = (body) => {
    const parsed = { ...body }

    if (parsed.experienceBasedBooking !== undefined)
        parsed.experienceBasedBooking = parsed.experienceBasedBooking === "true"

    if (parsed.comboEnabled !== undefined)
        parsed.comboEnabled = parsed.comboEnabled === "true"

    // Auto-derive experienceBasedBooking from pricingType for backward compat
    if (parsed.pricingType) {
        parsed.experienceBasedBooking = parsed.pricingType === "experience"
    } else if (
        parsed.slblPrice != null ||
        parsed.slSinglePrice != null
    ) {
        parsed.pricingType = "slbl"
        parsed.experienceBasedBooking = false
    }

    const numberFields = [
        "originalPrice", "sellingPrice", "vocPrice",
        "slSingleStrikePrice", "slSinglePrice",
        "slblStrikePrice", "slblPrice",
        "withExperiencePrice", "withExperienceOriginal",
        "withoutExperiencePrice", "withoutExperienceOriginal",
        "comboPrice"
    ]
    numberFields.forEach(field => {
        if (parsed[field] !== undefined && parsed[field] !== "")
            parsed[field] = Number(parsed[field])
        else if (parsed[field] === "")
            parsed[field] = undefined
    })

    const arrayFields = [
        "description", "trainingOverview", "vocationalOutcome",
        "feesCharges", "optionalCharges", "outcomePoints",
        "requirements", "pathways"
    ]
    arrayFields.forEach(field => {
        if (typeof parsed[field] === "string") {
            try { parsed[field] = JSON.parse(parsed[field]) } catch { }
        }
    })

    // Handbook object mapping
    if (parsed.handbookTitle !== undefined || parsed.handbookUrl !== undefined || parsed.handbookPdf !== undefined || parsed.handbookCardImage !== undefined) {
        parsed.handbook = {
            title: parsed.handbookTitle,
            pdf: parsed.handbookPdf,
            url: parsed.handbookUrl,
            cardImage: parsed.handbookCardImage
        }
        // Clean up flat fields to avoid DB pollution if not in schema
        delete parsed.handbookTitle
        delete parsed.handbookPdf
        delete parsed.handbookUrl
        delete parsed.handbookCardImage
    }

    return parsed
}

// ✅ Helper: resolve category — accepts ObjectId or name string
const resolveCategory = async (categoryValue) => {
    if (!categoryValue) return null
    // If it looks like an ObjectId
    if (categoryValue.match?.(/^[0-9a-fA-F]{24}$/)) return categoryValue
    // Otherwise find by name
    const cat = await Category.findOne({ name: categoryValue })
    return cat?._id || null
}

// Sanitize whatever the admin typed into a clean URL-safe slug.
// We accept either an explicit `slug` from the form, or fall back to the
// title. Empty input always returns "" so the caller can decide what to do.
const buildSlug = (raw) => {
    const v = (raw || "").toString().trim()
    if (!v) return ""
    return slugify(v, { lower: true, strict: true })
}

// True if `slug` is already used by another course.
// `excludeId` lets the update flow ignore the row being edited.
const isSlugTaken = async (slug, excludeId = null) => {
    if (!slug) return false
    const query = { slug }
    if (excludeId) query._id = { $ne: excludeId }
    const existing = await Course.findOne(query).select("_id").lean()
    return !!existing
}

const createCourse = async (req, res) => {
    try {
        // Manual slug from the admin form, with title as a fallback so older
        // clients (or the future seed scripts) keep working.
        let slug = buildSlug(req.body.slug || req.body.title)
        if (!slug) {
            return res.status(400).json({
                field: "slug",
                message: "Slug is required",
            })
        }

        if (await isSlugTaken(slug)) {
            return res.status(409).json({
                field: "slug",
                message: "already exists, try a different one",
            })
        }

        let imageUrl = req.body.image
        if (req.files?.image) imageUrl = req.files.image[0].path

        let handbookPdf = req.body.handbookPdf
        if (req.files?.handbookPdf) handbookPdf = req.files.handbookPdf[0].path

        let handbookCardImage = req.body.handbookCardImage
        if (req.files?.handbookCardImage) handbookCardImage = req.files.handbookCardImage[0].path

        let syllabusUrl = req.body.syllabusUrl !== undefined ? req.body.syllabusUrl : req.body.syllabusPdf
        if (req.files?.syllabusPdf) syllabusUrl = req.files.syllabusPdf[0].path
        console.log("Saving Course with Syllabus URL:", syllabusUrl)

        const parsed = parseBody({ ...req.body, handbookPdf, handbookCardImage })

        // ✅ Resolve category to ObjectId
        parsed.category = await resolveCategory(parsed.category)

        const course = new Course({ ...parsed, image: imageUrl, slug, syllabusUrl })
        const savedCourse = await course.save()

        // Return with populated category as string
        const populated = await Course.findById(savedCourse._id).populate("category")
        const obj = populated.toObject()
        logAdminActivity(req, {
            action: "create",
            module: "course",
            summary: `Added course: ${savedCourse.title}`,
            targetId: savedCourse._id,
            statusCode: 201,
        })
        res.status(201).json({
            ...obj,
            categoryId: obj.category?._id || obj.category,
            category:   obj.category?.name || obj.category || "",
        })

    } catch (err) {
        // Race-condition safety net for the unique index.
        if (err?.code === 11000 && err?.keyPattern?.slug) {
            return res.status(409).json({
                field: "slug",
                message: "already exists, try a different one",
            })
        }
        res.status(500).json({ message: err.message })
    }
}

const VALID_COURSE_STATUSES = ["Active", "Inactive"]

const getCourses = async (req, res) => {
    try {
        const filter = {}
        const statusQuery = req.query.status
        if (statusQuery && VALID_COURSE_STATUSES.includes(statusQuery)) {
            filter.status = statusQuery
        }

        const courses = await Course.find(filter)
            .populate("category")
            .sort({ sortOrder: 1, createdAt: 1 })

        // Live count overrides the cached `studentsEnrolled` field so deletes
        // (admin UI or direct DB) are reflected immediately.
        const countMap = await buildLiveEnrollmentCounts(courses.map(c => c._id))

        // ✅ Transform: return category as string name (frontend compatible)
        // categoryId separately kept for internal use
        const transformed = courses.map(c => {
            const obj = c.toObject()
            return {
                ...obj,
                studentsEnrolled: countMap.get(String(obj._id)) || 0,
                categoryId: obj.category?._id || obj.category,
                category:   obj.category?.name || obj.category || "",
            }
        })

        res.json(transformed)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const updateCourse = async (req, res) => {
    try {
        const existingCourse = await Course.findById(req.params.id)
        if (!existingCourse) return res.status(404).json({ message: "Course not found" })

        let handbookPdf = req.body.handbookPdf
        if (req.files?.handbookPdf) {
            handbookPdf = req.files.handbookPdf[0].path
        }

        let handbookCardImage = req.body.handbookCardImage
        if (req.files?.handbookCardImage) {
            handbookCardImage = req.files.handbookCardImage[0].path
        }

        let syllabusUrl = req.body.syllabusUrl !== undefined ? req.body.syllabusUrl : req.body.syllabusPdf
        if (req.files?.syllabusPdf) {
            syllabusUrl = req.files.syllabusPdf[0].path
        }

        let updateData = parseBody({ ...req.body, handbookPdf, handbookCardImage })
        if (syllabusUrl !== undefined) updateData.syllabusUrl = syllabusUrl

        // Slug handling
        if (req.body.slug !== undefined) {
            const cleanSlug = buildSlug(req.body.slug)
            if (!cleanSlug) {
                return res.status(400).json({ field: "slug", message: "Slug is required" })
            }
            if (await isSlugTaken(cleanSlug, req.params.id)) {
                return res.status(409).json({ field: "slug", message: "already exists, try a different one" })
            }
            updateData.slug = cleanSlug
        } else {
            delete updateData.slug
        }

        if (req.files?.image) {
            updateData.image = req.files.image[0].path
        }

        // Merge handbook data to preserve existing if not provided in request
        // (Note: parseBody already created updateData.handbook if handbook fields were in body)
        if (updateData.handbook) {
            updateData.handbook = {
                title: updateData.handbook.title !== undefined ? updateData.handbook.title : existingCourse.handbook?.title,
                pdf: updateData.handbook.pdf !== undefined ? updateData.handbook.pdf : existingCourse.handbook?.pdf,
                url: updateData.handbook.url !== undefined ? updateData.handbook.url : existingCourse.handbook?.url,
                cardImage: updateData.handbook.cardImage !== undefined ? updateData.handbook.cardImage : existingCourse.handbook?.cardImage
            }
        }

        // ✅ Resolve category to ObjectId
        if (updateData.category) {
            updateData.category = await resolveCategory(updateData.category)
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            updateData,
            { returnDocument: "after" }
        ).populate("category")

        const obj = updatedCourse.toObject()
        logAdminActivity(req, {
            action: "update",
            module: "course",
            summary: `Updated course: ${updatedCourse.title}`,
            targetId: updatedCourse._id,
        })
        res.json({
            ...obj,
            categoryId: obj.category?._id || obj.category,
            category:   obj.category?.name || obj.category || "",
        })

    } catch (err) {
        if (err?.code === 11000 && err?.keyPattern?.slug) {
            return res.status(409).json({
                field: "slug",
                message: "already exists, try a different one",
            })
        }
        res.status(500).json({ message: err.message })
    }
}

const deleteCourse = async (req, res) => {
    try {
        const existing = await Course.findById(req.params.id).select("title")
        await Course.findByIdAndDelete(req.params.id)
        logAdminActivity(req, {
            action: "delete",
            module: "course",
            summary: `Deleted course${existing?.title ? `: ${existing.title}` : ""}`,
            targetId: req.params.id,
        })
        res.json({ message: "Course deleted successfully" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate("category")
        if (!course) return res.status(404).json({ message: "Course not found" })
        const obj = course.toObject()

        const countMap = await buildLiveEnrollmentCounts([course._id])

        res.json({
            ...obj,
            studentsEnrolled: countMap.get(String(obj._id)) || 0,
            categoryId: obj.category?._id || obj.category,
            category:   obj.category?.name || obj.category || "",
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Public lookup by slug — used by /course/:slug and /book-now/course/:slug.
// Mirrors getCourseById's response shape so the frontend can swap freely.
const getCourseBySlug = async (req, res) => {
    try {
        const slug = (req.params.slug || "").toLowerCase().trim()
        if (!slug) return res.status(400).json({ message: "Slug is required" })

        const course = await Course.findOne({ slug }).populate("category")
        if (!course) return res.status(404).json({ message: "Course not found" })
        if (course.status === "Inactive") {
            return res.status(404).json({ message: "Course not available" })
        }

        const obj = course.toObject()
        const countMap = await buildLiveEnrollmentCounts([course._id])

        res.json({
            ...obj,
            studentsEnrolled: countMap.get(String(obj._id)) || 0,
            categoryId: obj.category?._id || obj.category,
            category:   obj.category?.name || obj.category || "",
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Live availability check for the admin slug field's Yup async validator.
// Returns { available: true/false }. `excludeId` is the current course's
// _id (when editing) so the row being edited isn't flagged against itself.
const checkSlugAvailability = async (req, res) => {
    try {
        const slug = buildSlug(req.params.slug)
        if (!slug) return res.json({ available: false })

        const taken = await isSlugTaken(slug, req.query.excludeId || null)
        res.json({ available: !taken, slug })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const reorderCourses = async (req, res) => {
    try {
        const { courses } = req.body
        const bulkOps = courses.map((c) => ({
            updateOne: {
                filter: { _id: c.id },
                update: { sortOrder: c.sortOrder },
            },
        }))
        await Course.bulkWrite(bulkOps)
        logAdminActivity(req, { action: "reorder", module: "course", summary: `Reordered ${courses.length} course(s)` })
        res.json({ message: "Courses reordered successfully" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    createCourse,
    getCourses,
    deleteCourse,
    updateCourse,
    getCourseById,
    getCourseBySlug,
    checkSlugAvailability,
    reorderCourses,
}