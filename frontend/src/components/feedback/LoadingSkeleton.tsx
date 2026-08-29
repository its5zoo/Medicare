export function LoadingSkeleton() {
  return (
    <>
      {/* Clinic + Patient Info skeleton */}
      <div className="feedback-card">
        <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '1px solid rgba(99,102,241,0.1)', marginBottom: 16 }}>
          <div className="feedback-skeleton-line" style={{ width: 48, height: 48, borderRadius: 14, margin: '0 auto 10px' }} />
          <div className="feedback-skeleton-line" style={{ width: 140, height: 16, borderRadius: 8, margin: '0 auto 6px' }} />
          <div className="feedback-skeleton-line" style={{ width: 100, height: 10, borderRadius: 6, margin: '0 auto' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="feedback-skeleton-line" style={{ width: 60, height: 10, borderRadius: 6, marginBottom: 6 }} />
              <div className="feedback-skeleton-line" style={{ width: '85%', height: 14, borderRadius: 8 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Reward banner skeleton */}
      <div className="feedback-skeleton-line" style={{ height: 52, borderRadius: 14 }} />

      {/* Rating section skeleton */}
      <div className="feedback-card">
        <div style={{ textAlign: 'center' }}>
          <div className="feedback-skeleton-line" style={{ width: 180, height: 18, borderRadius: 8, margin: '0 auto 8px' }} />
          <div className="feedback-skeleton-line" style={{ width: 220, height: 12, borderRadius: 6, margin: '0 auto 24px' }} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="feedback-skeleton-line" style={{ width: 48, height: 48, borderRadius: 12 }} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
