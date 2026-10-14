import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import HotelContent from '../components/HotelContent'
import Sidebar from '../components/Sidebar'
import useAuth from '../context/useAuth'

function HomePage() {
  return (
    <main className="home-page">
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="eyebrow">A BETTER WAY TO GET AWAY</p>
            <h1>Find your kind of <em>somewhere.</em></h1>
            <p>Considered stays for slow mornings, long weekends, and the stories you bring home.</p>
            <Link className="button" to="/products">Explore our stays <span aria-hidden="true">→</span></Link>
          </div>
          <div className="hero-stamp">
            <span>GOOD STAYS</span>
            <strong>Good<br />stories.</strong>
            <span>EST. FOR YOU</span>
          </div>
          <div className="hero-caption"><span /> Handpicked places, made for feeling at home.</div>
        </section>
        <section className="home-section content-wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A FEW PLACES TO BEGIN</p>
              <h2>Somewhere worth slowing down for.</h2>
            </div>
            <Link className="plain-link" to="/products">See all stays <span aria-hidden="true">→</span></Link>
          </div>
          <HotelContent />
        </section>
        <section className="promise-strip">
          <p className="eyebrow">THE HOTELPRO WAY</p>
          <h2>Less searching. More settling in.</h2>
          <p>Thoughtful places, straightforward planning, and room for the good stuff.</p>
          <Link className="button button-light" to="/register">Plan your next stay</Link>
        </section>
    </main>
  )
}

function ProductsPage() {
  const [query, setQuery] = useState('')

  return (
    <main className="content-wrap listing-page">
        <div className="listing-heading">
          <div>
            <p className="eyebrow">THE HOTELPRO COLLECTION</p>
            <h1 className="page-title">Stays with a little more soul.</h1>
            <p className="subheading">A small collection of places we think you’ll love.</p>
          </div>
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search stays by destination"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by destination"
              value={query}
            />
          </label>
        </div>
        <HotelContent search={query} />
        <p className="catalog-note">These sample stays are for exploring the HotelPro experience.</p>
    </main>
  )
}

function OrderPage() {
  const [searchParams] = useSearchParams()
  const selectedHotel = searchParams.get('hotel')

  return (
    <main className="simple-page content-wrap">
      <p className="eyebrow">YOUR NEXT STAY</p>
      <h1 className="page-title">{selectedHotel || 'Your bookings'}</h1>
      <div className="notice-card">
        <span className="notice-icon" aria-hidden="true">✳</span>
        <div>
          <h2>Booking management is coming soon.</h2>
          <p>
            {selectedHotel
              ? `${selectedHotel} is a sample listing. Online booking and payment are not connected yet.`
              : 'Your stays will appear here once booking is available.'}
          </p>
          <Link className="plain-link" to="/products">Browse stays <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </main>
  )
}

function UserPage() {
  const { user } = useAuth()

  return (
    <main className="dashboard-layout">
      <Sidebar user={user} />
      <section className="dashboard-main">
        <p className="eyebrow">YOUR PROFILE</p>
        <h1 className="page-title">Account details</h1>
        <p className="subheading">The details associated with your HotelPro account.</p>
        <div className="profile-card">
          <span className="profile-avatar">{user.name.charAt(0).toUpperCase()}</span>
          <div className="profile-fields">
            <div><span>Full name</span><strong>{user.name}</strong></div>
            <div><span>Email address</span><strong>{user.email}</strong></div>
            <div><span>Phone number</span><strong>{user.phone || 'Not provided'}</strong></div>
            <div><span>Account type</span><strong>{user.userType}</strong></div>
          </div>
        </div>
      </section>
    </main>
  )
}

export { HomePage, OrderPage, ProductsPage, UserPage }
