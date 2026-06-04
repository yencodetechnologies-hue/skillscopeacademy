import { Link } from 'react-router-dom'

const Sidebar = () => {
  return (
    <aside className='sidebar'>

      <h2>Skill Scope Academy</h2>

      <nav>

        <Link to='/dashboard'>Dashboard</Link>

        <Link to='/courses'>Courses</Link>

        <Link to='/admin'>Admin</Link>

        <Link to="/cms">CMS / Site Content</Link>

      </nav>

    </aside>
  )
}

export default Sidebar