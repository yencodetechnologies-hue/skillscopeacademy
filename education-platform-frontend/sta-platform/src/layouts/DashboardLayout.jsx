import Sidebar from '../components/dashboard/Sidebar'
import DashboardNavbar from '../components/dashboard/DashboardNavbar'
import '../styles/admin.css'

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <DashboardNavbar />

        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout