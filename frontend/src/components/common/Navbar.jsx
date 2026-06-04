
import { Link }    from 'react-router-dom'
import { navLinks } from '../../services/mockData'
import { FaChevronDown, FaShoppingCart } from 'react-icons/fa'

import '../../styles/home.css'
import { useCart } from '../Cartcontext'

function Navbar() {
  const { totalItems } = useCart()

  return (
    <header className="navbar">
      {/* Logo */}
      <div className="nav-logo">
        <Link to="/" className="logo-text">
          <span className="logo-safety">Skill</span>
          <span className="logo-training">
            Scope<br/>
            <span className="logo-academy">ACADEMY</span>
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="nav-links">
        {navLinks.map(link => (
          <Link key={link.label} to={link.href} className="nav-link">
            {link.label}
            {link.hasDropdown && <FaChevronDown className="dropdown-icon"/>}
          </Link>
        ))}
      </nav>

      {/* Action Buttons */}
      <div className="nav-buttons">
        <button className="nav-btn btn-combo">Combo Courses</button>
        <button className="nav-btn btn-book">Book now</button>

        {/* Cart Icon */}
        <Link to="/cart" className="nav-cart-btn">
          <FaShoppingCart size={18}/>
          {totalItems > 0 && (
            <span className="nav-cart-badge">{totalItems}</span>
          )}
        </Link>

        <button className="nav-btn btn-login">Login</button>
      </div>
    </header>
  )
}

export default Navbar