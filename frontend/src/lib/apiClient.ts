export async function apiClient(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init)
  
  if (response.status === 401) {
    try {
      // Clone so we don't consume the body for the caller
      const clone = response.clone()
      const json = await clone.json()
      
      if (json.error?.code === 'UNAUTHORIZED') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      }
    } catch {
      // Ignore JSON parse errors for non-JSON responses
    }
  }

  return response
}
