const express = require("express");

const router = express.Router();

const multer = require("multer");


const {
    sendCustomMail
} = require("../controllers/customMailController");



const upload = multer({

    storage: multer.memoryStorage()

});



router.post(

"/",

upload.single("attachment"),

sendCustomMail

);



module.exports = router;