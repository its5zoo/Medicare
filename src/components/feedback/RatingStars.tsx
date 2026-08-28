interface RatingStarsProps {
  value: number | null
  onChange: (rating: number) => void
  disabled?: boolean
}

export function RatingStars({ value, onChange, disabled = false }: RatingStarsProps) {
  return (
    <div className="feedback-card">
      <div className="feedback-rating-section">
        <div className="feedback-rating-title">How was your experience?</div>
        <div className="feedback-rating-subtitle">Tap a star to rate your visit</div>
        <div className="feedback-stars" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => {
            const isSelected = value !== null && star <= value

            return (
              <button
                key={star}
                type="button"
                className={`feedback-star${isSelected ? ' selected' : ''}`}
                onClick={() => !disabled && onChange(star)}
                disabled={disabled}
                role="radio"
                aria-checked={value === star}
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
              >
                <svg viewBox="0 0 24 24" fill={isSelected ? 'url(#starGold)' : 'none'} stroke={isSelected ? 'none' : '#cbd5e1'} strokeWidth="1.5">
                  <defs>
                    <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
