import { Card, CardContent } from '@/components/ui/card';
import { Star, MessageSquare, ThumbsUp, Link } from 'lucide-react';
import type { DashboardReview } from './types';

interface SubmittedKPICardsProps {
  data: DashboardReview[];
  onTotalSubmittedClick?: () => void;
  onHighRatingsClick?: () => void;
  onPublicJourneyClick?: () => void;
}

export function SubmittedKPICards({ 
  data, 
  onTotalSubmittedClick, 
  onHighRatingsClick, 
  onPublicJourneyClick 
}: SubmittedKPICardsProps) {
  const totalSubmitted = data.length;
  const highRatings = data.filter((r) => r.rating !== null && r.rating >= 4).length;
  
  const publicJourneyCount = data.filter((r) => r.googleRedirected).length;
  const publicJourneyPct = totalSubmitted > 0 ? Math.round((publicJourneyCount / totalSubmitted) * 100) : 0;

  const validRatings = data.filter((r) => r.rating !== null).map((r) => r.rating as number);
  const avgRating = validRatings.length > 0
    ? (validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length).toFixed(1)
    : '-';

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card 
        className={onTotalSubmittedClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""} 
        onClick={onTotalSubmittedClick}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Submitted</p>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{totalSubmitted}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card 
        className={onHighRatingsClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""} 
        onClick={onHighRatingsClick}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">High Ratings (4-5 ★)</p>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{highRatings}</span>
          </div>
        </CardContent>
      </Card>

      <Card 
        className={onPublicJourneyClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""} 
        onClick={onPublicJourneyClick}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Public Review Journey</p>
            <Link className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{publicJourneyCount}</span>
            <span className="text-sm font-medium text-muted-foreground ml-1">
              ({publicJourneyPct}%)
            </span>
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
