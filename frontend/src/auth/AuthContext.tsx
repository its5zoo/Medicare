import { createContext, useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { authService } from './authService'
import type { AuthAction, AuthState } from './types'
import { StartupLoader } from '@/components/shared/StartupLoader'

const initialState: AuthState = {
  status: 'idle',
  user: null,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'CHECK_SESSION_START': return { ...state, status: 'loading', error: null }
    case 'SESSION_RESTORED': return { ...state, status: 'authenticated', user: action.payload, error: null }
    case 'SESSION_REJECTED': return { ...state, status: 'unauthenticated', user: null, error: null }
    case 'SESSION_ERROR': return { ...state, status: 'error', error: action.payload }
    case 'LOGOUT': return { ...state, status: 'unauthenticated', user: null, error: null }
    default: return state
  }
}

export const AuthContext = createContext<{
  state: AuthState
  retryInitialization: () => void
  clearSession: () => void
} | undefined>(undefined)

interface AuthProviderProps { children: ReactNode }

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const isHandlingUnauthorized = useRef(false)
  const [sessionExpiredToast, setSessionExpiredToast] = useState(false)

  const initializeAuth = useCallback(async (signal?: AbortSignal) => {
    dispatch({ type: 'CHECK_SESSION_START' })

    try {
      const response = await authService.getMe(signal)

      if (signal?.aborted) return

      if (response.success && response.data) {
        dispatch({ type: 'SESSION_RESTORED', payload: response.data.user })
      } else if (response.error?.code === 'UNAUTHORIZED') {
        dispatch({ type: 'SESSION_REJECTED' })
      } else {
        dispatch({ type: 'SESSION_ERROR', payload: response.error?.message || 'Unknown error' })
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || signal?.aborted) return
      dispatch({ type: 'SESSION_ERROR', payload: err?.message || 'Unknown error' })
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    initializeAuth(controller.signal)
    return () => controller.abort()
  }, [initializeAuth])

  const clearSession = useCallback(() => {
    dispatch({ type: 'LOGOUT' })
  }, [])

  // Global Unauthorized Listener
  // useEffect(() => {
  //   const handleUnauthorized = () => {
  //     if (isHandlingUnauthorized.current) return
  //     isHandlingUnauthorized.current = true

  //     clearSession()
  //     queryClient.clear()
  //     navigate('/login', { replace: true })

  //     setSessionExpiredToast(true)

  //     setTimeout(() => {
  //       setSessionExpiredToast(false)
  //       isHandlingUnauthorized.current = false
  //     }, 5000)
  //   }

  // }, [clearSession, navigate, queryClient])
  useEffect(() => {
    const handleUnauthorized = () => {
      if (isHandlingUnauthorized.current) return

      isHandlingUnauthorized.current = true

      clearSession()
      queryClient.clear()

      navigate('/login', { replace: true })

      setSessionExpiredToast(true)

      setTimeout(() => {
        setSessionExpiredToast(false)
        isHandlingUnauthorized.current = false
      }, 5000)
    }

    window.addEventListener(
      'auth:unauthorized',
      handleUnauthorized
    )

    return () => {
      window.removeEventListener(
        'auth:unauthorized',
        handleUnauthorized
      )
    }
  }, [clearSession, navigate, queryClient])

  if (state.status === 'idle' || state.status === 'loading') {
    return <StartupLoader />
  }

  if (state.status === 'error') {
    return (
      <StartupLoader
        error={state.error}
        onRetry={() => initializeAuth()}
        onGoToLogin={() => dispatch({ type: 'SESSION_REJECTED' })}
      />
    )
  }

  return (
    <AuthContext.Provider value={{ state, retryInitialization: initializeAuth, clearSession }}>
      {children}
      {sessionExpiredToast && (
        <div className="fixed bottom-4 right-4 z-[10000] max-w-[90vw] rounded-lg bg-red-600 px-4 py-3 text-white shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <p className="text-sm font-medium">Session expired. Please login again.</p>
        </div>
      )}
    </AuthContext.Provider>
  )
}
