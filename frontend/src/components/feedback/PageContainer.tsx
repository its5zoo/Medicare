import '../feedback/feedback.css'

interface PageContainerProps {
  children: React.ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="feedback-page">
      <div className="feedback-container">
        {children}
      </div>
    </div>
  )
}
