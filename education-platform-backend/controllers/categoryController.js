const Category = require('../models/Category')

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create({
      name:  req.body.name,
      image: req.file?.path || '',
      order: req.body.order || 0,
    })
    res.status(201).json({ success: true, category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, createdAt: -1 })
    res.json({ success: true, categories })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ── UPDATE category (name + optional new image) ──────────────
exports.updateCategory = async (req, res) => {
  try {
    const updateData = { name: req.body.name }
    if (req.file?.path) updateData.image = req.file.path

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }

    res.json({ success: true, category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Category deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ── REORDER categories ─────────────────────────────────────────
// Body: { orderedIds: ['id1', 'id2', ...] }
exports.reorderCategories = async (req, res) => {
  try {
    const { orderedIds } = req.body
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds array required' })
    }

    await Promise.all(
      orderedIds.map((id, idx) =>
        Category.findByIdAndUpdate(id, { order: idx })
      )
    )

    res.json({ success: true, message: 'Categories reordered' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}