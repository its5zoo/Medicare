import { API_TIMEOUT_MS } from '@/constants/feedbackConstants'

// ─── Types matching exact backend contract ───

export interface FeedbackData {
  token: string
  patientId: string
  patientName: string
  doctorName: string
  feedbackId: string
  feedbackUrl: string
  phone: string
  visitDate: string
  rating: string
  reason: string[] | null
  comment: string | null
  feedbackStatus: string
  googleRedirected: string
  whatsappSent: string
  reviewLinkOpened: string
  submittedAt: string | null
  snapshotVersion: number
  snapshotGeneratedAt: string
}

interface FeedbackGetResponse {
  success: boolean
  data: FeedbackData
}

export interface FeedbackSubmitPayload {
  token: string
  rating: number
  reason: string[]
  comment: string
}

interface FeedbackSubmitResponse {
  success: boolean
  message: string
}

// ─── Error types ───

export type FeedbackErrorKind = 'invalid' | 'generic'

export class FeedbackApiError extends Error {
  kind: FeedbackErrorKind

  constructor(kind: FeedbackErrorKind, message: string) {
    super(message)
    this.name = 'FeedbackApiError'
    this.kind = kind
  }
}

// ─── Internal fetch with timeout ───

async function fetchWithTimeout(
  url: string,
  options: RequestInit
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new FeedbackApiError('generic', 'Request timed out')
    }
    throw new FeedbackApiError('generic', 'Network request failed')
  } finally {
    clearTimeout(timeoutId)
  }
}

// ─── GET feedback data ───

export async function getFeedback(token: string): Promise<FeedbackData> {
  const baseUrl = import.meta.env.VITE_FEEDBACK_GET_API
  if (!baseUrl) {
    throw new FeedbackApiError('generic', 'Feedback API not configured')
  }

  const response = await fetchWithTimeout(`${baseUrl}/${token}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (response.status === 404 || response.status === 400) {
    throw new FeedbackApiError('invalid', 'Invalid feedback link')
  }

  if (!response.ok) {
    throw new FeedbackApiError('generic', 'Request failed')
  }

  let json: FeedbackGetResponse
  try {
    json = await response.json()
  } catch {
    throw new FeedbackApiError('generic', 'Invalid response')
  }

  if (!json.success || !json.data) {
    throw new FeedbackApiError('generic', 'Request failed')
  }

  return json.data
}

// ─── POST submit feedback ───

export async function submitFeedback(
  payload: FeedbackSubmitPayload
): Promise<FeedbackSubmitResponse> {
  const baseUrl = import.meta.env.VITE_FEEDBACK_SUBMIT_API
  if (!baseUrl) {
    throw new FeedbackApiError('generic', 'Submit API not configured')
  }

  const response = await fetchWithTimeout(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new FeedbackApiError('generic', 'Submission failed')
  }

  let json: FeedbackSubmitResponse
  try {
    json = await response.json()
  } catch {
    throw new FeedbackApiError('generic', 'Invalid response')
  }

  if (!json.success) {
    throw new FeedbackApiError('generic', 'Submission failed')
  }

  return json
}
