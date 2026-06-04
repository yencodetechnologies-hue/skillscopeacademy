const Banner = require('../models/Banner')

/*
=======================================
GET ALL BANNERS (sorted by order asc)
=======================================
*/
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 })
    res.json({ success: true, banners })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/*
=======================================
CREATE BANNER
Body: { title, subtitle, link, linkText, order }
File: image (via multer/Cloudinary)
=======================================
*/
exports.createBanner = async (req, res) => {
  try {
    const image = req.file?.path || ''

    const banner = await Banner.create({
      title:    req.body.title    || '',
      subtitle: req.body.subtitle || '',
      link:     req.body.link     || '',
      linkText: req.body.linkText || 'Learn More',
      order:    Number(req.body.order) || 0,
      isActive: true,
      image,
    })

    res.status(201).json({ success: true, banner })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/*
=======================================
UPDATE BANNER (text fields only)
Body: { title, subtitle, link, linkText, order }
File: image (optional — only updated if new file uploaded)
=======================================
*/
exports.updateBanner = async (req, res) => {
  try {
    const updateData = {
      title:    req.body.title    || '',
      subtitle: req.body.subtitle || '',
      link:     req.body.link     || '',
      linkText: req.body.linkText || 'Learn More',
      order:    Number(req.body.order) || 0,
    }

    // Only replace image if a new file was uploaded
    if (req.file?.path) updateData.image = req.file.path

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' })
    }

    res.json({ success: true, banner })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/*
=======================================
DELETE BANNER
=======================================
*/
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id)

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' })
    }

    res.json({ success: true, message: 'Banner deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/*
=======================================
TOGGLE BANNER isActive
=======================================
*/
exports.toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' })
    }

    banner.isActive = !banner.isActive
    await banner.save()

    res.json({
      success: true,
      message: `Banner is now ${banner.isActive ? 'active' : 'inactive'}`,
      banner,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}