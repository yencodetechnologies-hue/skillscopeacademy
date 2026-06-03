import { whyChooseData, siteConfig } from '../../services/mockData'
import './whychoose.css'

const WhyChoose = () => {
  return (
    <section className='whychoose'>
      <div className='container why-grid'>

        {/* LEFT — stats + testimonials */}
        <div className='why-left'>
          <h4 className='why-trusted-label'>TRUSTED BY THOUSANDS</h4>

          <div className='review-grid'>
            {whyChooseData.stats.map((s, i) => (
              <div key={i} className='review-box'>
                <h2>{s.value}</h2>
                <p>{s.label}</p>
              </div>
            ))}
          </div>

          {whyChooseData.testimonials.map(t => (
            <div key={t.id} className='testimonial-box'>
              <div className='stars'>{'★'.repeat(t.stars)}</div>
              <p>"{t.text}"</p>
              <h5>{t.author} · <span>{t.course}</span></h5>
            </div>
          ))}
        </div>

        {/* RIGHT — reasons */}
        <div className='why-right'>
          <p className='why-subtitle'>WHY CHOOSE STA</p>
          <h2>NSW's Most Trusted Training RTO</h2>
          <p className='why-desc'>
            Safety Training Academy has been delivering nationally recognised workplace safety training since 2019. Over 1,000 five-star reviews — and certificate same day.
          </p>

          <div className='why-reasons'>
            {whyChooseData.reasons.map((r, i) => (
              <div key={i} className='why-reason'>
                <span className='reason-icon'>📋</span>
                <div>
                  <h4>{r.title}</h4>
                  <p>{r.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default WhyChoose
