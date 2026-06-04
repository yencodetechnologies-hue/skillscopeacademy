import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { getAbout } from '../services/siteContentServices'
import { siteConfig } from '../services/mockData'
import './about.css'

export default function About() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAbout()
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // ── Resolved values: DB first → hardcoded fallback ─────────
  const heading     = data?.heading     || 'About Safety Training Academy'
  const subheading  = data?.subheading  || 'Nationally Recognised Training'
  const description = data?.description ||
    'Safety Training Academy is a Registered Training Organisation (RTO #45234) delivering nationally recognised qualifications across Australia. We provide practical, hands-on training that meets the highest industry standards.'
  const mission = data?.mission || ''
  const vision  = data?.vision  || ''

  const stats = data?.stats?.length ? data.stats : [
    { value: '10,000+', label: 'Students Trained' },
    { value: '15+',     label: 'Courses Offered'  },
    { value: '2019',    label: 'Established'       },
    { value: '5.0 ★',  label: 'Google Rating'     },
  ]

  const highlights = data?.highlights?.length ? data.highlights : [
    { icon: '🏢', title: 'RTO #45234',            subtitle: 'Registered Training Organisation' },
    { icon: '👥', title: 'Face to Face Training', subtitle: 'Practical hands-on learning'       },
    { icon: '🏅', title: 'Qualified Trainers',    subtitle: 'Industry experienced experts'      },
    { icon: '📄', title: 'Nationally Recognized', subtitle: 'Certificates accepted Australia-wide' },
  ]

  const reasons = data?.reasons?.length ? data.reasons : [
    { icon: '📋', title: 'Same-Day Certificate',   subtitle: 'Walk away certified on the day of your course.' },
    { icon: '🛡', title: 'RTO Registered',         subtitle: 'Fully accredited by ASQA — RTO #45234.'        },
    { icon: '📅', title: 'Flexible Scheduling',    subtitle: 'Weekend and Sunday classes available.'           },
    { icon: '👷', title: 'Industry Experts',       subtitle: 'Trainers with real on-site experience.'         },
  ]

  if (loading) {
    return (
      <MainLayout>
        <div className="about-loading">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="about-skel-block"/>
          ))}
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="about-hero">
        <div className="container about-hero-inner">
          <div className="about-hero-text">
            <p className="about-hero-sub">{subheading.toUpperCase()}</p>
            <h1 className="about-hero-title">{heading}</h1>
            <p className="about-hero-desc">{description}</p>
            <div className="about-hero-actions">
              <Link to="/courses" className="about-btn-primary">Browse Courses →</Link>
              <Link to="/contact" className="about-btn-outline">Contact Us</Link>
            </div>
          </div>

          {/* Stats card panel */}
          <div className="about-stats-panel">
            <p className="about-stats-label">TRUSTED BY THOUSANDS</p>
            <div className="about-stats-grid">
              {stats.map((s, i) => (
                <div key={i} className="about-stat-box">
                  <h2>{s.value}</h2>
                  <p>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE STRIP ─────────────────────────────────── */}
      <div className="about-feature-strip">
        <div className="container about-feature-grid">
          {highlights.map((h, i) => (
            <div key={i} className="about-feature-box">
              <span className="about-feature-icon">{h.icon}</span>
              <div>
                <h4>{h.title}</h4>
                <p>{h.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MISSION / VISION ──────────────────────────────── */}
      {(mission || vision) && (
        <section className="about-mv-section">
          <div className="container about-mv-grid">
            {mission && (
              <div className="about-mv-card about-mv-mission">
                <div className="about-mv-icon">🎯</div>
                <h3>Our Mission</h3>
                <p>{mission}</p>
              </div>
            )}
            {vision && (
              <div className="about-mv-card about-mv-vision">
                <div className="about-mv-icon">🔭</div>
                <h3>Our Vision</h3>
                <p>{vision}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── WHY CHOOSE US ─────────────────────────────────── */}
      <section className="about-why-section">
        <div className="container">
          <div className="about-section-head">
            <p className="about-section-sub">WHY CHOOSE STA</p>
            <h2>NSW's Most Trusted Training RTO</h2>
            <p className="about-section-desc">
              Over 10,000 students trained. Certificate issued same day. All courses are nationally recognised.
            </p>
          </div>
          <div className="about-reasons-grid">
            {reasons.map((r, i) => (
              <div key={i} className="about-reason-card">
                <span className="about-reason-icon">{r.icon}</span>
                <div>
                  <h4>{r.title}</h4>
                  <p>{r.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="about-cta">
        <div className="container about-cta-inner">
          <div>
            <h2>Ready to Get Certified?</h2>
            <p>Browse our full range of nationally recognised safety courses and book your spot today.</p>
          </div>
          <div className="about-cta-btns">
            <Link to="/courses" className="about-btn-primary">View All Courses</Link>
            <Link to="/contact" className="about-btn-outline about-btn-outline--light">Get in Touch</Link>
          </div>
        </div>
      </section>

    </MainLayout>
  )
}