import { Link } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import Sidebar from './Sidebar'
import useAuth from '../context/useAuth'

function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="app-shell">
      <Header />
      <main className="dashboard-layout">
        <Sidebar user={user} />
        <section className="dashboard-main">
          <p className="eyebrow">YOUR HOTELPRO</p>
          <h1 className="page-title">Welcome back, {user.name.split(' ')[0]}.</h1>
          <p className="subheading">Everything for your next great stay, all in one place.</p>
          <div className="dashboard-banner">
            <div>
              <p className="eyebrow">A CHANGE OF SCENERY</p>
              <h2>Your next favorite place is out there.</h2>
              <p>Browse thoughtful stays picked for getting away well.</p>
              <Link className="button" to="/products">Explore stays <span aria-hidden="true">→</span></Link>
            </div>
            <span className="banner-art" aria-hidden="true">H</span>
          </div>
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR TRAVEL</p>
              <h2>Stay organized</h2>
            </div>
          </div>
          <div className="dashboard-cards">
            <Link className="dashboard-card" to="/order">
              <span className="dashboard-card-icon">▤</span>
              <span><strong>Your bookings</strong><small>View your upcoming and past stays</small></span>
              <span className="card-arrow">→</span>
            </Link>
            <Link className="dashboard-card" to="/user">
              <span className="dashboard-card-icon">○</span>
              <span><strong>Account details</strong><small>Manage your HotelPro profile</small></span>
              <span className="card-arrow">→</span>
            </Link>
          </div>
          {user.userType === 'admin' && (
            <div className="admin-callout">
              <span>Admin access is enabled for this account.</span>
              <Link to="/admin">Open administration →</Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Dashboard
