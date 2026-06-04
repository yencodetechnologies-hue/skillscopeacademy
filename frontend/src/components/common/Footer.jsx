

// import { useState, useEffect } from 'react'
// import { getContact, getFooter } from '../../services/siteContentServices'
// import { siteConfig, footerData as mockFooter } from '../../services/mockData'
// import { FaFacebookF, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa'
// import './footer.css'
// import { Link } from 'react-router-dom'

// function Footer() {
//   const [contact, setContact] = useState(null)
//   const [footer, setFooter]   = useState(null)

//   useEffect(() => {
//     // Load both in parallel; silently fall back to mockData on error
//     Promise.all([
//       getContact().catch(() => null),
//       getFooter().catch(() => null),
//     ]).then(([c, f]) => {
//       setContact(c)
//       setFooter(f)
//     })
//   }, [])

//   // ── resolve values: DB first, then mockData fallback ──
//   const address  = contact?.address  || siteConfig.address
//   const email    = contact?.email    || siteConfig.email
//   const phone1   = contact?.phone1   || siteConfig.phone1
//   const phone2   = contact?.phone2   || siteConfig.phone2
//   const social   = contact?.social   || siteConfig.social
//   const courses      = footer?.courses?.length      ? footer.courses      : mockFooter.courses
//   const quickLinks   = footer?.quickLinks?.length   ? footer.quickLinks   : mockFooter.quickLinks
//   const accreditation= footer?.accreditation?.length? footer.accreditation: mockFooter.accreditation
//   const copyright    = footer?.copyright     || `© 2026 Skill Scope Academy. All rights reserved.`
//   const abn          = footer?.abn           || siteConfig.abn
//   const rto          = footer?.rto           || siteConfig.rto
//   const website      = footer?.website       || siteConfig.website

//   return (
//     <footer className='footer'>
//       <div className='footer-top'>
//         <div className='container footer-grid'>

//           {/* Brand */}
//           <div className='footer-brand'>
//             <h2 className='footer-logo'>SAFETY TRAINING ACADEMY</h2>
//             <p><FaMapMarkerAlt /> {address}</p>
//             <p><FaEnvelope /> {email}</p>
//             <p><FaPhone /> {phone2} · {phone1}</p>
//             <div className='footer-socials'>
//               {social?.facebook  && <a href={social.facebook}  target="_blank" rel="noreferrer"><FaFacebookF /></a>}
//               {social?.instagram && <a href={social.instagram} target="_blank" rel="noreferrer"><FaInstagram /></a>}
//               {social?.linkedin  && <a href={social.linkedin}  target="_blank" rel="noreferrer"><FaLinkedinIn /></a>}
//             </div>
//           </div>

//           {/* Courses */}
//           <div className='footer-col'>
//             <h4>COURSES</h4>
//             <ul>
              
//               {courses.map((c, i) => <li key={i}>
//               <Link to="/courses">{c}</Link>
//               </li>)}
//               <li><Link to="/courses" className='footer-view-all'>view all courses</Link></li>
              
//             </ul>
//           </div>

//           {/* Quick Links */}
//           <div className='footer-col'>
//             <h4>QUICK LINKS</h4>
//             <ul>
//               {quickLinks.map((l, i) => <li key={i}><a href='#'>{l}</a></li>)}
//             </ul>
//           </div>

//           {/* Accreditation */}
//           <div className='footer-col'>
//             <h4>ACCREDITATION</h4>
//             <ul>
//               {accreditation.map((a, i) => <li key={i}>{a}</li>)}
//             </ul>
//           </div>

//         </div>
//       </div>

//       <div className='footer-bottom'>
//         <div className='container footer-bottom-inner'>
//           <p>{copyright} {abn} · {website}</p>
//           {rto && <span className='rto-badge'>RTO {rto}</span>}
//         </div>
//       </div>
//     </footer>
//   )
// }

// export default Footer

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getContact, getFooter } from '../../services/siteContentServices'
import { getCourses }            from '../../services/courseService'
import { siteConfig, footerData as mockFooter } from '../../services/mockData'
import {
  FaFacebookF, FaInstagram, FaLinkedinIn,
  FaMapMarkerAlt, FaEnvelope, FaPhone,
} from 'react-icons/fa'
import './footer.css'

function Footer() {
  const [contact, setContact]         = useState(null)
  const [footer, setFooter]           = useState(null)
  const [courseTitles, setCourseTitles] = useState([])

  useEffect(() => {
    // Load contact, footer CMS data and live courses in parallel
    Promise.all([
      getContact().catch(() => null),
      getFooter().catch(() => null),
      getCourses().catch(() => null),
    ]).then(([c, f, cRes]) => {
      setContact(c)
      setFooter(f)
      // Extract first 5 real course titles from the backend response
      const all = cRes?.data?.courses || []
      setCourseTitles(all.slice(0, 5).map(c => c.title))
    })
  }, [])

  // ── Resolve values: DB first → mockData fallback ──────────
  const  name         = contact?.name || siteConfig.name 
  const address       = contact?.address       || siteConfig.address
  const email         = contact?.email         || siteConfig.email
  const phone1        = contact?.phone1        || siteConfig.phone1
  const phone2        = contact?.phone2        || siteConfig.phone2
  const social        = contact?.social        || siteConfig.social
  // Courses: live titles from API first, then CMS, then mockData
  const courseList    = courseTitles.length    ? courseTitles
                      : footer?.courses?.length ? footer.courses
                      : mockFooter.courses
  const quickLinks    = footer?.quickLinks?.length    ? footer.quickLinks    : mockFooter.quickLinks
  const accreditation = footer?.accreditation?.length ? footer.accreditation : mockFooter.accreditation
  const copyright     = footer?.copyright || '© 2026 Safety Training Academy. All rights reserved.'
  const abn           = footer?.abn     || siteConfig.abn
  const rto           = footer?.rto     || siteConfig.rto
  const website       = footer?.website || siteConfig.website

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <h2 className="footer-logo">{name}</h2>
            <p><FaMapMarkerAlt /> {address}</p>
            <p><FaEnvelope /> {email}</p>
            <p><FaPhone /> {phone2} · {phone1}</p>
            <div className="footer-socials">
              {social?.facebook  && <a href={social.facebook}  target="_blank" rel="noreferrer"><FaFacebookF /></a>}
              {social?.instagram && <a href={social.instagram} target="_blank" rel="noreferrer"><FaInstagram /></a>}
              {social?.linkedin  && <a href={social.linkedin}  target="_blank" rel="noreferrer"><FaLinkedinIn /></a>}
            </div>
          </div>

          {/* Courses — live titles from backend */}
          <div className="footer-col">
            <h4>COURSES</h4>
            <ul>
              {courseList.map((title, i) => (
                <li key={i}>
                  <Link to="/courses">{title}</Link>
                </li>
              ))}
              <li>
                <Link to="/courses" className="footer-view-all">
                  view all courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>QUICK LINKS</h4>
            <ul>
              {quickLinks.map((l, i) => <li key={i}><a href="#">{l}</a></li>)}
            </ul>
          </div>

          {/* Accreditation */}
          <div className="footer-col">
            <h4>ACCREDITATION</h4>
            <ul>
              {accreditation.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>{copyright} {abn} · {website}</p>
          {rto && <span className="rto-badge">RTO {rto}</span>}
        </div>
      </div>
    </footer>
  )
}

export default Footer