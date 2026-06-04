import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />

      <main>
        {children}
      </main>

      <Footer />
    </>
  )
}

export default MainLayout