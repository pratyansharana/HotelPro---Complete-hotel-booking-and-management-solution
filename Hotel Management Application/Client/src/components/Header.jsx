import { Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand header-brand" to="/">
          <span className="brand-mark">H</span>
          <span>HotelPro</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/products">Stays</NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user?.userType === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <Link className="header-user" to="/user">
                {user.name}
              </Link>
              <button className="text-button" onClick={handleLogout} type="button">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="text-button" to="/login">Sign in</Link>
              <Link className="button button-small" to="/register">Join HotelPro</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
