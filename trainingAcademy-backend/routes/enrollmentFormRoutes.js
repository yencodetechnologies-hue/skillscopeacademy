// const express = require("express");
// const router = express.Router();
// const { 
//   createEnrollmentForm, 
//   getEnrollmentForms, 
//   updateEnrollmentStatus,
//   saveSection,
//   saveSection2File,
//   saveSection3File,
//   deleteSection2File,
//   deleteSection3File,
//   deleteSection5File,
//   getEnrollmentFormById
// } = require("../controllers/enrollmentFormController");
// const { uploadEnrollment } = require("../middleware/upload");

// const enrollmentUploadFields = uploadEnrollment.fields([
//   { name: "idDocument", maxCount: 1 },
//   { name: "photoDocument", maxCount: 1 },
//   { name: "signature", maxCount: 1 },
//   { name: "qualificationFile", maxCount: 1 },
//   { name: "staIdFile", maxCount: 1 },
// ]);

// const handleEnrollmentUpload = (req, res, next) => {
//   enrollmentUploadFields(req, res, (err) => {
//     if (err?.code === "LIMIT_FILE_SIZE") {
//       return res
//         .status(400)
//         .json({ message: "File size exceeds 5MB. Please upload a smaller file." });
//     }
//     if (err) return next(err);
//     return next();
//   });
// };

// router.post("/",
//   handleEnrollmentUpload,
//   createEnrollmentForm
// );

// router.post("/section2-file",
//   uploadEnrollment.single("staIdFile"),
//   saveSection2File
// );

// router.post("/section3-file",
//   uploadEnrollment.single("qualificationFile"),
//   saveSection3File
// );

// router.delete("/section2-file", deleteSection2File)
// router.post("/section", saveSection);
// router.get("/", getEnrollmentForms);
// router.patch("/:id/status", updateEnrollmentStatus);
// router.delete("/section3-file", deleteSection3File)
// router.delete("/section5-file", deleteSection5File)
// router.get("/:id", getEnrollmentFormById);

// module.exports = router;

const express = require("express");
const router = express.Router();
const { 
  createEnrollmentForm, 
  getEnrollmentForms, 
  updateEnrollmentStatus,
  updateReviewedDate,
  saveSection,
  saveSection2File,
  saveSection3File,
  deleteSection2File,
  deleteSection3File,
  deleteSection5File,
  getEnrollmentFormById
} = require("../controllers/enrollmentFormController");
const { uploadEnrollment } = require("../middleware/upload");

const enrollmentUploadFields = uploadEnrollment.fields([
  { name: "idDocument", maxCount: 1 },
  { name: "photoDocument", maxCount: 1 },
  { name: "signature", maxCount: 1 },
  { name: "qualificationFile", maxCount: 1 },
  { name: "staIdFile", maxCount: 1 },
]);

const handleEnrollmentUpload = (req, res, next) => {
  enrollmentUploadFields(req, res, (err) => {
    if (err?.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File size exceeds 5MB. Please upload a smaller file." });
    }
    if (err) return next(err);
    return next();
  });
};

router.post("/",
  handleEnrollmentUpload,
  createEnrollmentForm
);

router.post("/section2-file",
  uploadEnrollment.single("staIdFile"),
  saveSection2File
);

router.post("/section3-file",
  uploadEnrollment.single("qualificationFile"),
  saveSection3File
);

router.delete("/section2-file", deleteSection2File)
router.post("/section", saveSection);
router.get("/", getEnrollmentForms);
router.patch("/:id/status", updateEnrollmentStatus);
router.patch("/:id/reviewed-date", updateReviewedDate);
router.delete("/section3-file", deleteSection3File)
router.delete("/section5-file", deleteSection5File)
router.get("/:id", getEnrollmentFormById);

module.exports = router;