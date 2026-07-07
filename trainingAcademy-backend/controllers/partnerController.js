const Partner = require("../models/Partner")
const { logAdminActivity } = require("../utils/logAdminActivity")

// GET /api/partners              → all (admin grid + Hide/Show)
// GET /api/partners?active=true  → only visible (used by the public marquee)
exports.getAll = async (req, res) => {
  try {
    const filter = {}
    if (req.query.active === "true") filter.active = true
    const partners = await Partner.find(filter).sort({ order: 1, createdAt: 1 })
    res.json({ success: true, data: partners })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.getOne = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id)
    if (!partner) return res.status(404).json({ success: false, message: "Not found" })
    res.json({ success: true, data: partner })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/partners
// Accepts EITHER a multipart "image" file OR a body.imageUrl string, so the
// admin can upload a fresh logo or paste an existing CDN URL.
exports.create = async (req, res) => {
  try {
    const { name = "", link = "" } = req.body
    const finalImageUrl = req.file ? req.file.path : (req.body.imageUrl || "").trim()

    if (!finalImageUrl)
      return res.status(400).json({ success: false, message: "Image is required" })

    // Append at the end of the order. Saves the admin a manual reorder for
    // the typical "add-then-show" flow.
    const last = await Partner.findOne().sort("-order")
    const partner = await Partner.create({
      name:     name.trim(),
      imageUrl: finalImageUrl,
      link:     link.trim(),
      order:    last ? last.order + 1 : 1,
      active:   true,
    })

    logAdminActivity(req, { action: "create", module: "partner", summary: `Added partner${partner.name ? `: ${partner.name}` : ""}`, targetId: partner._id, statusCode: 201 })
    res.status(201).json({ success: true, data: partner })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/partners/:id
exports.update = async (req, res) => {
  try {
    const existing = await Partner.findById(req.params.id)
    if (!existing) return res.status(404).json({ success: false, message: "Not found" })

    const { name, link } = req.body

    // Image priority: new file > pasted URL > keep existing.
    const nextImageUrl = req.file
      ? req.file.path
      : (req.body.imageUrl !== undefined && req.body.imageUrl !== null
          ? String(req.body.imageUrl).trim() || existing.imageUrl
          : existing.imageUrl)

    const updates = { imageUrl: nextImageUrl }
    if (name !== undefined) updates.name = String(name).trim()
    if (link !== undefined) updates.link = String(link).trim()

    const partner = await Partner.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
    })
    logAdminActivity(req, { action: "update", module: "partner", summary: `Updated partner${partner.name ? `: ${partner.name}` : ""}`, targetId: partner._id })
    res.json({ success: true, data: partner })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.toggleActive = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id)
    if (!partner) return res.status(404).json({ success: false, message: "Not found" })
    partner.active = !partner.active
    await partner.save()
    logAdminActivity(req, { action: "toggle", module: "partner", summary: `${partner.active ? "Activated" : "Deactivated"} partner${partner.name ? `: ${partner.name}` : ""}`, targetId: partner._id })
    res.json({ success: true, data: partner })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id)
    if (!partner) return res.status(404).json({ success: false, message: "Not found" })
    logAdminActivity(req, { action: "delete", module: "partner", summary: `Deleted partner${partner.name ? `: ${partner.name}` : ""}`, targetId: partner._id })
    res.json({ success: true, message: "Deleted successfully" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/partners/reorder/all
// Body: { partners: [{ id, order }, ...] } — fired after a drag-and-drop.
exports.reorder = async (req, res) => {
  try {
    const { partners } = req.body
    if (!Array.isArray(partners)) {
      return res.status(400).json({ success: false, message: "partners array required" })
    }
    const ops = partners.map(p => ({
      updateOne: {
        filter: { _id: p.id },
        update: { order: p.order },
      },
    }))
    if (ops.length) await Partner.bulkWrite(ops)
    logAdminActivity(req, { action: "reorder", module: "partner", summary: `Reordered ${partners.length} partner(s)` })
    res.json({ success: true, message: "Reordered successfully" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
