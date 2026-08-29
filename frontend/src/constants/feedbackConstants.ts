export const FEEDBACK_REASONS = [
  'Waiting Time',
  'Staff Behaviour',
  'Doctor Interaction',
  'Consultation Quality',
  'Billing Issue',
  'Clinic Cleanliness',
  'Other',
] as const

export type FeedbackReason = (typeof FEEDBACK_REASONS)[number]

export const COMMENT_MAX_LENGTH = 500
export const API_TIMEOUT_MS = 10_000
export const REDIRECT_COUNTDOWN_SECONDS = 5
export const LOW_RATING_MAX = 3
export const HIGH_RATING_MIN = 4
