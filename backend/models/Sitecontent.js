const mongoose = require('mongoose')

// ── About section ──────────────────────────────────────────────────────────
const AboutSchema = new mongoose.Schema({
  heading:     { type: String, default: 'About Skill Scope Academy' },
  subheading:  { type: String, default: 'Nationally Recognised Training' },
  description: { type: String, default: '' },
  mission:     { type: String, default: '' },
  vision:      { type: String, default: '' },
  stats: [{ value: String, label: String }],
  highlights: [{ icon: String, title: String, subtitle: String }],
}, { timestamps: true })

// ── Contact section ────────────────────────────────────────────────────────
const ContactSchema = new mongoose.Schema({
  phone1:   { type: String, default: '' },
  phone2:   { type: String, default: '' },
  email:    { type: String, default: '' },
  address:  { type: String, default: '' },
  mapEmbed: { type: String, default: '' },
  hours:    { type: String, default: 'Mon–Fri 8am–5pm' },
  social: {
    facebook:  { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin:  { type: String, default: '' },
  },
}, { timestamps: true })

// ── FAQ item ───────────────────────────────────────────────────────────────
const FaqItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer:   { type: String, required: true },
  order:    { type: Number, default: 0 },
  active:   { type: Boolean, default: true },
}, { timestamps: true })

// ── Footer ─────────────────────────────────────────────────────────────────
const FooterSchema = new mongoose.Schema({
  courses:       [String],
  quickLinks:    [String],
  accreditation: [String],
  copyright:     { type: String, default: '© 2024 Safety Training Academy. All rights reserved.' },
  abn:           { type: String, default: '' },
  rto:           { type: String, default: '' },
  website:       { type: String, default: '' },
}, { timestamps: true })

module.exports = {
  About:   mongoose.model('About',   AboutSchema),
  Contact: mongoose.model('Contact', ContactSchema),
  FaqItem: mongoose.model('FaqItem', FaqItemSchema),
  Footer:  mongoose.model('Footer',  FooterSchema),
}