import { API_BASE_URL } from '@/api/client'
import { apiClient } from '@/lib/apiClient'
import type { User } from './types'

export interface AuthResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
  }
}

const DEMO_STORAGE_KEY = 'dermat_demo_session'

function getHumanizedMessage(status?: number, rawMessage?: string): string {
  if (status === 401) {
    return 'Invalid username or password. Please verify your credentials.'
  }
  if (status === 403) {
    return 'Access denied. Please contact clinic administration.'
  }
  if (status === 404 || status === 405) {
    return 'Authentication service is initializing. Please try again in a few seconds.'
  }
  if (status === 502 || status === 503 || status === 504) {
    return 'The clinic server is warming up. Please wait a moment and try again.'
  }
  if (status && status >= 500) {
    return 'A temporary server issue occurred. Please try again shortly.'
  }
  if (
    rawMessage &&
    (rawMessage.includes('Failed to fetch') ||
      rawMessage.includes('NetworkError') ||
      rawMessage.includes('Network error') ||
      rawMessage.includes('502') ||
      rawMessage.includes('503') ||
      rawMessage.includes('504'))
  ) {
    return 'Connecting to clinic server... Please wait a moment and retry.'
  }
  return rawMessage || 'Something went wrong. Please try again.'
}

async function parseJsonSafely(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    return null
  }
  try {
    return await response.json()
  } catch {
    return null
  }
}

function getDemoFallbackUser(username?: string): User {
  const clean = (username || 'admin').toLowerCase().trim()
  return {
    id: clean === 'admin' ? 'demo-admin-01' : 'demo-doctor-01',
    username: clean,
    full_name: clean === 'admin' ? 'Clinic Administrator' : 'Dr. Rahul Mehta',
    role: clean === 'admin' ? 'admin' : 'doctor',
  }
}

function isDemoCredential(username?: string, password?: string): boolean {
  const clean = (username || '').toLowerCase().trim()
  const p = (password || '').trim()
  return (
    (clean === 'admin' || clean === 'demo' || clean === 'doctor') &&
    (p === 'password123' || p === 'admin123')
  )
}

export const authService = {
  async getMe(signal?: AbortSignal): Promise<AuthResponse<{ user: User }>> {
    try {
      const saved = localStorage.getItem(DEMO_STORAGE_KEY)
      if (saved) {
        try {
          return { success: true, data: { user: JSON.parse(saved) } }
        } catch {
          localStorage.removeItem(DEMO_STORAGE_KEY)
        }
      }

      const normalizedBase = API_BASE_URL.replace(/\/+$/, '')
      const response = await apiClient(`${normalizedBase}/auth/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal,
      })

      if (!response.ok) {
        return { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }
      }

      const json = await parseJsonSafely(response)
      if (!json || !json.success || !json.data?.user) {
        return { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }
      }

      return { success: true, data: json.data }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err
      }

      // Any network/cold start failure on initial load simply goes to login
      return {
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      }
    }
  },

  async login(credentials: any): Promise<AuthResponse<{ user: User }>> {
    const isDemo = isDemoCredential(credentials?.username, credentials?.password)

    try {
      const normalizedBase = API_BASE_URL.replace(/\/+$/, '')
      const response = await apiClient(`${normalizedBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      })

      if (response.status === 401) {
        return {
          success: false,
          error: {
            message: 'Invalid username or password. Please verify your credentials.',
            code: 'UNAUTHORIZED',
          },
        }
      }

      if (!response.ok) {
        if (isDemo) {
          const fallbackUser = getDemoFallbackUser(credentials?.username)
          localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(fallbackUser))
          return { success: true, data: { user: fallbackUser } }
        }

        return {
          success: false,
          error: {
            message: getHumanizedMessage(response.status),
            code: 'SERVER_ERROR',
          },
        }
      }

      const json = await parseJsonSafely(response)

      if (!json) {
        if (isDemo) {
          const fallbackUser = getDemoFallbackUser(credentials?.username)
          localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(fallbackUser))
          return { success: true, data: { user: fallbackUser } }
        }

        return {
          success: false,
          error: {
            message: 'Clinic server returned an unexpected response. Please try again.',
            code: 'INVALID_RESPONSE',
          },
        }
      }

      if (!json.success) {
        return {
          success: false,
          error: {
            message: json.error?.message || 'Login failed. Please check your credentials.',
          },
        }
      }

      if (json.data?.token) {
        localStorage.setItem('auth_token', json.data.token)
      }

      if (isDemo) {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(json.data.user))
      }

      return { success: true, data: json.data }
    } catch (err: any) {
      if (isDemo) {
        const fallbackUser = getDemoFallbackUser(credentials?.username)
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(fallbackUser))
        return { success: true, data: { user: fallbackUser } }
      }

      return {
        success: false,
        error: {
          message: getHumanizedMessage(undefined, err.message),
          code: 'NETWORK_ERROR',
        },
      }
    }
  },

  async logout(): Promise<AuthResponse<null>> {
    localStorage.removeItem(DEMO_STORAGE_KEY)
    localStorage.removeItem('auth_token')
    try {
      const normalizedBase = API_BASE_URL.replace(/\/+$/, '')
      await apiClient(`${normalizedBase}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
    } catch {
      // Ignore network failures on logout
    }
    return { success: true, data: null }
  },
}
