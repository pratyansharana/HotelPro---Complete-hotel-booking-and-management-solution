import { useState } from 'react'
import { Link, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth'

function AuthForm({ mode }) {
  const isRegister = mode === 'register'
  const { user, loading, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) return <Navigate replace to="/dashboard" />

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (isRegister) {
        await register(form)
      } else {
        await login({ email: form.email, password: form.password })
      }
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          `Cannot reach the backend at ${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}. Start the backend and check VITE_API_URL.`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="welcome-panel" aria-label="HotelPro welcome">
        <Link className="brand" to="/">
          <span className="brand-mark">H</span>
          <span>HotelPro</span>
        </Link>
        <div className="welcome-copy">
          <p className="eyebrow">YOUR STAY, YOUR WAY</p>
          <h1>Find a place that feels like yours.</h1>
          <p>Thoughtful stays, easy bookings, and a little more room to relax.</p>
        </div>
        <div className="welcome-footer">
          <span className="status-dot" />
          <span>Good trips start with a good stay.</span>
        </div>
      </section>
      <section className="form-panel">
        <div className="auth-card">
          <div className="mobile-brand">
            <span className="brand-mark">H</span>
            <span>HotelPro</span>
          </div>
          <p className="eyebrow">{isRegister ? 'JOIN HOTELPRO' : 'WELCOME BACK'}</p>
          <h2>{isRegister ? 'Create your account' : 'Sign in to HotelPro'}</h2>
          <p className="subheading">
            {isRegister
              ? 'Create an account to make your next stay yours.'
              : 'Enter your details to access your account.'}
          </p>
          <nav className="mode-switch" aria-label="Account access">
            <NavLink to="/login">Sign in</NavLink>
            <NavLink to="/register">Create account</NavLink>
          </nav>
          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <label>
                Full name
                <input autoComplete="name" name="name" onChange={updateField}
                  placeholder="e.g. Alex Morgan" required value={form.name} />
              </label>
            )}
            <label>
              Email address
              <input autoComplete="email" name="email" onChange={updateField}
                placeholder="you@example.com" required type="email" value={form.email} />
            </label>
            {isRegister && (
              <label>
                Phone number
                <input autoComplete="tel" name="phone" onChange={updateField}
                  placeholder="+1 555 000 0000" required type="tel" value={form.phone} />
              </label>
            )}
            <label>
              Password
              <input autoComplete={isRegister ? 'new-password' : 'current-password'}
                minLength={isRegister ? 8 : undefined} name="password"
                onChange={updateField}
                placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}
                required type="password" value={form.password} />
            </label>
            {error && <p className="form-message error" role="alert">{error}</p>}
            <button className="submit-button" disabled={submitting} type="submit">
              {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
              {!submitting && <span aria-hidden="true">→</span>}
            </button>
          </form>
          <p className="secure-note">Your details are encrypted and stored securely.</p>
        </div>
        <footer className="page-footer">© 2026 HotelPro · Made for better stays</footer>
      </section>
    </main>
  )
}

export default AuthForm
