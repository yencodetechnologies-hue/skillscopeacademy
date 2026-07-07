const mongoose = require("mongoose")
const SiteBanner = require("../models/SiteBanner")
const { logAdminActivity } = require("../utils/logAdminActivity")

function uploadedImageUrl(file) {
  if (!file) return ""
  return file.path || file.secure_url || file.url || ""
}

// GET /api/site-banner/public — active banners in display order
exports.getPublic = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, data: [] })
    }

    const banners = await SiteBanner.find({
      active: true,
      imageUrl: { $exists: true, $ne: "" },
    })
      .sort({ order: 1, createdAt: 1 })
      .select("title link imageUrl order updatedAt")

    res.json({ success: true, data: banners })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/site-banner — all (admin)
exports.getAll = async (req, res) => {
  try {
    const banners = await SiteBanner.find().sort({ order: 1, createdAt: 1 })
    res.json({ success: true, data: banners })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/site-banner
exports.create = async (req, res) => {
  try {
    const { title = "", link = "" } = req.body
    const finalImageUrl = uploadedImageUrl(req.file) || (req.body.imageUrl || "").trim()

    if (!finalImageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image is required (*).",
      })
    }

    const last = await SiteBanner.findOne().sort("-order")
    const banner = await SiteBanner.create({
      title: title.trim(),
      imageUrl: finalImageUrl,
      link: link.trim(),
      order: last ? last.order + 1 : 1,
      active: true,
    })

    logAdminActivity(req, {
      action: "create",
      module: "site_banner",
      summary: `Added site banner${banner.title ? `: ${banner.title}` : ""}`,
      targetId: banner._id,
      statusCode: 201,
    })
    res.status(201).json({ success: true, data: banner })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/site-banner/:id
exports.update = async (req, res) => {
  try {
    const existing = await SiteBanner.findById(req.params.id)
    if (!existing) {
      return res.status(404).json({ success: false, message: "Not found" })
    }

    const { title, link } = req.body
    const nextImageUrl = uploadedImageUrl(req.file)
      || (req.body.imageUrl !== undefined && req.body.imageUrl !== null
        ? String(req.body.imageUrl).trim() || existing.imageUrl
        : existing.imageUrl)

    const updates = { imageUrl: nextImageUrl }
    if (title !== undefined) updates.title = String(title).trim()
    if (link !== undefined) updates.link = String(link).trim()

    const banner = await SiteBanner.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: 'after' }
    )

    logAdminActivity(req, {
      action: "update",
      module: "site_banner",
      summary: `Updated site banner${banner.title ? `: ${banner.title}` : ""}`,
      targetId: banner._id,
    })
    res.json({ success: true, data: banner })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PATCH /api/site-banner/:id/toggle-active
exports.toggleActive = async (req, res) => {
  try {
    const banner = await SiteBanner.findById(req.params.id)
    if (!banner) {
      return res.status(404).json({ success: false, message: "Not found" })
    }
    banner.active = !banner.active
    await banner.save()
    logAdminActivity(req, {
      action: "toggle",
      module: "site_banner",
      summary: `${banner.active ? "Activated" : "Deactivated"} site banner${banner.title ? `: ${banner.title}` : ""}`,
      targetId: banner._id,
    })
    res.json({ success: true, data: banner })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/site-banner/:id
exports.remove = async (req, res) => {
  try {
    const banner = await SiteBanner.findByIdAndDelete(req.params.id)
    if (!banner) {
      return res.status(404).json({ success: false, message: "Not found" })
    }

    const remaining = await SiteBanner.find().sort({ order: 1, createdAt: 1 })
    const ops = remaining.map((b, i) => ({
      updateOne: {
        filter: { _id: b._id },
        update: { order: i + 1 },
      },
    }))
    if (ops.length) await SiteBanner.bulkWrite(ops)

    logAdminActivity(req, {
      action: "delete",
      module: "site_banner",
      summary: `Deleted site banner${banner.title ? `: ${banner.title}` : ""}`,
      targetId: banner._id,
    })
    res.json({ success: true, message: "Deleted successfully" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/site-banner/reorder/all — body: { banners: [{ id, order }] }
exports.reorder = async (req, res) => {
  try {
    const { banners } = req.body
    if (!Array.isArray(banners)) {
      return res
        .status(400)
        .json({ success: false, message: "banners array required" })
    }
    const ops = banners.map((b) => ({
      updateOne: {
        filter: { _id: b.id },
        update: { order: b.order },
      },
    }))
    if (ops.length) await SiteBanner.bulkWrite(ops)
    logAdminActivity(req, {
      action: "reorder",
      module: "site_banner",
      summary: `Reordered ${banners.length} site banner(s)`,
    })
    res.json({ success: true, message: "Reordered successfully" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
