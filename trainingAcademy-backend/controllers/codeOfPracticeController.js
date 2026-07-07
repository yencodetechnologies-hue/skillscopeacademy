const mongoose = require("mongoose")
const slugify = require("slugify")
const CodeOfPractice = require("../models/CodeOfPractice")
const { logAdminActivity } = require("../utils/logAdminActivity")

function uploadedUrl(file) {
  if (!file) return ""
  return file.path || file.secure_url || file.url || ""
}

const buildSlug = (v) => (v ? slugify(String(v), { lower: true, strict: true }) : "")

async function uniqueSlug(base, excludeId = null) {
  let slug = base || "document"
  let i = 1
  while (true) {
    const query = { slug }
    if (excludeId) query._id = { $ne: excludeId }
    const exists = await CodeOfPractice.findOne(query)
    if (!exists) return slug
    i += 1
    slug = `${base}-${i}`
  }
}

exports.getPublic = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: [] })
    }

    const docs = await CodeOfPractice.find({
      active: true,
      fileUrl: { $exists: true, $ne: "" },
    })
      .sort({ order: 1, createdAt: 1 })
      .select("title slug description fileUrl order updatedAt")

    res.json({ success: true, data: docs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.getBySlug = async (req, res) => {
  try {
    const slug = (req.params.slug || "").toLowerCase().trim()
    const doc = await CodeOfPractice.findOne({ slug, active: true })
    if (!doc) return res.status(404).json({ success: false, message: "Not found" })
    res.json({ success: true, data: doc })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.getAll = async (req, res) => {
  try {
    const docs = await CodeOfPractice.find().sort({ order: 1, createdAt: 1 })
    res.json({ success: true, data: docs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.create = async (req, res) => {
  try {
    const { title = "", description = "" } = req.body

    if (!title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" })
    }

    const fileField = req.files?.file?.[0]
    const finalFileUrl = uploadedUrl(fileField) || (req.body.fileUrl || "").trim()
    if (!finalFileUrl) {
      return res.status(400).json({ success: false, message: "PDF file is required" })
    }

    const slug = await uniqueSlug(buildSlug(title))
    const last = await CodeOfPractice.findOne().sort("-order")

    const doc = await CodeOfPractice.create({
      title: title.trim(),
      slug,
      description: description.trim(),
      fileUrl: finalFileUrl,
      order: last ? last.order + 1 : 1,
      active: true,
    })

    logAdminActivity(req, {
      action: "create",
      module: "code_of_practice",
      summary: `Added Code of Practice document: ${doc.title}`,
      targetId: doc._id,
      statusCode: 201,
    })
    res.status(201).json({ success: true, data: doc })
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.slug) {
      return res.status(409).json({ success: false, message: "A document with a similar title already exists" })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.update = async (req, res) => {
  try {
    const existing = await CodeOfPractice.findById(req.params.id)
    if (!existing) {
      return res.status(404).json({ success: false, message: "Not found" })
    }

    const { title, description, fileUrl } = req.body
    const fileField = req.files?.file?.[0]

    const updates = {}
    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ success: false, message: "Title is required" })
      }
      updates.title = String(title).trim()
      if (updates.title !== existing.title) {
        updates.slug = await uniqueSlug(buildSlug(updates.title), existing._id)
      }
    }
    if (description !== undefined) updates.description = String(description).trim()

    updates.fileUrl = uploadedUrl(fileField)
      || (fileUrl !== undefined && fileUrl !== null ? String(fileUrl).trim() || existing.fileUrl : existing.fileUrl)

    const doc = await CodeOfPractice.findByIdAndUpdate(req.params.id, updates, { new: true })

    logAdminActivity(req, {
      action: "update",
      module: "code_of_practice",
      summary: `Updated Code of Practice document: ${doc.title}`,
      targetId: doc._id,
    })
    res.json({ success: true, data: doc })
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.slug) {
      return res.status(409).json({ success: false, message: "A document with a similar title already exists" })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.toggleActive = async (req, res) => {
  try {
    const doc = await CodeOfPractice.findById(req.params.id)
    if (!doc) return res.status(404).json({ success: false, message: "Not found" })
    doc.active = !doc.active
    await doc.save()
    logAdminActivity(req, {
      action: "toggle",
      module: "code_of_practice",
      summary: `${doc.active ? "Activated" : "Deactivated"} Code of Practice document: ${doc.title}`,
      targetId: doc._id,
    })
    res.json({ success: true, data: doc })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.reorder = async (req, res) => {
  try {
    const { documents } = req.body
    if (!Array.isArray(documents)) {
      return res.status(400).json({ success: false, message: "documents array required" })
    }
    const ops = documents.map((d) => ({
      updateOne: { filter: { _id: d.id }, update: { order: d.order } },
    }))
    if (ops.length) await CodeOfPractice.bulkWrite(ops)
    logAdminActivity(req, {
      action: "reorder",
      module: "code_of_practice",
      summary: `Reordered ${documents.length} Code of Practice document(s)`,
    })
    res.json({ success: true, message: "Reordered successfully" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const doc = await CodeOfPractice.findByIdAndDelete(req.params.id)
    if (!doc) return res.status(404).json({ success: false, message: "Not found" })

    const remaining = await CodeOfPractice.find().sort({ order: 1, createdAt: 1 })
    const ops = remaining.map((d, i) => ({
      updateOne: { filter: { _id: d._id }, update: { order: i + 1 } },
    }))
    if (ops.length) await CodeOfPractice.bulkWrite(ops)

    logAdminActivity(req, {
      action: "delete",
      module: "code_of_practice",
      summary: `Deleted Code of Practice document: ${doc.title}`,
      targetId: doc._id,
    })
    res.json({ success: true, message: "Deleted successfully" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}