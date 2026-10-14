import { NavLink } from 'react-router-dom'

function Sidebar({ user }) {
  const links = [
    { to: '/dashboard', label: 'Overview', icon: '⌂' },
    { to: '/user', label: 'My account', icon: '○' },
    { to: '/order', label: 'Bookings', icon: '▤' },
    ...(user?.userType === 'admin'
      ? [{ to: '/admin', label: 'Administration', icon: '⚙' }]
      : []),
  ]

  return (
    <aside className="dashboard-sidebar">
      <p className="sidebar-label">YOUR SPACE</p>
      <nav aria-label="Dashboard navigation">
        {links.map((link) => (
          <NavLink
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            end={link.to === '/dashboard'}
            key={link.to}
            to={link.to}
          >
            <span aria-hidden="true">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-help">
        <span className="help-icon" aria-hidden="true">?</span>
        <strong>Need a hand?</strong>
        <p>Our team is here to help make your stay easy.</p>
        <a href="mailto:support@hotelpro.example">Contact support</a>
      </div>
    </aside>
  )
}

export default Sidebar
