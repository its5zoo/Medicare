export function SuccessCard() {
  return (
    <div className="feedback-card">
      <div className="feedback-result-card">
        <div className="feedback-result-emoji">❤️</div>
        <div className="feedback-result-title">Thank You</div>
        <div className="feedback-result-text">
          <p>Your feedback has been submitted successfully.</p>
          <p>We appreciate your time and support.</p>
          <p>Our team will use your feedback to improve your experience.</p>
        </div>
        <div className="feedback-result-voucher">
          🎁 Your 5% discount voucher will be shared shortly.
        </div>
      </div>
    </div>
  )
}
