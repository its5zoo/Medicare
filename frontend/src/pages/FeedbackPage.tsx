import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  getFeedback,
  submitFeedback,
  FeedbackApiError,
  type FeedbackData,
} from '@/api/feedbackApi'
import { LOW_RATING_MAX, HIGH_RATING_MIN } from '@/constants/feedbackConstants'
import { PageContainer } from '@/components/feedback/PageContainer'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { PatientInfoCard } from '@/components/feedback/PatientInfoCard'
import { RatingStars } from '@/components/feedback/RatingStars'
import { ReasonSelector } from '@/components/feedback/ReasonSelector'
import { CommentInput } from '@/components/feedback/CommentInput'
import { SubmitButton } from '@/components/feedback/SubmitButton'
import { RedirectModal } from '@/components/feedback/RedirectModal'
import { SuccessCard } from '@/components/feedback/SuccessCard'
import { AlreadySubmittedCard } from '@/components/feedback/AlreadySubmittedCard'
import { ErrorCard } from '@/components/feedback/ErrorCard'

type ErrorKind = 'invalid' | 'generic'

export function FeedbackPage() {
  const { token } = useParams<{ token: string }>()

  // ─── State ───
  const [rating, setRating] = useState<number | null>(null)
  const [reasons, setReasons] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [showRedirectModal, setShowRedirectModal] = useState(false)

  // ─── GET feedback data ───
  const {
    data,
    isLoading,
    error: fetchError,
  } = useQuery<FeedbackData, FeedbackApiError>({
    queryKey: ['feedback', token],
    queryFn: () => {
      if (!token) throw new FeedbackApiError('invalid', 'No token')
      return getFeedback(token)
    },
    enabled: !!token,
    staleTime: 0,
    retry: false,
  })

  // ─── Normalize feedbackStatus ───
  const feedbackStatus = data?.feedbackStatus?.toLowerCase() ?? null

  // ─── Error kind ───
  const errorKind: ErrorKind | null = fetchError
    ? (fetchError instanceof FeedbackApiError ? fetchError.kind : 'generic')
    : (!token ? 'invalid' : null)

  // ─── Low rating submit ───
  const handleLowRatingSubmit = async () => {
    if (!token || rating === null || submitting) return

    setSubmitting(true)
    setSubmitError(false)

    try {
      await submitFeedback({
        token,
        rating,
        reason: reasons,
        comment,
      })
      setSubmitted(true)
    } catch {
      setSubmitError(true)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── High rating: fire POST immediately when modal opens ───
  useEffect(() => {
    if (!showRedirectModal || !token || rating === null) return

    // Fire and forget - independent of countdown
    submitFeedback({
      token,
      rating,
      reason: [],
      comment: '',
    }).catch(() => {});
  }, [showRedirectModal, token, rating])

  // ─── Rating change handler ───
  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
    setSubmitError(false)

    if (newRating >= HIGH_RATING_MIN) {
      // High rating - show redirect modal immediately
      setShowRedirectModal(true)
    } else {
      // Low rating - hide redirect modal if visible
      setShowRedirectModal(false)
    }
  }

  // ─── Google redirect ───
  const handleRedirect = useCallback(() => {
    const googleUrl = import.meta.env.VITE_GOOGLE_REVIEW_URL
    if (googleUrl) {
      window.location.href = googleUrl
    }
  }, [])

  // ─── No token ───
  if (!token) {
    return (
      <PageContainer>
        <ErrorCard variant="invalid" />
      </PageContainer>
    )
  }

  // ─── Loading ───
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSkeleton />
      </PageContainer>
    )
  }

  // ─── Fetch error ───
  if (errorKind) {
    return (
      <PageContainer>
        <ErrorCard variant={errorKind} />
      </PageContainer>
    )
  }

  // ─── feedbackStatus = completed ───
  if (feedbackStatus === 'completed') {
    return (
      <PageContainer>
        {data && <PatientInfoCard data={data} />}
        <AlreadySubmittedCard />
      </PageContainer>
    )
  }

  // ─── Low rating submitted successfully ───
  if (submitted) {
    return (
      <PageContainer>
        {data && <PatientInfoCard data={data} />}
        <SuccessCard />
      </PageContainer>
    )
  }

  // ─── Main feedback form (feedbackStatus = pending) ───
  const isLowRating = rating !== null && rating <= LOW_RATING_MAX

  return (
    <PageContainer>
      {data && <PatientInfoCard data={data} />}

      {/* Reward Banner */}
      <div className="feedback-reward-banner">
        <span className="feedback-reward-icon">🎁</span>
        <span className="feedback-reward-text">
          Get 5% Discount On Your Next Consultation
        </span>
      </div>

      {/* Rating Stars */}
      <RatingStars
        value={rating}
        onChange={handleRatingChange}
        disabled={submitting}
      />

      {/* Low Rating: Reasons + Comment + Submit */}
      {isLowRating && (
        <div className="feedback-expand-enter">
          <div className="feedback-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ReasonSelector selected={reasons} onChange={setReasons} />
            <CommentInput value={comment} onChange={setComment} />

            {submitError && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 13, fontWeight: 500, textAlign: 'center' }}>
                Something went wrong. Please try again.
              </div>
            )}

            <SubmitButton onClick={handleLowRatingSubmit} isSubmitting={submitting} />
          </div>
        </div>
      )}

      {/* High Rating: Redirect Modal */}
      {showRedirectModal && <RedirectModal onRedirect={handleRedirect} />}
    </PageContainer>
  )
}
