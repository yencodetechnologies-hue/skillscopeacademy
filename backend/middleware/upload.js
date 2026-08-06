const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")

const IMG_TRANSFORM = [
  { quality: "auto:good", fetch_format: "auto" },
  { width: 2000, height: 2000, crop: "limit" },
]

const isPdfFile = (file) =>
  file.mimetype === "application/pdf" ||
  file.originalname.toLowerCase().endsWith(".pdf")

const FILE_SIZE_LIMIT = 15 * 1024 * 1024 // 15 MB
const ENROLLMENT_FILE_SIZE_LIMIT = 5 * 1024 * 1024 // 5 MB (must match frontend)

const courseStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const cleanName = file.originalname
      .split(".")[0]
      .replace(/[^a-zA-Z0-9]/g, "_")

    const isPdf = isPdfFile(file)

    return {
      folder: "courses",

      // PDF → raw
      // Image → image
      resource_type: isPdf ? "raw" : "image",

      public_id: isPdf
        ? `${cleanName}-${Date.now()}.pdf`
        : `${cleanName}-${Date.now()}`,

      ...(isPdf ? {} : { transformation: IMG_TRANSFORM }),
    }
  },
})

const paymentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const cleanName = file.originalname
      .split(".")[0]
      .replace(/[^a-zA-Z0-9]/g, "_")

    const isPdf = isPdfFile(file)

    return {
      folder: "payment-slips",
      resource_type: isPdf ? "raw" : "image",
      public_id: isPdf
        ? `${cleanName}-${Date.now()}.pdf`
        : `${cleanName}-${Date.now()}`,
      ...(isPdf ? {} : { transformation: IMG_TRANSFORM }),
    }
  },
})

const enrollmentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const cleanName = file.originalname
      .split(".")[0]
      .replace(/[^a-zA-Z0-9]/g, "_")

    const isPdf = isPdfFile(file)

    return {
      folder: "enrollment-docs",
      resource_type: isPdf ? "raw" : "image",
      public_id: isPdf
        ? `${cleanName}-${Date.now()}.pdf`
        : `${cleanName}-${Date.now()}`,
      ...(isPdf ? {} : { transformation: IMG_TRANSFORM }),
    }
  },
})

const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const cleanName = file.originalname
      .split(".")[0]
      .replace(/[^a-zA-Z0-9]/g, "_")

    return {
      folder: "gallery",
      resource_type: "image",
      public_id: isPdf
        ? `${cleanName}-${Date.now()}.pdf`
        : `${cleanName}-${Date.now()}`,
      transformation: IMG_TRANSFORM,
    }
  },
})

const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "categories",
    resource_type: "image",
    transformation: IMG_TRANSFORM,
  },
})

const sliderStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sliders",
    resource_type: "image",
    transformation: IMG_TRANSFORM,
  },
})

const partnerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "partners",
    resource_type: "image",
    transformation: IMG_TRANSFORM,
  },
})

const siteBannerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "site-banners",
    resource_type: "image",
    transformation: IMG_TRANSFORM,
  },
})

const uploadGallery = multer({
  storage: galleryStorage,
  limits: { fileSize: FILE_SIZE_LIMIT },
})

const uploadEnrollment = multer({
  storage: enrollmentStorage,
  limits: { fileSize: ENROLLMENT_FILE_SIZE_LIMIT },
})

const uploadCourse = multer({
  storage: courseStorage,
  limits: { fileSize: FILE_SIZE_LIMIT },
})

const uploadPayment = multer({
  storage: paymentStorage,
  limits: { fileSize: FILE_SIZE_LIMIT },
})

const uploadCategory = multer({
  storage: categoryStorage,
  limits: { fileSize: FILE_SIZE_LIMIT },
})

const uploadSlider = multer({
  storage: sliderStorage,
  limits: { fileSize: FILE_SIZE_LIMIT },
})

const uploadPartner = multer({
  storage: partnerStorage,
  limits: { fileSize: FILE_SIZE_LIMIT },
})

const uploadSiteBanner = multer({
  storage: siteBannerStorage,
  limits: { fileSize: FILE_SIZE_LIMIT },
})

const formDocumentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const cleanName = file.originalname
      .split(".")[0]
      .replace(/[^a-zA-Z0-9]/g, "_")

    const isPdf = isPdfFile(file)

    return {
      folder: "form-documents",
      resource_type: isPdf ? "raw" : "image",
      public_id: isPdf
        ? `${cleanName}-${Date.now()}.pdf`
        : `${cleanName}-${Date.now()}`,

      ...(isPdf ? {} : { transformation: IMG_TRANSFORM }),
    }
  },
})
const uploadFormDocument = multer({
  storage: formDocumentStorage,
  limits: { fileSize: FILE_SIZE_LIMIT },
})

const codeOfPracticeStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const cleanName = file.originalname
      .split(".")[0]
      .replace(/[^a-zA-Z0-9]/g, "_")

    const isPdf = isPdfFile(file)

    return {
      folder: "code-of-practice",
      resource_type: isPdf ? "raw" : "image",
      public_id: isPdf
        ? `${cleanName}-${Date.now()}.pdf`
        : `${cleanName}-${Date.now()}`,

      ...(isPdf ? {} : { transformation: IMG_TRANSFORM }),
    }
  },
})
const uploadCodeOfPractice = multer({
  storage: codeOfPracticeStorage,
  limits: { fileSize: FILE_SIZE_LIMIT },
})

// Promotion Mail Attachment Upload
const promotionMailStorage = multer.memoryStorage();


const uploadCustomMail = multer({

  storage: promotionMailStorage,

  limits: {
    fileSize: FILE_SIZE_LIMIT
  }

});
const customMailStorage = multer.memoryStorage();

const uploadPromotionMail = multer({

  storage: customMailStorage,

  limits: {
    fileSize: FILE_SIZE_LIMIT
  }

});
module.exports = {
  uploadCourse,
  uploadPayment,
  uploadEnrollment,
  uploadGallery,
  uploadCategory,
  uploadSlider,
  uploadPartner,
  uploadSiteBanner,
    uploadFormDocument,
      uploadCodeOfPractice, 
      uploadPromotionMail,
      uploadCustomMail
}