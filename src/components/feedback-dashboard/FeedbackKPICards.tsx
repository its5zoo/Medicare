import { Card, CardContent } from '@/components/ui/card';
import { Star, MessageSquare, Clock, Send } from 'lucide-react';
import type { ReviewSummary } from './types';

interface FeedbackKPICardsProps {
  summary?: ReviewSummary;
  onReviewsSubmittedClick?: () => void;
  onPendingReviewsClick?: () => void;
}

export function FeedbackKPICards({ summary, onReviewsSubmittedClick, onPendingReviewsClick }: FeedbackKPICardsProps) {
  const totalRequests = summary?.totalReviewRequests || 0;
  const completedReviews = summary?.reviewsSubmitted || 0;
  const pendingReviews = summary?.pendingReviews || 0;
  const avgRating = summary?.averageRating ? summary.averageRating.toFixed(1) : '-';

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Review Requests</p>
            <Send className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{totalRequests}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card 
        className={onReviewsSubmittedClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""} 
        onClick={onReviewsSubmittedClick}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Reviews Submitted</p>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{completedReviews}</span>
          </div>
        </CardContent>
      </Card>

      <Card 
        className={onPendingReviewsClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""} 
        onClick={onPendingReviewsClick}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{pendingReviews}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
            <Star className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{avgRating !== '-' ? `${avgRating} ★` : '-'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
