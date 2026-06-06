// import { heroData } from '../../services/mockData'
// import { FaBook, FaUser, FaSearch } from 'react-icons/fa'
// import './hero.css'

// const Hero = () => {
//   return (
//     <section className='hero'>
//       <div className='hero-overlay'>
//         <div className='container hero-content'>

//           {/* Left Text */}
//           <div className='hero-left'>
//             <h1>
//               {heroData.heading1}<br />
//               {heroData.heading2}<br />
//               <span className='hero-highlight'>{heroData.highlight}</span>
//             </h1>
//             <p className='hero-desc'>{heroData.description}</p>
//             <div className='hero-actions'>
//               <button className='hero-primary-btn'>
//                 <FaBook /> View All Courses
//               </button>
//               <div className='hero-search'>
//                 <input type='text' placeholder='Search courses...' />
//                 <button className='search-submit'><FaSearch /></button>
//               </div>
//             </div>
//           </div>

//           {/* Enrolment Card */}
//           <div className='hero-card'>
//             <h2>{heroData.enrolmentCard.title}</h2>
//             <div className='hero-card-divider'></div>
//             <p>{heroData.enrolmentCard.subtitle}</p>
//             {heroData.enrolmentCard.buttons.map((btn, i) => (
//               <button key={i} className='enrol-btn'>
//                 <FaUser /> {btn.label}
//               </button>
//             ))}
//           </div>

//         </div>
//       </div>
//     </section>
//   )
// }

// export default Hero

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { heroData, statsData } from '../../services/mockData'
import { FaBook, FaUser, FaSearch } from 'react-icons/fa'
import HeroSlider from './HeroSlider'
import './hero.css'

const buttonRoutes = {
  'Start Enrolment Now →': '/courses',
  'VOC (Verification of Competency)': '/voc',
}

const Hero = () => {
  const navigate  = useNavigate()
  const [q, setQ] = useState('')

  const handleSearch = () => {
    navigate(q.trim() ? `/courses?q=${encodeURIComponent(q.trim())}` : '/courses')
  }

  return (
    <section className="hero">

      {/* Slider is clipped by its own div, not the section */}
      <div className="hero-slider-wrap">
        <HeroSlider />
      </div>

      {/* Dark overlay over slider — covers heading area only */}
      <div className="hero-overlay">
        <div className="container hero-wrapper">

          {/* Action bar: View All + Search */}
          <div className="hero-action-bar">
            <button className="hero-primary-btn" onClick={() => navigate('/courses')}>
              <FaBook /> View All Courses
            </button>
            <div className="hero-search">
              <input
                type="text"
                placeholder="Search courses..."
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-submit" onClick={handleSearch}>
                <FaSearch />
              </button>
            </div>
          </div>

          {/* Heading + Card */}
          <div className="hero-content">
            <div className="hero-left">
              <h1>
                {heroData.heading1}<br />
                {heroData.heading2}<br />
                <span className="hero-highlight">{heroData.highlight}</span>
              </h1>
              <p className="hero-desc">{heroData.description}</p>
            </div>

            <div className="hero-card">
              <h2>{heroData.enrolmentCard.title}</h2>
              <div className="hero-card-divider" />
              <p>{heroData.enrolmentCard.subtitle}</p>
              {heroData.enrolmentCard.buttons.map((btn, i) => (
                <button
                  key={i}
                  className="enrol-btn"
                  onClick={() => navigate(buttonRoutes[btn.label] || '/')}
                >
                  <FaUser /> {btn.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Stats strip INSIDE the hero section ── 
          The slider image behind extends here too, giving the
          glassmorphic strip a real image to blur over. */}
      <div className="hero-stats">
        <div className="hero-stats-inner">
          {statsData.map((s, i) => (
            <div key={i} className="hero-stat-item">
              <span className="hero-stat-icon">{s.icon}</span>
              <div>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}

export default Hero