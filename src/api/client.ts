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
    throw new ApiError(`Request failed: ${response.statusText}`, response.status)
  }

  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new ApiError('Server returned invalid non-JSON response. Check backend connection.', response.status)
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
