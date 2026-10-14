import { useCallback, useEffect, useMemo, useState } from 'react'
import api, { getToken } from '../services/api'
import AuthContext from './authContext'

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    const token = getToken()
    if (!token) return undefined

    let active = true
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (active) setUser(data.user)
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('hotelpro-token')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const authenticate = useCallback(async (endpoint, credentials) => {
    const { data } = await api.post(endpoint, credentials)
    localStorage.setItem('hotelpro-token', data.token)
    setUser(data.user)
    return data.user
  }, [])

  const login = useCallback(
    (credentials) => authenticate('/auth/login', credentials),
    [authenticate],
  )

  const register = useCallback(
    (credentials) => authenticate('/auth/register', credentials),
    [authenticate],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('hotelpro-token')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
