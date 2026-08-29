import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatSubmittedAt } from './formatSubmittedAt';
import { formatDate } from '@/lib/utils';
import { FeedbackStatusBadge } from './FeedbackStatusBadge';
import { Star } from 'lucide-react';
import type { DashboardReview } from './types';

interface ReviewDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: DashboardReview | null;
}

export function ReviewDetailModal({ open, onOpenChange, review }: ReviewDetailModalProps) {
  if (!review) return null;

  const displayValue = (val: string | null | undefined) => {
    if (!val || val.trim() === '') return '-';
    return val;
  };

  const renderStars = (rating: number | null) => {
    if (rating === null) {
      return (
        <div className="flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="h-4 w-4 text-muted-foreground/30" />
          ))}
        </div>
      );
    }
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl">Review Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Patient Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">
              Patient Information
            </h3>
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 bg-muted/20">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Patient Name</p>
                <p className="text-sm font-medium break-words whitespace-pre-wrap">{displayValue(review.patientName)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Patient ID</p>
                <p className="text-sm font-medium break-words whitespace-pre-wrap">{displayValue(review.patientId)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                <p className="text-sm font-medium break-words whitespace-pre-wrap">{displayValue(review.phone)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Doctor</p>
                <p className="text-sm font-medium break-words whitespace-pre-wrap">{displayValue(review.doctorName)}</p>
              </div>
            </div>
          </div>

          {/* Feedback Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">
              Feedback Information
            </h3>
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 bg-muted/20">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <div>
                  <FeedbackStatusBadge status={review.status} />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Rating</p>
                <div>
                  {renderStars(review.rating)}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Submitted Date</p>
                {(() => { const fmt = formatSubmittedAt(review.submittedAt); return (<><p className="text-sm font-medium">{fmt.date}</p><p className="text-xs text-muted-foreground">{fmt.time}</p></>); })()}
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Reasons</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {review.reasons && review.reasons.length > 0 ? (
                    review.reasons.map((r, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md break-words whitespace-pre-wrap">
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-medium">-</span>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Comment</p>
                <p className="text-sm font-medium break-words whitespace-pre-wrap">
                  {displayValue(review.comment)}
                </p>
              </div>
            </div>
          </div>

          {/* Resolution Data */}
          {review.status === 'Completed' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">
                Resolution Data
              </h3>
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 bg-muted/20">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Review Outcome</p>
                  <p className="text-sm font-medium">
                    {review.rating !== null && review.rating >= 4 ? 'Positive' : 'Improvement Needed'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Review Journey</p>
                  <p className="text-sm font-medium">
                    {review.rating !== null && review.rating >= 4 ? 'Public Review' : 'Internal Feedback'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Google Redirect Status</p>
                  <p className="text-sm font-medium font-mono">
                    {review.googleRedirected ? 'true' : 'false'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Audit Metadata */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">
              Audit Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4 bg-muted/20">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Feedback ID</p>
                <p className="text-sm font-medium break-words whitespace-pre-wrap">{displayValue(review.feedbackId)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Snapshot Version</p>
                <p className="text-sm font-medium">v{review.snapshotVersion}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Generated At</p>
                <p className="text-sm font-medium">{displayValue(formatDate(review.generatedAt.split('T')[0]))}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
