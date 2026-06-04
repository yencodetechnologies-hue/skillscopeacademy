import { Link } from 'react-router-dom'

const Sidebar = () => {
  return (
    <aside className='sidebar'>

      <h2>STA Academy</h2>

      <nav>

        <Link to='/dashboard'>Dashboard</Link>

        <Link to='/courses'>Courses</Link>

        <Link to='/admin'>Admin</Link>

      </nav>

    </aside>
  )
}

export default Sidebar