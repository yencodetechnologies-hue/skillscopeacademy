import { siteConfig, footerData } from '../../services/mockData'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa'
import './footer.css'

function Footer() {
  return (
    <footer className='footer'>
      <div className='footer-top'>
        <div className='container footer-grid'>

          {/* Brand */}
          <div className='footer-brand'>
            <h2 className='footer-logo'>SAFETY TRAINING ACADEMY</h2>
            <p><FaMapMarkerAlt /> {siteConfig.address}</p>
            <p><FaEnvelope /> {siteConfig.email}</p>
            <p><FaPhone /> {siteConfig.phone2} · {siteConfig.phone1}</p>
            <div className='footer-socials'>
              <a href={siteConfig.social.facebook}><FaFacebookF /></a>
              <a href={siteConfig.social.instagram}><FaInstagram /></a>
              <a href={siteConfig.social.linkedin}><FaLinkedinIn /></a>
            </div>
          </div>

          {/* Courses */}
          <div className='footer-col'>
            <h4>COURSES</h4>
            <ul>
              {footerData.courses.map((c, i) => <li key={i}><a href='/courses'>{c}</a></li>)}
              <li><a href='/courses' className='footer-view-all'>View all courses →</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className='footer-col'>
            <h4>QUICK LINKS</h4>
            <ul>
              {footerData.quickLinks.map((l, i) => <li key={i}><a href='#'>{l}</a></li>)}
            </ul>
          </div>

          {/* Accreditation */}
          <div className='footer-col'>
            <h4>ACCREDITATION</h4>
            <ul>
              {footerData.accreditation.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>

        </div>
      </div>

      <div className='footer-bottom'>
        <div className='container footer-bottom-inner'>
          <p>© 2024 Safety Training Academy. All rights reserved. {siteConfig.abn} · {siteConfig.website}</p>
          <span className='rto-badge'>RTO {siteConfig.rto}</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
