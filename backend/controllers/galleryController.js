const Gallery = require('../models/Gallery')

/*
=======================================
GET ALL GALLERY ITEMS (sorted by order)
=======================================
*/
exports.getGallery = async (req, res) => {
  try {
    const items = await Gallery.find().sort({ order: 1, createdAt: -1 })
    res.json({ success: true, gallery: items })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/*
=======================================
UPLOAD / ADD GALLERY IMAGE
File: image (via multer/Cloudinary — required)
Body: { caption, order }
=======================================
*/
exports.uploadGallery = async (req, res) => {
  try {
    if (!req.file?.path) {
      return res.status(400).json({ success: false, message: 'Image file is required' })
    }
    console.log("file =>", req.file)
console.log("body =>", req.body)

    const item = await Gallery.create({
      image:   req.file.path,
      caption: req.body.caption || '',
      order:   Number(req.body.order) || 0,
    })

    res.status(201).json({ success: true, item })
  } catch (err) {
      console.log("gallery error full =>", err)
  console.log("gallery error message =>", err.message)
  console.log("gallery error stack =>", err.stack)
    

    res.status(500).json({ success: false, message: err.message })
  }
}

/*
=======================================
DELETE GALLERY ITEM
=======================================
*/
exports.deleteGallery = async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id)

    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' })
    }

    res.json({ success: true, message: 'Gallery item deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}