import { useContext } from 'react'
import { AuthContext } from './AuthContext'
import { authService } from './authService'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const context = useContext(AuthContext)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  const { state, retryInitialization, clearSession } = context

  const login = async (credentials: any) => {
    // In Phase 1 we just provide the API abstraction. 
    // State integration for login/logout happens in Phase 2 when the Login Page is built.
    return authService.login(credentials)
  }

  const logout = async () => {
    const response = await authService.logout()
    if (response.success) {
      // 1. Clear React Query Cache securely to prevent data leaks
      queryClient.clear()
      // 2. Clear AuthContext state locally (this triggers ProtectedRoute to eject)
      clearSession()
      // 3. Fallback explicit navigation
      navigate('/login', { replace: true })
    }
    return response
  }

  return {
    user: state.user,
    isAuthenticated: state.status === 'authenticated',
    isLoading: state.status === 'loading' || state.status === 'idle',
    status: state.status,
    error: state.error,
    login,
    logout,
    retryInitialization,
  }
}
