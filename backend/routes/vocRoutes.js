const express = require('express')
const router  = express.Router()
const { createVocRegistration, getAllVocRegistrations } = require('../controllers/vocController')

router.post('/register', createVocRegistration)
router.get('/registrations', getAllVocRegistrations)

module.exports = router