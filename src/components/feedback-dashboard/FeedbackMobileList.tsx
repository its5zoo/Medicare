import { Card, CardContent } from '@/components/ui/card';
import { FeedbackStatusBadge } from './FeedbackStatusBadge';
import { formatSubmittedAt } from './formatSubmittedAt';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DashboardReview } from './types';

interface FeedbackMobileListProps {
  mode?: 'all' | 'submitted';
  data: DashboardReview[];
  onRowClick: (review: DashboardReview) => void;
  onResendClick?: (e: React.MouseEvent, review: DashboardReview) => void;
}

export function FeedbackMobileList({ mode = 'all', data, onRowClick, onResendClick }: FeedbackMobileListProps) {
  const navigate = useNavigate();

  const displayValue = (val: string | null | undefined) => {
    if (!val || val.trim() === '') return '-';
    return val;
  };

  const renderStars = (rating: number | null) => {
    if (rating === null) {
      return (
        <div className="flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="h-3 w-3 text-muted-foreground/30" />
          ))}
        </div>
      );
    }
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
    );
  };

  const renderJourneyBadge = (googleRedirected: boolean) => {
    if (googleRedirected) {
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
          Public Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
        Internal Feedback
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {data.map((row) => (
        <Card key={row.feedbackId} className="cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => onRowClick(row)}>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!row.patientId) return;
                    navigate(`/patients/${row.patientId}`);
                  }}
                  className="font-semibold text-left hover:underline focus:outline-none block"
                >
                  {displayValue(row.patientName)}
                </button>
                <p className="text-xs text-muted-foreground">{displayValue(row.patientId)}</p>
              </div>
              {mode === 'all' ? (
                <FeedbackStatusBadge status={row.status} />
              ) : (
                renderJourneyBadge(row.googleRedirected)
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Doctor</p>
                <p>{displayValue(row.doctorName)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submitted</p>
                {(() => { const fmt = formatSubmittedAt(row.submittedAt); return (<><p className="text-foreground">{fmt.date}</p><p className="text-xs text-muted-foreground">{fmt.time}</p></>); })()}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Rating:</span>
                {renderStars(row.rating)}
              </div>
              {mode === 'all' && onResendClick ? (
                <button
                  type="button"
                  disabled={!row.patientRecordId}
                  className="inline-flex items-center justify-center whitespace-nowrap text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-7 px-3 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResendClick(e, row);
                  }}
                >
                  Resend Link
                </button>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center justify-center whitespace-nowrap text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-7 px-3 rounded-full border border-border bg-muted/20 text-foreground hover:bg-muted/50 transition shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(row);
                  }}
                >
                  View Details
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
