const DashboardNavbar = () => {
  return (
    <header className="dashboard-navbar">

      <div>
        <h2>Safety Training Academy</h2>
      </div>

      <div className="navbar-right">
        <span>Admin</span>

        <button className="logout-btn">
          Logout
        </button>
      </div>

    </header>
  )
}

export default DashboardNavbar