interface SubmitButtonProps {
  onClick: () => void
  isSubmitting: boolean
}

export function SubmitButton({ onClick, isSubmitting }: SubmitButtonProps) {
  return (
    <button
      type="button"
      className="feedback-submit-btn"
      onClick={onClick}
      disabled={isSubmitting}
      aria-busy={isSubmitting}
    >
      {isSubmitting && <span className="feedback-spinner" />}
      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
    </button>
  )
}
