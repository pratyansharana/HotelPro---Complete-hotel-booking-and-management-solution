import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <Link className="brand footer-brand" to="/">
        <span className="brand-mark">H</span>
        <span>HotelPro</span>
      </Link>
      <span>Thoughtful stays, made simple.</span>
      <span>© 2026 HotelPro</span>
    </footer>
  )
}

export default Footer
