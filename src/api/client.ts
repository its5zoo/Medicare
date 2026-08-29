import { apiClient as fetchWrapper } from '@/lib/apiClient'

const rawBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')
export const API_BASE_URL = rawBase

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${normalizedEndpoint}`

  const response = await fetchWrapper(fullUrl, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let msg = `Request failed (${response.status})`
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      msg = 'Clinic service is warming up. Please try again shortly.'
    } else if (response.status === 404 || response.status === 405) {
      msg = 'The requested clinic service is temporarily unavailable.'
    } else if (response.status === 401 || response.status === 403) {
      msg = 'Session expired or unauthorized. Please log in again.'
    } else if (response.status >= 500) {
      msg = 'A temporary server issue occurred. Please retry.'
    }
    throw new ApiError(msg, response.status)
  }

  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new ApiError('Clinic server is reconnecting. Please wait a moment.', response.status)
  }

  let json: any
  try {
    json = await response.json()
  } catch {
    throw new ApiError('Failed to parse server response as JSON.', response.status)
  }

  if (!json || !json.success) {
    throw new ApiError(json?.error?.message || 'API returned unsuccessful response', response.status)
  }

  return json
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),
}
