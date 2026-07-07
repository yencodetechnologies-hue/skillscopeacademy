// const express = require("express");
// const router = express.Router();
// const { uploadPayment } = require("../middleware/upload");

// const controller = require("../controllers/enrollmentFlowController");

// router.post("/create", uploadPayment.single("paymentSlip"), controller.createFlow); // ✅
// router.post("/add-course", controller.addCourse);
// router.post("/payment", uploadPayment.single("paymentSlip"), controller.updatePayment); // ✅
// router.post("/llnd", controller.saveLLND);
// router.post("/complete", controller.completeEnrollment);
// router.get("/get", controller.getFlow);
// router.get("/weekly", controller.getWeeklyBookings);
// router.get("/llnd-results", controller.getLLNDResults);
// router.get("/payments", controller.getAllPayments);
// router.put("/payment/:enrollmentId/:itemId", controller.updatePaymentStatus);
// // router.put("/llnd-date", controller.updateLLNDDate);

// router.put("/llnd-date", controller.updateLLNDDate);


// module.exports = router;

const express = require("express");
const router = express.Router();
const { uploadPayment } = require("../middleware/upload");

const controller = require("../controllers/enrollmentFlowController");

router.post("/create", uploadPayment.single("paymentSlip"), controller.createFlow); // ✅
router.post("/add-course", controller.addCourse);
router.post("/payment", uploadPayment.single("paymentSlip"), controller.updatePayment); // ✅
router.post("/llnd", controller.saveLLND);
router.post("/complete", controller.completeEnrollment);
router.get("/get", controller.getFlow);
router.get("/weekly", controller.getWeeklyBookings);
router.get("/daily-students", controller.getDailyStudents);
router.get("/llnd-results", controller.getLLNDResults);
router.get("/payments", controller.getAllPayments);
router.put("/payment/:enrollmentId/:itemId", controller.updatePaymentStatus);
// router.put("/llnd-date", controller.updateLLNDDate);

router.put("/llnd-date", controller.updateLLNDDate);


module.exports = router;