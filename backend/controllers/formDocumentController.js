const mongoose = require("mongoose")
const FormDocument = require("../models/FormDocument")
const { logAdminActivity } = require("../utils/logAdminActivity")

function uploadedUrl(file) {
  if (!file) return ""
  return file.path || file.secure_url || file.url || ""
}

// GET /api/form-documents/public — active documents for the public Forms page
exports.getPublic = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: [] })
    }

    const docs = await FormDocument.find({
      active: true,
      fileUrl: { $exists: true, $ne: "" },
    })
      .sort({ section: 1, order: 1, createdAt: 1 })
      .select("title description fileUrl section bannerImage order updatedAt")

    res.json({ success: true, data: docs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/form-documents — all (admin)
exports.getAll = async (req, res) => {
  try {
    const docs = await FormDocument.find().sort({ section: 1, order: 1, createdAt: 1 })
    res.json({ success: true, data: docs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/form-documents
exports.create = async (req, res) => {
  try {
    const { title = "", description = "", section = "list", fileUrl = "", bannerImage = "" } = req.body

    if (!title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" })
    }

    const safeSection = section === "featured" ? "featured" : "list"
    const fileField = req.files?.file?.[0]
    const bannerField = req.files?.bannerImage?.[0]

    const finalFileUrl = uploadedUrl(fileField) || fileUrl.trim()
    if (!finalFileUrl) {
      return res.status(400).json({ success: false, message: "PDF file is required" })
    }
    const finalBannerImage = uploadedUrl(bannerField) || bannerImage.trim()

    const last = await FormDocument.findOne({ section: safeSection }).sort("-order")
    const doc = await FormDocument.create({
      title: title.trim(),
      description: description.trim(),
      fileUrl: finalFileUrl,
      section: safeSection,
      bannerImage: finalBannerImage,
      order: last ? last.order + 1 : 1,
      active: true,
    })

    logAdminActivity(req, {
      action: "create",
      module: "form_documents",
      summary: `Added form document: ${doc.title}`,
      targetId: doc._id,
      statusCode: 201,
    })
    res.status(201).json({ success: true, data: doc })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/form-documents/:id
exports.update = async (req, res) => {
  try {
    const existing = await FormDocument.findById(req.params.id)
    if (!existing) {
      return res.status(404).json({ success: false, message: "Not found" })
    }

    const { title, description, section, fileUrl, bannerImage } = req.body
    const fileField = req.files?.file?.[0]
    const bannerField = req.files?.banner?.[0]

    const updates = {}
    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ success: false, message: "Title is required" })
      }
      updates.title = String(title).trim()
    }
    if (description !== undefined) updates.description = String(description).trim()
    if (section !== undefined) updates.section = section === "featured" ? "featured" : "list"

    updates.fileUrl = uploadedUrl(fileField)
      || (fileUrl !== undefined && fileUrl !== null ? String(fileUrl).trim() || existing.fileUrl : existing.fileUrl)

    updates.bannerImage = uploadedUrl(bannerField)
      || (bannerImage !== undefined && bannerImage !== null ? String(bannerImage).trim() || existing.bannerImage : existing.bannerImage)

    const doc = await FormDocument.findByIdAndUpdate(req.params.id, updates, { returnDocument: "after" })

    logAdminActivity(req, {
      action: "update",
      module: "form_documents",
      summary: `Updated form document: ${doc.title}`,
      targetId: doc._id,
    })
    res.json({ success: true, data: doc })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PATCH /api/form-documents/:id/toggle-active
exports.toggleActive = async (req, res) => {
  try {
    const doc = await FormDocument.findById(req.params.id)
    if (!doc) return res.status(404).json({ success: false, message: "Not found" })
    doc.active = !doc.active
    await doc.save()
    logAdminActivity(req, {
      action: "toggle",
      module: "form_documents",
      summary: `${doc.active ? "Activated" : "Deactivated"} form document: ${doc.title}`,
      targetId: doc._id,
    })
    res.json({ success: true, data: doc })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/form-documents/reorder/all — body: { documents: [{ id, order }] }
exports.reorder = async (req, res) => {
  try {
    const { documents } = req.body
    if (!Array.isArray(documents)) {
      return res.status(400).json({ success: false, message: "documents array required" })
    }
    const ops = documents.map((d) => ({
      updateOne: { filter: { _id: d.id }, update: { order: d.order } },
    }))
    if (ops.length) await FormDocument.bulkWrite(ops)
    logAdminActivity(req, {
      action: "reorder",
      module: "form_documents",
      summary: `Reordered ${documents.length} form document(s)`,
    })
    res.json({ success: true, message: "Reordered successfully" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/form-documents/:id
exports.remove = async (req, res) => {
  try {
    const doc = await FormDocument.findByIdAndDelete(req.params.id)
    if (!doc) return res.status(404).json({ success: false, message: "Not found" })

    const remaining = await FormDocument.find({ section: doc.section }).sort({ order: 1, createdAt: 1 })
    const ops = remaining.map((d, i) => ({
      updateOne: { filter: { _id: d._id }, update: { order: i + 1 } },
    }))
    if (ops.length) await FormDocument.bulkWrite(ops)

    logAdminActivity(req, {
      action: "delete",
      module: "form_documents",
      summary: `Deleted form document: ${doc.title}`,
      targetId: doc._id,
    })
    res.json({ success: true, message: "Deleted successfully" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}