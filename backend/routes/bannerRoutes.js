const express = require('express')
const router  = express.Router()
const upload  = require('../middleware/uploadMiddleware')

const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBanner,
} = require('../controllers/bannerController')

router.get('/',              getBanners)
router.post('/',             upload.single('image'), createBanner)
router.put('/:id',           upload.single('image'), updateBanner)
router.delete('/:id',        deleteBanner)
router.patch('/:id/toggle',  toggleBanner)

module.exports = router