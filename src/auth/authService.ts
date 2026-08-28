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

export const authService = {
  async getMe(signal?: AbortSignal): Promise<AuthResponse<{ user: User }>> {
    try {
      const normalizedBase = API_BASE_URL.replace(/\/+$/, '')
      const response = await apiClient(`${normalizedBase}/auth/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal,
      })

      if (response.status === 401 || response.status === 403) {
        return { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }
      }

      if (!response.ok) {
        return { success: false, error: { message: `Request failed with status ${response.status}`, code: 'UNAUTHORIZED' } }
      }

      const json = await parseJsonSafely(response)

      if (!json) {
        // If response was not JSON (e.g. static html returned), treat session as unauthenticated
        return { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }
      }

      if (!json.success) {
        return { success: false, error: { message: json.error?.message || 'Authentication failed', code: 'UNAUTHORIZED' } }
      }

      return { success: true, data: json.data }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err // Let AbortError propagate so React can handle it
      }
      return { success: false, error: { message: err.message || 'Network error', code: 'NETWORK_ERROR' } }
    }
  },

  async login(credentials: any): Promise<AuthResponse<{ user: User }>> {
    try {
      const normalizedBase = API_BASE_URL.replace(/\/+$/, '')
      const response = await apiClient(`${normalizedBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      })

      if (response.status === 401) {
        return { success: false, error: { message: 'Invalid credentials', code: 'UNAUTHORIZED' } }
      }

      if (!response.ok) {
        return { success: false, error: { message: `Request failed with status ${response.status}` } }
      }

      const json = await parseJsonSafely(response)

      if (!json) {
        return { success: false, error: { message: 'Server returned invalid response. Please verify backend connection.', code: 'INVALID_RESPONSE' } }
      }

      if (!json.success) {
        return { success: false, error: { message: json.error?.message || 'Login failed' } }
      }

      return { success: true, data: json.data }
    } catch (err: any) {
      return { success: false, error: { message: err.message || 'Network error', code: 'NETWORK_ERROR' } }
    }
  },

  async logout(): Promise<AuthResponse<null>> {
    try {
      const normalizedBase = API_BASE_URL.replace(/\/+$/, '')
      const response = await apiClient(`${normalizedBase}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (!response.ok) {
        return { success: false, error: { message: `Logout failed with status ${response.status}` } }
      }

      return { success: true, data: null }
    } catch (err: any) {
      return { success: false, error: { message: err.message || 'Network error', code: 'NETWORK_ERROR' } }
    }
  },
}
