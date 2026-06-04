const express = require('express')
const router  = express.Router()
const upload  = require('../middleware/uploadMiddleware')

const {
  getGallery,
  uploadGallery,
  deleteGallery,
} = require('../controllers/galleryController')

router.get('/',       getGallery)
router.post('/',      upload.single('image'), uploadGallery)
router.delete('/:id', deleteGallery)

module.exports = router