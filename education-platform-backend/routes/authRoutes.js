const express = require('express')

const {
  registerUser,
  loginUser,
  finduser
} = require('../controllers/authController')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/finduser', finduser)


module.exports = router