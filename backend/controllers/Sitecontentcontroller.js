const { About, Contact, FaqItem, Footer } = require('../models/Sitecontent')

// ── helpers ────────────────────────────────────────────────────────────────
const getOrCreate = async (Model, defaults = {}) => {
  let doc = await Model.findOne()
  if (!doc) doc = await Model.create(defaults)
  return doc
}

// ════════════════════════════════════════
// ABOUT
// ════════════════════════════════════════
exports.getAbout = async (req, res) => {
  try {
    const doc = await getOrCreate(About)
    res.json({ success: true, data: doc })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

// exports.updateAbout = async (req, res) => {
//   try {
//     let doc = await About.findOne()
//     if (!doc) doc = new About()
//     Object.assign(doc, req.body)
//     await doc.save()
//     res.json({ success: true, data: doc })
//   } catch (e) { 
//     console.log("updateabouterror",e.message);
    
//     res.status(500).json({ success: false, message: e.message }) }
// }

exports.updateAbout = async (req, res) => {
  try {
    const updateData = { ...req.body }

    delete updateData._id
    delete updateData.__v
    delete updateData.createdAt
    delete updateData.updatedAt

    let doc = await About.findOne()

    if (!doc) {
      doc = await About.create(updateData)
    } else {
      Object.assign(doc, updateData)
      await doc.save()
    }

    res.json({
      success: true,
      data: doc
    })
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    })
  }
}

// ════════════════════════════════════════
// CONTACT
// ════════════════════════════════════════
exports.getContact = async (req, res) => {
  try {
    const doc = await getOrCreate(Contact)
    res.json({ success: true, data: doc })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

exports.updateContact = async (req, res) => {
  try {
    let doc = await Contact.findOne()
    if (!doc) doc = new Contact()
    Object.assign(doc, req.body)
    await doc.save()
    res.json({ success: true, data: doc })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

// ════════════════════════════════════════
// FAQ
// ════════════════════════════════════════
exports.getFaqs = async (req, res) => {
  try {
    const faqs = await FaqItem.find({ active: true }).sort({ order: 1, createdAt: 1 })
    res.json({ success: true, data: faqs })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

exports.getAllFaqs = async (req, res) => {
  try {
    const faqs = await FaqItem.find().sort({ order: 1, createdAt: 1 })
    res.json({ success: true, data: faqs })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

exports.createFaq = async (req, res) => {
  try {
    const faq = await FaqItem.create(req.body)
    res.status(201).json({ success: true, data: faq })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

exports.updateFaq = async (req, res) => {
  try {
    const faq = await FaqItem.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' })
    res.json({ success: true, data: faq })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

exports.deleteFaq = async (req, res) => {
  try {
    await FaqItem.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Deleted' })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

// ════════════════════════════════════════
// FOOTER
// ════════════════════════════════════════
exports.getFooter = async (req, res) => {
  try {
    const doc = await getOrCreate(Footer)
    res.json({ success: true, data: doc })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}

exports.updateFooter = async (req, res) => {
  try {
    let doc = await Footer.findOne()
    if (!doc) doc = new Footer()
    Object.assign(doc, req.body)
    await doc.save()
    res.json({ success: true, data: doc })
  } catch (e) { res.status(500).json({ success: false, message: e.message }) }
}