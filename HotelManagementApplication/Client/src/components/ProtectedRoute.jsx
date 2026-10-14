import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../context/useAuth'

function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <main className="route-loading" role="status">Verifying your session…</main>
  }

  if (!user) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }

  if (roles && !roles.includes(user.userType)) {
    return <Navigate replace to="/dashboard" />
  }

  return <Outlet />
}

export default ProtectedRoute
