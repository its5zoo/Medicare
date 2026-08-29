import { API_BASE_URL } from '@/api/client'

export const TRANSACTION_TIMEOUT_MS = 40_000

export interface ApiErrorBody {
  code: string
  message: string
}

export interface ApiFailure {
  success: false
  error: ApiErrorBody
  status?: number
}

export type ApiResult<T> =
  | { success: true; data: T; message?: string; requestId?: string }
  | ApiFailure

async function parseJsonResponse(response: Response): Promise<unknown> {
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

export async function apiPost<TData>(
  endpoint: string,
  body: unknown
): Promise<ApiResult<TData>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const json = (await parseJsonResponse(response)) as {
      success?: boolean
      data?: TData
      message?: string
      requestId?: string
      error?: ApiErrorBody
    } | null

    if (!json) {
      return {
        success: false,
        error: { code: 'INVALID_RESPONSE', message: 'Workflow returned invalid JSON' },
        status: response.status,
      }
    }

    if (!response.ok || json.success === false) {
      return {
        success: false,
        error: json.error ?? {
          code: 'UNKNOWN_ERROR',
          message: json.message ?? 'Request failed',
        },
        status: response.status,
      }
    }

    return {
      success: true,
      data: json.data as TData,
      message: json.message,
      requestId: json.requestId,
    }
  } catch {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Unable to reach workflow' },
      status: 0,
    }
  }
}

export async function apiGet<TData>(endpoint: string): Promise<ApiResult<TData>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    const json = (await parseJsonResponse(response)) as {
      success?: boolean
      data?: TData
      error?: ApiErrorBody
    } | null

    if (!json || !response.ok || json.success === false) {
      return {
        success: false,
        error: json?.error ?? {
          code: 'UNKNOWN_ERROR',
          message: 'Request failed',
        },
        status: response.status,
      }
    }

    return { success: true, data: json.data as TData }
  } catch {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'Unable to reach workflow' },
      status: 0,
    }
  }
}

export function getErrorPresentation(error: ApiErrorBody): {
  title: string
  message: string
  isTimeout: boolean
} {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return { title: 'Validation Error', message: error.message, isTimeout: false }
    case 'INVALID_RESPONSE':
      return { title: 'Workflow Error', message: error.message, isTimeout: false }
    case 'NETWORK_ERROR':
      return { title: 'Connection Error', message: error.message, isTimeout: false }
    case 'TIMEOUT':
      return {
        title: 'Processing Taking Longer Than Expected',
        message: "We'll notify you if the workflow completes.",
        isTimeout: true,
      }
    default:
      return { title: 'Error', message: error.message, isTimeout: false }
  }
}
