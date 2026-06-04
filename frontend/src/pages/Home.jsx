import Topbar from '../components/common/Topbar'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import Hero from '../components/home/Hero'
import StatsStrip from '../components/home/StatsStrip'
import UpcomingCourses from '../components/home/UpcomingCourses'
import BrowseCourses from '../components/home/BrowserCourses'
import WhyChoose from '../components/home/WhyChoose'
import TrustedCompanies from '../components/home/TrustedCompanies'
import CTA from '../components/home/CTA'

const Home = () => {
  return (
    <>
      {/* <Topbar /> */}
      <Navbar />
      <Hero />
      <StatsStrip />
      <UpcomingCourses />
      <BrowseCourses />
      <WhyChoose />
      <TrustedCompanies />
      <CTA />
      <Footer />
    </>
  )
}

export default Home