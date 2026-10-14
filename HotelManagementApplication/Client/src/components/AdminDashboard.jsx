import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import useAuth from '../context/useAuth'
import Footer from './Footer'
import Header from './Header'

const emptyRoom = {
  roomNumber: '',
  roomType: '',
  pricePerNight: '',
  capacity: '2',
  description: '',
}

function AdminDashboard() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [roomForm, setRoomForm] = useState(emptyRoom)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    api
      .get('/admin/rooms', { signal: controller.signal })
      .then(({ data }) => {
        setError('')
        setRooms(data.rooms)
      })
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') {
          setError(
            requestError.response?.data?.message ||
              'Could not load rooms. Check that the backend is running and your admin session is valid.',
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [refreshKey])

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rooms.filter((room) => {
      const matchesStatus = filter === 'all' || room.status === filter
      const matchesSearch =
        !query ||
        `${room.roomNumber} ${room.roomType} ${room.description}`
          .toLowerCase()
          .includes(query)
      return matchesStatus && matchesSearch
    })
  }, [filter, rooms, search])

  const counts = useMemo(
    () => ({
      total: rooms.length,
      available: rooms.filter((room) => room.status === 'available').length,
      booked: rooms.filter((room) => room.status === 'booked').length,
      maintenance: rooms.filter((room) => room.status === 'maintenance').length,
    }),
    [rooms],
  )

  function updateField(event) {
    setRoomForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function addRoom(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const { data } = await api.post('/admin/rooms', {
        ...roomForm,
        pricePerNight: Number(roomForm.pricePerNight),
        capacity: Number(roomForm.capacity),
      })
      setRooms((current) =>
        [...current, data.room].sort((left, right) =>
          left.roomNumber.localeCompare(right.roomNumber, undefined, { numeric: true }),
        ),
      )
      setRoomForm(emptyRoom)
      setNotice('Room added to your inventory.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not add this room.')
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(room, status) {
    setError('')
    setNotice('')
    try {
      const { data } = await api.patch(`/admin/rooms/${room._id}/status`, { status })
      setRooms((current) =>
        current.map((item) => (item._id === room._id ? data.room : item)),
      )
      setNotice(`Room ${room.roomNumber} marked ${status}.`)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update room status.')
    }
  }

  async function removeRoom(room) {
    const confirmed = window.confirm(`Remove room ${room.roomNumber} from your inventory?`)
    if (!confirmed) return

    setError('')
    setNotice('')
    try {
      await api.delete(`/admin/rooms/${room._id}`)
      setRooms((current) => current.filter((item) => item._id !== room._id))
      setNotice(`Room ${room.roomNumber} removed.`)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not remove this room.')
    }
  }

  return (
    <div className="app-shell">
      <Header />
      <main className="content-wrap admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">HOTELPRO OPERATIONS</p>
          <h1 className="page-title">Room management</h1>
          <p className="admin-welcome">Good day, {user.name.split(' ')[0]}. Here’s your property at a glance.</p>
        </div>
        <span className="admin-access"><span /> Admin access</span>
      </div>

      {error && <p className="form-message error admin-message" role="alert">{error}</p>}
      {notice && <p className="form-message success admin-message" role="status">{notice}</p>}

      <section className="admin-stats" aria-label="Room inventory summary">
        <article className="admin-stat">
          <span className="admin-stat-icon">▦</span>
          <div><span>Total rooms</span><strong>{counts.total}</strong></div>
          <small>In your inventory</small>
        </article>
        <article className="admin-stat">
          <span className="admin-stat-icon available">✓</span>
          <div><span>Available</span><strong>{counts.available}</strong></div>
          <small>Ready for guests</small>
        </article>
        <article className="admin-stat">
          <span className="admin-stat-icon booked">▤</span>
          <div><span>Booked</span><strong>{counts.booked}</strong></div>
          <small>Currently occupied</small>
        </article>
        <article className="admin-stat">
          <span className="admin-stat-icon maintenance">⚒</span>
          <div><span>Maintenance</span><strong>{counts.maintenance}</strong></div>
          <small>Temporarily unavailable</small>
        </article>
      </section>

      <div className="admin-workspace">
        <section className="admin-inventory">
          <div className="admin-section-heading">
            <div>
              <p className="eyebrow">PROPERTY INVENTORY</p>
              <h2>All rooms <span>{rooms.length}</span></h2>
            </div>
            <button
              className="button button-small"
              onClick={() => {
                setLoading(true)
                setRefreshKey((current) => current + 1)
              }}
              type="button"
            >
              Refresh
            </button>
          </div>
          <div className="inventory-toolbar">
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label="Search rooms"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search room or type"
                value={search}
              />
            </label>
            <label className="filter-select">
              <span className="sr-only">Filter rooms by status</span>
              <select onChange={(event) => setFilter(event.target.value)} value={filter}>
                <option value="all">All statuses</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="admin-empty" role="status">Loading room inventory…</div>
          ) : filteredRooms.length ? (
            <div className="room-table-wrap">
              <table className="room-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Type & capacity</th>
                    <th>Rate / night</th>
                    <th>Status</th>
                    <th><span className="sr-only">Room actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room) => (
                    <tr key={room._id}>
                      <td>
                        <strong className="room-number">Room {room.roomNumber}</strong>
                        {room.description && <small className="room-description">{room.description}</small>}
                      </td>
                      <td>
                        <strong>{room.roomType}</strong>
                        <small className="room-description">{room.capacity} guests</small>
                      </td>
                      <td className="room-price">
                        ₹{Number(room.pricePerNight).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`room-status ${room.status}`}>
                          <span />{room.status}
                        </span>
                      </td>
                      <td>
                        <div className="room-actions">
                          <label>
                            <span className="sr-only">Change status for room {room.roomNumber}</span>
                            <select
                              aria-label={`Change status for room ${room.roomNumber}`}
                              onChange={(event) => changeStatus(room, event.target.value)}
                              value={room.status}
                            >
                              <option value="available">Available</option>
                              <option value="booked">Booked</option>
                              <option value="maintenance">Maintenance</option>
                            </select>
                          </label>
                          <button
                            aria-label={`Remove room ${room.roomNumber}`}
                            className="icon-button danger"
                            onClick={() => removeRoom(room)}
                            title="Remove room"
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">
              <span aria-hidden="true">⌕</span>
              <strong>{rooms.length ? 'No matching rooms' : 'Your inventory is ready'}</strong>
              <p>{rooms.length ? 'Try a different search or status filter.' : 'Add your first room using the form.'}</p>
            </div>
          )}
        </section>

        <aside className="add-room-panel">
          <div className="add-room-title">
            <span className="add-room-icon">＋</span>
            <div><p className="eyebrow">GROW YOUR INVENTORY</p><h2>Add a room</h2></div>
          </div>
          <p className="add-room-intro">Add a room to your property inventory. New rooms start as available.</p>
          <form className="room-form" onSubmit={addRoom}>
            <label>
              Room number
              <input
                maxLength={20}
                name="roomNumber"
                onChange={updateField}
                placeholder="e.g. 204"
                required
                value={roomForm.roomNumber}
              />
            </label>
            <label>
              Room type
              <select name="roomType" onChange={updateField} required value={roomForm.roomType}>
                <option disabled value="">Select a room type</option>
                <option>Standard</option>
                <option>Deluxe</option>
                <option>Suite</option>
                <option>Family</option>
                <option>Accessible</option>
              </select>
            </label>
            <div className="room-form-row">
              <label>
                Price per night
                <span className="currency-input"><span>₹</span><input
                  min="0"
                  name="pricePerNight"
                  onChange={updateField}
                  placeholder="0"
                  required
                  step="0.01"
                  type="number"
                  value={roomForm.pricePerNight}
                /></span>
              </label>
              <label>
                Guests
                <input
                  max="20"
                  min="1"
                  name="capacity"
                  onChange={updateField}
                  required
                  type="number"
                  value={roomForm.capacity}
                />
              </label>
            </div>
            <label>
              Description <span className="optional-label">Optional</span>
              <textarea
                maxLength={500}
                name="description"
                onChange={updateField}
                placeholder="Add a short description"
                rows="3"
                value={roomForm.description}
              />
            </label>
            <button className="button add-room-submit" disabled={saving} type="submit">
              {saving ? 'Adding room…' : 'Add room to inventory'}
              {!saving && <span aria-hidden="true">→</span>}
            </button>
          </form>
          <p className="admin-form-note">Room details can be updated later from your inventory.</p>
        </aside>
      </div>
      </main>
      <Footer />
    </div>
  )
}

export default AdminDashboard
