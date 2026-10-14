import { Link } from 'react-router-dom'

const stays = [
  {
    name: 'The Fern House',
    location: 'Udaipur, Rajasthan',
    detail: 'Courtyard retreat · Breakfast included',
    price: '₹8,400',
    rating: '4.92',
    image: 'fern',
    initials: 'FH',
  },
  {
    name: 'Coastline & Co.',
    location: 'Candolim, Goa',
    detail: 'A few steps from the sea · Pool',
    price: '₹11,200',
    rating: '4.88',
    image: 'coast',
    initials: 'CC',
  },
  {
    name: 'The Old Quarter',
    location: 'Jaipur, Rajasthan',
    detail: 'Restored haveli · Rooftop dining',
    price: '₹6,750',
    rating: '4.96',
    image: 'quarter',
    initials: 'OQ',
  },
]

function HotelContent({ search = '' }) {
  const normalizedSearch = search.trim().toLowerCase()
  const filteredStays = stays.filter((stay) =>
    `${stay.name} ${stay.location} ${stay.detail}`.toLowerCase().includes(normalizedSearch),
  )

  return (
    <div className="stay-grid">
      {filteredStays.map((stay) => (
        <article className="stay-card" key={stay.name}>
          <div className={`stay-image ${stay.image}`} aria-label={stay.name}>
            <span className="stay-initials">{stay.initials}</span>
            <span className="rating"><span aria-hidden="true">★</span> {stay.rating}</span>
          </div>
          <div className="stay-body">
            <p className="stay-location">{stay.location}</p>
            <h3>{stay.name}</h3>
            <p className="stay-detail">{stay.detail}</p>
            <div className="stay-bottom">
              <p><strong>{stay.price}</strong> <span>/ night</span></p>
              <Link className="stay-link" to={`/order?hotel=${encodeURIComponent(stay.name)}`}>
                View stay <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export default HotelContent
