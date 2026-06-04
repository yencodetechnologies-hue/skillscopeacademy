const express = require('express')
const upload  = require('../middleware/uploadMiddleware')

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} = require('../controllers/categoryController')

const router = express.Router()

router.get('/getcategories',                        getCategories)
router.post('/createcategories', upload.single('image'), createCategory)
router.put('/:id',               upload.single('image'), updateCategory)   // ← NEW
router.delete('/:id',                               deleteCategory)
router.post('/reorder',                             reorderCategories)     // ← NEW

module.exports = router