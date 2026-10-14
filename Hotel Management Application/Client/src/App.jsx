import { useEffect, useState } from 'react'
import api from './services/api'
import './App.css'

const emptyForm = { name: '', email: '', password: '', phone: '' }

function App() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [restoring, setRestoring] = useState(() =>
    Boolean(localStorage.getItem('hotelpro-token')),
  )

  const isRegistering = mode === 'register'

  useEffect(() => {
    const token = localStorage.getItem('hotelpro-token')
    if (!token) return undefined

    let active = true
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (active) setUser(data.user)
      })
      .catch(() => {
        localStorage.removeItem('hotelpro-token')
      })
      .finally(() => {
        if (active) setRestoring(false)
      })

    return () => {
      active = false
    }
  }, [])

  function changeMode(nextMode) {
    setMode(nextMode)
    setForm(emptyForm)
    setError('')
    setMessage('')
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login'
      const { data } = await api.post(endpoint, form)
      localStorage.setItem('hotelpro-token', data.token)
      setUser(data.user)
      setMessage(data.message)
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          `Cannot reach the backend at ${api.defaults.baseURL}. Start the backend and check VITE_API_URL.`,
      )
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('hotelpro-token')
    setUser(null)
    setMessage('')
    setForm(emptyForm)
    setMode('login')
  }

  return (
    <main className="auth-page">
      <section className="welcome-panel" aria-label="HotelPro welcome">
        <a className="brand" href="/" aria-label="HotelPro home">
          <span className="brand-mark">H</span>
          <span>HotelPro</span>
        </a>
        <div className="welcome-copy">
          <p className="eyebrow">YOUR STAY, YOUR WAY</p>
          <h1>Find a place that feels like yours.</h1>
          <p>
            Thoughtful stays, easy bookings, and a little more room to relax.
          </p>
        </div>
        <div className="welcome-footer">
          <span className="status-dot" />
          <span>Good trips start with a good stay.</span>
        </div>
      </section>

      <section className="form-panel">
        <div className="auth-card">
          {restoring ? (
            <p className="subheading" role="status">Restoring your session…</p>
          ) : user ? (
            <div className="signed-in">
              <div className="success-icon" aria-hidden="true">✓</div>
              <p className="eyebrow">YOU’RE SIGNED IN</p>
              <h2>Welcome, {user.name}.</h2>
              <p className="subheading">
                Your HotelPro account is ready. You can continue exploring your
                stay options.
              </p>
              <button className="submit-button" type="button" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          ) : (
            <>
              <div className="mobile-brand">
                <span className="brand-mark">H</span>
                <span>HotelPro</span>
              </div>
              <p className="eyebrow">{isRegistering ? 'JOIN HOTELPRO' : 'WELCOME BACK'}</p>
              <h2>{isRegistering ? 'Create your account' : 'Sign in to HotelPro'}</h2>
              <p className="subheading">
                {isRegistering
                  ? 'Create an account to make your next stay yours.'
                  : 'Enter your details to access your account.'}
              </p>

              <div className="mode-switch" role="tablist" aria-label="Account access">
                <button
                  className={mode === 'login' ? 'active' : ''}
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  onClick={() => changeMode('login')}
                >
                  Sign in
                </button>
                <button
                  className={mode === 'register' ? 'active' : ''}
                  type="button"
                  role="tab"
                  aria-selected={mode === 'register'}
                  onClick={() => changeMode('register')}
                >
                  Create account
                </button>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                {isRegistering && (
                  <label>
                    Full name
                    <input
                      autoComplete="name"
                      name="name"
                      onChange={updateField}
                      placeholder="e.g. Alex Morgan"
                      required
                      value={form.name}
                    />
                  </label>
                )}
                <label>
                  Email address
                  <input
                    autoComplete="email"
                    name="email"
                    onChange={updateField}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={form.email}
                  />
                </label>
                {isRegistering && (
                  <label>
                    Phone number
                    <input
                      autoComplete="tel"
                      name="phone"
                      onChange={updateField}
                      placeholder="+1 555 000 0000"
                      required
                      type="tel"
                      value={form.phone}
                    />
                  </label>
                )}
                <label>
                  Password
                  <input
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    minLength={isRegistering ? 8 : undefined}
                    name="password"
                    onChange={updateField}
                    placeholder={isRegistering ? 'At least 8 characters' : 'Enter your password'}
                    required
                    type="password"
                    value={form.password}
                  />
                </label>

                {error && <p className="form-message error" role="alert">{error}</p>}
                {message && <p className="form-message success" role="status">{message}</p>}

                <button className="submit-button" disabled={loading} type="submit">
                  {loading
                    ? 'Please wait…'
                    : isRegistering
                      ? 'Create account'
                      : 'Sign in'}
                  {!loading && <span aria-hidden="true">→</span>}
                </button>
              </form>
              <p className="secure-note">
                Your details are encrypted and stored securely.
              </p>
            </>
          )}
        </div>
        <footer className="page-footer">© 2026 HotelPro · Made for better stays</footer>
      </section>
    </main>
  )
}

export default App
