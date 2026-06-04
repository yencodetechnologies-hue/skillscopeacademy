const stats = [
  {
    title: 'Students',
    value: '150',
    growth: '+12%'
  },
  {
    title: 'Courses',
    value: '22',
    growth: '+8%'
  },
  {
    title: 'Enrollments',
    value: '80',
    growth: '+15%'
  },
]

const Dashboard = () => {
  return (
    <>
      <div className="dashboard-cards">
        {stats.map((item) => (
          <div
            key={item.title}
            className="dashboard-card"
          >
            <span className="card-title">
              {item.title}
            </span>

            <h2>{item.value}</h2>

            <span className="card-growth">
              {item.growth} this month
            </span>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <h2>Actions</h2>

        <div className="actions-grid">
          <button>Add Course</button>
        
          <button>View Enrollments</button>
          <button>Generate Report</button>
        </div>
      </div>
    </>
  )
}

export default Dashboard