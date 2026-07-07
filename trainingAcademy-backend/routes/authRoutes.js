const express = require("express");
const router = express.Router();

const {register,login,autoLogin,checkEmailExists} = require("../controllers/authController");

router.post("/register",register);
router.post("/login",login);
router.post("/auto-login", autoLogin);
router.post("/check-email", checkEmailExists);

module.exports = router;