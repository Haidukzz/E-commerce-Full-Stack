import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const [roles, setRoles]     = useState([])
  const [loading, setLoading] = useState(false)

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/usuarios/me')
      setRoles(data.perfis || [])
      setUser(prev => ({ ...prev, ...data }))
      localStorage.setItem('user', JSON.stringify({ ...user, ...data }))
    } catch { /* token inválido */ }
  }, [])

  useEffect(() => {
    if (localStorage.getItem('token')) loadProfile()
  }, [])

  const login = async (email, senha) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, senha })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))
      setUser(data)
      await loadProfile()
      return data
    } finally {
      setLoading(false)
    }
  }

  const register = async (nome, email, senha) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/registrar', { nome, email, senha })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))
      setUser(data)
      await loadProfile()
      return data
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setRoles([])
  }

  const isAdmin      = roles.includes('ROLE_ADMIN')
  const isManager    = roles.includes('ROLE_MANAGER')
  const isStaff      = isAdmin || isManager
  const isLoggedIn   = !!localStorage.getItem('token')

  return (
    <AuthContext.Provider value={{ user, roles, loading, login, register, logout, isAdmin, isManager, isStaff, isLoggedIn, loadProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
