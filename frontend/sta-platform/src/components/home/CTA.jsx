import { ctaData, siteConfig } from '../../services/mockData'
import './cta.css'

function CTA() {
  return (
    <section className='cta-section'>
      <div className='container cta-inner'>
        <div className='cta-text'>
          <h2>{ctaData.heading}</h2>
          <p>{ctaData.subtext}</p>
        </div>
        <div className='cta-buttons'>
          {ctaData.buttons.map((btn, i) => (
            <button key={i} className={`cta-btn cta-btn-${btn.variant}`}>
              {btn.icon && <span>{btn.icon}</span>} {btn.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CTA
