const Category = require("../models/Category");
const Course = require("../models/Course");
const { logAdminActivity } = require("../utils/logAdminActivity");

exports.createCategory = async (req, res) => {
  try {
    const body = req.body || {};
    const name = (body.name || "").trim();
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: "Category already exists" });

    // Image: either a Cloudinary upload (req.file.path) or a pasted URL.
    const image = req.file ? req.file.path : (body.imageUrl || "").trim();

    const lastCategory = await Category.findOne().sort("-order");
    const newCategory = new Category({
      name,
      image,
      order: lastCategory ? lastCategory.order + 1 : 1,
    });
    await newCategory.save();
    logAdminActivity(req, { action: "create", module: "category", summary: `Added category: ${newCategory.name}`, targetId: newCategory._id, statusCode: 201 });
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort("order");

    // ✅ Count courses per category using ObjectId ref
    const courseCounts = await Course.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const countMap = {};
    courseCounts.forEach(item => {
      if (item._id) countMap[item._id.toString()] = item.count;
    });

    const categoriesWithCount = categories.map(cat => ({
      ...cat.toObject(),
      courseCount: countMap[cat._id.toString()] || 0,
    }));

    res.json(categoriesWithCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const existing = await Category.findById(id);
    if (!existing) return res.status(404).json({ message: "Category not found" });

    // Image priority: new file > pasted URL > keep existing.
    const nextImage = req.file
      ? req.file.path
      : (body.imageUrl !== undefined && body.imageUrl !== null
          ? String(body.imageUrl).trim()
          : existing.image);

    const update = {};
    if (body.name !== undefined) update.name = String(body.name).trim();
    update.image = nextImage;

    const category = await Category.findByIdAndUpdate(id, update, {
      returnDocument: "after",
    });

    // ✅ No Course.updateMany needed — courses ref by ObjectId, name change auto-reflected via populate

    logAdminActivity(req, { action: "update", module: "category", summary: `Updated category: ${category.name}`, targetId: category._id });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // ✅ Check live course count using ObjectId ref
    const courseCount = await Course.countDocuments({ category: category._id });

    if (courseCount > 0) {
      category.active = false;
      await category.save();
      logAdminActivity(req, { action: "toggle", module: "category", summary: `Deactivated category: ${category.name}`, targetId: category._id });
      return res.json({ message: "Category deactivated" });
    }

    await Category.findByIdAndDelete(id);
    logAdminActivity(req, { action: "delete", module: "category", summary: `Deleted category: ${category.name}`, targetId: id });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    const bulkOps = categories.map((cat) => ({
      updateOne: {
        filter: { _id: cat.id },
        update: { order: cat.order },
      },
    }));
    await Category.bulkWrite(bulkOps);
    logAdminActivity(req, { action: "reorder", module: "category", summary: `Reordered ${categories.length} categor(ies)` });
    res.json({ message: "Reordered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};