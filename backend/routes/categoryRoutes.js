const express = require("express");
const router = express.Router();

const { uploadCategory } = require("../middleware/upload");

const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  reorderCategories,
} = require("../controllers/categoryController");

router.post("/",  uploadCategory.single("image"), createCategory);
router.get("/",   getCategories);
// ✅ /reorder/all MUST be before /:id
router.put("/reorder/all", reorderCategories);
router.put("/:id", uploadCategory.single("image"), updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;