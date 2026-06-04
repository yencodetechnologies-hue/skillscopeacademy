import { useState, useEffect } from 'react'
import { Link }   from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { getContact } from '../services/siteContentServices'
import {
  FaMapMarkerAlt, FaEnvelope, FaPhone, FaClock,
  FaFacebookF, FaInstagram, FaLinkedinIn, FaChevronDown,
} from 'react-icons/fa'
import './Contact.css'

export default function Contact() {
  const [contact, setContact] = useState(null)
  
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState({ name:'', email:'', phone:'', message:'' })
  const [sent, setSent]       = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    Promise.all([
      getContact().catch(() => null),
    
    ]).then(([c, f]) => {
      setContact(c)
    
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    // Simulate send — swap with real API call when ready
    await new Promise(r => setTimeout(r, 900))
    setSending(false)
    setSent(true)
    setForm({ name:'', email:'', phone:'', message:'' })
    setTimeout(() => setSent(false), 5000)
  }

  // ── Resolved values ───────────────────────────────────────
  const phone1  = contact?.phone1  || '1300 976 097'
  const phone2  = contact?.phone2  || '0483 878 887'
  const email   = contact?.email   || 'info@skillscopeacademy.edu.au'
  const address = contact?.address || '3/14-16 Marjorie Street, Sefton NSW 2162'
  const hours   = contact?.hours   || 'Mon–Fri 8am–5pm'
  const social  = contact?.social  || {}

  const infoCards = [
    { icon: <FaPhone/>,        label: 'Phone',        value: `${phone1}${phone2 ? ' · '+phone2 : ''}` },
    { icon: <FaEnvelope/>,     label: 'Email',        value: email   },
    { icon: <FaMapMarkerAlt/>, label: 'Address',      value: address },
    { icon: <FaClock/>,        label: 'Office Hours', value: hours   },
  ]

  if (loading) {
    return (
      <MainLayout>
        <div className="contact-loading">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="contact-skel-block"/>
          ))}
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="contact-hero">
        <div className="container contact-hero-inner">
          <p className="contact-hero-sub">GET IN TOUCH</p>
          <h1 className="contact-hero-title">Contact Us</h1>
          <p className="contact-hero-desc">
            Have a question about a course, booking or enrolment?
            We're here to help — reach out by phone, email or fill in the form below.
          </p>
        </div>
      </section>

      {/* ── CONTACT INFO + FORM ───────────────────────────── */}
      <section className="contact-section">
        <div className="container contact-grid">

          {/* LEFT — info cards */}
          <div className="contact-info-col">

            <div className="contact-info-cards">
              {infoCards.map((card, i) => (
                <div key={i} className="contact-info-card">
                  <div className="contact-info-icon">{card.icon}</div>
                  <div>
                    <p className="contact-info-label">{card.label}</p>
                    <p className="contact-info-value">{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            {(social.facebook || social.instagram || social.linkedin) && (
              <div className="contact-social-card">
                <p className="contact-info-label">FOLLOW US</p>
                <div className="contact-social-row">
                  {social.facebook  && <a href={social.facebook}  target="_blank" rel="noreferrer" className="contact-social-btn"><FaFacebookF /></a>}
                  {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="contact-social-btn"><FaInstagram /></a>}
                  {social.linkedin  && <a href={social.linkedin}  target="_blank" rel="noreferrer" className="contact-social-btn"><FaLinkedinIn /></a>}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="contact-quick-card">
              <p className="contact-info-label">QUICK LINKS</p>
              <div className="contact-quick-links">
                <Link to="/courses" className="contact-quick-link">📚 Browse Courses</Link>
                <Link to="/courses" className="contact-quick-link">📅 Book a Session</Link>
               
              </div>
            </div>

          </div>

          {/* RIGHT — enquiry form */}
          <div className="contact-form-card">
            <h2 className="contact-form-title">Send an Enquiry</h2>
            <p className="contact-form-sub">We typically respond within one business day.</p>

            {sent && (
              <div className="contact-success">
                ✅ Thanks! Your message has been sent. We'll be in touch soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-form-row">
                <div className="contact-field">
                  <label>Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="contact-field">
                  <label>Email *</label>
                  <input
                    required type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="contact-field">
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Your phone number"
                />
              </div>

              <div className="contact-field">
                <label>Message *</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="How can we help?"
                />
              </div>

              <button type="submit" className="contact-submit-btn" disabled={sending}>
                {sending ? 'Sending…' : 'Send Message →'}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* ── MAP ───────────────────────────────────────────── */}
      {contact?.mapEmbed && (
        <section className="contact-map-section">
          <div className="container">
            <iframe
              src={contact.mapEmbed}
              width="100%" height="320"
              className="contact-map"
              allowFullScreen loading="lazy"
              title="Location map"
            />
          </div>
        </section>
      )}

   
    </MainLayout>
  )
}