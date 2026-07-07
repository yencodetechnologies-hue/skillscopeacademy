const Slider = require("../models/Slider")
const { logAdminActivity } = require("../utils/logAdminActivity")

// GET /api/sliders            → all (admin)
// GET /api/sliders?active=true → active only (public-friendly)
exports.getAll = async (req, res) => {
  try {
    const filter = {}
    if (req.query.active === "true") filter.active = true
    const sliders = await Slider.find(filter).sort({ order: 1, createdAt: 1 })
    res.json({ success: true, data: sliders })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.getOne = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id)
    if (!slider) return res.status(404).json({ success: false, message: "Not found" })
    res.json({ success: true, data: slider })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/sliders
// Accepts EITHER a multipart "image" file OR a body.imageUrl string.
exports.create = async (req, res) => {
  try {
    const { title = "", link = "" } = req.body
    const finalImageUrl = req.file ? req.file.path : (req.body.imageUrl || "").trim()

    if (!finalImageUrl)
      return res.status(400).json({ success: false, message: "Image is required" })

    const last = await Slider.findOne().sort("-order")
    const slider = await Slider.create({
      title:    title.trim(),
      imageUrl: finalImageUrl,
      link:     link.trim(),
      order:    last ? last.order + 1 : 1,
      active:   true,
    })

    logAdminActivity(req, { action: "create", module: "slider", summary: `Added slider${slider.title ? `: ${slider.title}` : ""}`, targetId: slider._id, statusCode: 201 })
    res.status(201).json({ success: true, data: slider })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/sliders/:id
exports.update = async (req, res) => {
  try {
    const existing = await Slider.findById(req.params.id)
    if (!existing) return res.status(404).json({ success: false, message: "Not found" })

    const { title, link } = req.body

    // Image priority: new file > pasted URL > keep existing.
    const nextImageUrl = req.file
      ? req.file.path
      : (req.body.imageUrl !== undefined && req.body.imageUrl !== null
          ? String(req.body.imageUrl).trim() || existing.imageUrl
          : existing.imageUrl)

    const updates = { imageUrl: nextImageUrl }
    if (title !== undefined) updates.title = String(title).trim()
    if (link  !== undefined) updates.link  = String(link).trim()

    const slider = await Slider.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
    })
    logAdminActivity(req, { action: "update", module: "slider", summary: `Updated slider${slider.title ? `: ${slider.title}` : ""}`, targetId: slider._id })
    res.json({ success: true, data: slider })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.toggleActive = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id)
    if (!slider) return res.status(404).json({ success: false, message: "Not found" })
    slider.active = !slider.active
    await slider.save()
    logAdminActivity(req, { action: "toggle", module: "slider", summary: `${slider.active ? "Activated" : "Deactivated"} slider${slider.title ? `: ${slider.title}` : ""}`, targetId: slider._id })
    res.json({ success: true, data: slider })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.remove = async (req, res) => {
  try {
    const slider = await Slider.findByIdAndDelete(req.params.id)
    if (!slider) return res.status(404).json({ success: false, message: "Not found" })
    logAdminActivity(req, { action: "delete", module: "slider", summary: `Deleted slider${slider.title ? `: ${slider.title}` : ""}`, targetId: slider._id })
    res.json({ success: true, message: "Deleted successfully" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/sliders/reorder/all
// Body: { sliders: [{ id, order }, ...] }
exports.reorder = async (req, res) => {
  try {
    const { sliders } = req.body
    if (!Array.isArray(sliders)) {
      return res.status(400).json({ success: false, message: "sliders array required" })
    }
    const ops = sliders.map(s => ({
      updateOne: {
        filter: { _id: s.id },
        update: { order: s.order },
      },
    }))
    if (ops.length) await Slider.bulkWrite(ops)
    logAdminActivity(req, { action: "reorder", module: "slider", summary: `Reordered ${sliders.length} slider(s)` })
    res.json({ success: true, message: "Reordered successfully" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
