import { COMMENT_MAX_LENGTH } from '@/constants/feedbackConstants'

interface CommentInputProps {
  value: string
  onChange: (value: string) => void
}

export function CommentInput({ value, onChange }: CommentInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (newValue.length <= COMMENT_MAX_LENGTH) {
      onChange(newValue)
    }
  }

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#1e293b' }} className="feedback-rating-title">
        Additional comments
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>
        Share any other thoughts (optional)
      </div>
      <div className="feedback-comment-wrapper">
        <textarea
          className="feedback-comment"
          value={value}
          onChange={handleChange}
          placeholder="Tell us more about your experience..."
          aria-label="Additional comments"
          maxLength={COMMENT_MAX_LENGTH}
        />
        <span className="feedback-comment-counter">
          {value.length}/{COMMENT_MAX_LENGTH}
        </span>
      </div>
    </div>
  )
}
