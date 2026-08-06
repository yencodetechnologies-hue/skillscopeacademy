const express = require("express");

const router = express.Router();
const {
    uploadPromotionMail
} = require("../middleware/upload");
const {
    sendPromotionMail
} = require("../controllers/promotionMailController");


//console.log("UPLOAD:", upload);
router.post(
    "/",
    uploadPromotionMail.single("attachment"),
    sendPromotionMail
);


module.exports = router;