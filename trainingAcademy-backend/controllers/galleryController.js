const Gallery = require("../models/Gallery")
const { logAdminActivity } = require("../utils/logAdminActivity")

// GET /api/gallery
const getAll = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 })
    res.json({ success: true, data: images })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/gallery/:id
const getOne = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id)
    if (!image) return res.status(404).json({ success: false, message: "Not found" })
    res.json({ success: true, data: image })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/gallery
const create = async (req, res) => {
  try {
    const { title, category, courseName, imageUrl } = req.body

    if (!title || !title.trim())
      return res.status(400).json({ success: false, message: "Title is required" })

    // Cloudinary upload → req.file.path  |  URL paste → imageUrl from body
    const finalImageUrl = req.file ? req.file.path : imageUrl?.trim()

    if (!finalImageUrl)
      return res.status(400).json({ success: false, message: "Image is required" })

    const image = await Gallery.create({
      title:      title.trim(),
      imageUrl:   finalImageUrl,
      category:   category?.trim()   || "COURSE",
      courseName: courseName?.trim() || "Work Safely at Heights",
      active:     true,
    })

    logAdminActivity(req, { action: "create", module: "gallery", summary: `Added gallery image: ${image.title}`, targetId: image._id, statusCode: 201 })
    res.status(201).json({ success: true, data: image })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/gallery/:id
const update = async (req, res) => {
  try {
    const { title, category, courseName, imageUrl } = req.body

    if (!title || !title.trim())
      return res.status(400).json({ success: false, message: "Title is required" })

    const existing = await Gallery.findById(req.params.id)
    if (!existing) return res.status(404).json({ success: false, message: "Not found" })

    // New file uploaded → Cloudinary URL, else pasted URL or keep existing
    const finalImageUrl = req.file
      ? req.file.path
      : imageUrl?.trim() || existing.imageUrl

    const image = await Gallery.findByIdAndUpdate(
      req.params.id,
      {
        title:      title.trim(),
        imageUrl:   finalImageUrl,
        category:   category?.trim()   || "COURSE",
        courseName: courseName?.trim() || "Work Safely at Heights",
      },
      { returnDocument: "after" }
    )

    logAdminActivity(req, { action: "update", module: "gallery", summary: `Updated gallery image: ${image.title}`, targetId: image._id })
    res.json({ success: true, data: image })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PATCH /api/gallery/:id/toggle-active
const toggleActive = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id)
    if (!image) return res.status(404).json({ success: false, message: "Not found" })
    image.active = !image.active
    await image.save()
    logAdminActivity(req, { action: "toggle", module: "gallery", summary: `${image.active ? "Activated" : "Deactivated"} gallery image: ${image.title}`, targetId: image._id })
    res.json({ success: true, data: image })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/gallery/:id
const remove = async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id)
    if (!image) return res.status(404).json({ success: false, message: "Not found" })
    logAdminActivity(req, { action: "delete", module: "gallery", summary: `Deleted gallery image: ${image.title}`, targetId: image._id })
    res.json({ success: true, message: "Deleted successfully" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getAll, getOne, create, update, toggleActive, remove }