import './whychoose.css'

const features = [
  {
    icon: '👷',
    title: 'Industry-Expert Trainers',
    desc:  'Our trainers are current or former industry professionals. Real experience means real-world knowledge you can use from day one.',
  },
  {
    icon: '📍',
    title: 'Flexible Delivery',
    desc:  'Group bookings, onsite delivery, multi-day packages, and RPL assessments. We come to you, or you come to us.',
  },
  {
    icon: '⚡',
    title: 'Same-Day Certificates',
    desc:  'Same-day digital certificates for most courses. Workers back on site without delay, documentation in hand.',
  },
]

const WhyChoose = () => {
  return (
    <section className="whychoose">
      <div className="container">
        <div className="wc-layout">

          {/* ── LEFT: text + 3-col cards ── */}
          <div className="wc-left">
            <p className="wc-subtitle">WHY CHOOSE US</p>
            <h2 className="wc-title">Trusted by 10,000+ Workers Across Australia</h2>
            <p className="wc-desc">
              Practical training that meets the standards employers and regulators expect.
            </p>

            <div className="wc-features">
              {features.map((f, i) => (
                <div key={i} className="wc-feature-card">
                  <div className="wc-feature-icon">{f.icon}</div>
                  <h4 className="wc-feature-title">{f.title}</h4>
                  <p className="wc-feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: image ── */}
          <div className="wc-right">
            <div className="wc-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80"
                alt="Skill Scope Academy safety training workers on site"
                className="wc-img"
              />
              <div className="wc-badge">
                <span className="wc-badge-num">10,000+</span>
                <span className="wc-badge-label">Workers Trained</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default WhyChoose