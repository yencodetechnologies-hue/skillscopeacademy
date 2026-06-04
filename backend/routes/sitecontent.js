const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getAbout, updateAbout,
  getContact, updateContact,
  getFaqs, getAllFaqs, createFaq, updateFaq, deleteFaq,
  getFooter, updateFooter,
} = require('../controllers/siteContentController')

// Public
router.get('/about',   getAbout)
router.get('/contact', getContact)
router.get('/faqs',    getFaqs)
router.get('/footer',  getFooter)

// Admin only
router.put('/about',         protect, updateAbout)
router.put('/contact',       protect, updateContact)
router.get('/faqs/all',      protect, getAllFaqs)
router.post('/faqs',         protect, createFaq)
router.put('/faqs/:id',      protect, updateFaq)
router.delete('/faqs/:id',   protect, deleteFaq)
router.put('/footer',        protect, updateFooter)

module.exports = router
