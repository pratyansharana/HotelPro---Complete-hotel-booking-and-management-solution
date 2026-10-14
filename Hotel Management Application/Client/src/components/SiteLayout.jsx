import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'

function SiteLayout() {
  return (
    <div className="app-shell">
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}

export default SiteLayout
