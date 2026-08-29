export async function apiClient(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('auth_token')
  const headers = new Headers(init?.headers || {})

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: init?.credentials ?? 'include',
  })

  if (response.status === 401) {
    try {
      const clone = response.clone()
      const json = await clone.json()
      if (json.error?.code === 'UNAUTHORIZED' || json.code === 'UNAUTHORIZED') {
        localStorage.removeItem('auth_token')
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      }
    } catch {
      // Ignore JSON parse errors for non-JSON responses
    }
  }

  return response
}
