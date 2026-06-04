// const multer = require('multer')
// const { CloudinaryStorage } = require('multer-storage-cloudinary')
// const cloudinary = require('../config/cloudinary')

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,

//   params: async (req, file) => ({
//     folder: 'edured-courses',

//     allowed_formats: [
//       'jpg',
//       'jpeg',
//       'png',
//       'webp',
//     ],
//   }),
// })

// const upload = multer({
//   storage,
// })

// module.exports = upload

const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary')

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    console.log('FILE =>', file)

    return {
      folder: 'edured-courses',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp','avif'],
    }
  },
})

module.exports = multer({ storage })