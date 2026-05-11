import { createContext, useContext, useState, useCallback } from 'react'
import axiosInstance from '../api/axiosInstance'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const accessToken = localStorage.getItem('accessToken')
    const memberId = localStorage.getItem('memberId')
    const email = localStorage.getItem('email')
    const name = localStorage.getItem('name')
    const role = localStorage.getItem('role')
    if (accessToken && memberId) {
      return { accessToken, memberId, email, name, role }
    }
    return null
  })

  const login = useCallback(({ accessToken, memberId, email, name, role }) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('memberId', memberId)
    localStorage.setItem('email', email ?? '')
    localStorage.setItem('name', name ?? '')
    localStorage.setItem('role', role ?? 'USER')
    setAuth({ accessToken, memberId, email, name, role })
  }, [])

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/api/auth/logout')
    } catch (_) {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('memberId')
    localStorage.removeItem('email')
    localStorage.removeItem('name')
    localStorage.removeItem('role')
    setAuth(null)
  }, [])

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
