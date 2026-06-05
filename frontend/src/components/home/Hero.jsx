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


import { useNavigate } from 'react-router-dom'
import { heroData } from '../../services/mockData'
import { FaBook, FaUser, FaSearch } from 'react-icons/fa'
import './hero.css'

// Map each button label to its route
const buttonRoutes = {
  'Start Enrolment Now →': '/courses',
  'VOC (Verification of Competency)': '/voc',
}

const Hero = () => {
  const navigate = useNavigate()

  return (
    <section className='hero'>
      <div className='hero-overlay'>
        <div className='container hero-content'>

          {/* Left Text */}
          <div className='hero-left'>
            <h1>
              {heroData.heading1}<br />
              {heroData.heading2}<br />
              <span className='hero-highlight'>{heroData.highlight}</span>
            </h1>
            <p className='hero-desc'>{heroData.description}</p>
            <div className='hero-actions'>
              <button
                className='hero-primary-btn'
                onClick={() => navigate('/courses')}
              >
                <FaBook /> View All Courses
              </button>
              <div className='hero-search'>
                <input type='text' placeholder='Search courses...' />
                <button className='search-submit'><FaSearch /></button>
              </div>
            </div>
          </div>

          {/* Enrolment Card */}
          <div className='hero-card'>
            <h2>{heroData.enrolmentCard.title}</h2>
            <div className='hero-card-divider'></div>
            <p>{heroData.enrolmentCard.subtitle}</p>
            {heroData.enrolmentCard.buttons.map((btn, i) => (
              <button
                key={i}
                className='enrol-btn'
                onClick={() => navigate(buttonRoutes[btn.label] || '/')}
              >
                <FaUser /> {btn.label}
              </button>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

export default Hero
