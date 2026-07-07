const express = require("express");
const router = express.Router();

const {register,login,autoLogin,checkEmailExists,getAllUsers} = require("../controllers/authController");

router.post("/register",register);
router.post("/login",login);
router.post("/auto-login", autoLogin);
router.post("/check-email", checkEmailExists);
router.get("/finduser", getAllUsers);

module.exports = router;