import { Card, CardContent } from '@/components/ui/card';
import { FeedbackStatusBadge } from './FeedbackStatusBadge';
import { formatSubmittedAt } from './formatSubmittedAt';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DashboardReview } from './types';

interface FeedbackTableProps {
  mode?: 'all' | 'submitted';
  data: DashboardReview[];
  onRowClick: (review: DashboardReview) => void;
  onResendClick?: (e: React.MouseEvent, review: DashboardReview) => void;
}

export function FeedbackTable({ mode = 'all', data, onRowClick, onResendClick }: FeedbackTableProps) {
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
    <Card className="hidden md:block">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Doctor</th>
                <th className="px-6 py-4 font-medium">Submitted Date</th>
                {mode === 'all' ? (
                  <th className="px-6 py-4 font-medium">Status</th>
                ) : (
                  <th className="px-6 py-4 font-medium">Review Journey</th>
                )}
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.feedbackId}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => onRowClick(row)}
                >
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!row.patientId) return;
                        navigate(`/patients/${row.patientId}`);
                      }}
                      className="text-left font-medium hover:underline focus:outline-none block"
                    >
                      {displayValue(row.patientName)}
                    </button>
                    <div className="text-xs text-muted-foreground leading-tight">
                      {displayValue(row.patientId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {displayValue(row.doctorName)}
                  </td>
                  <td className="px-6 py-4">
                    {(() => { const fmt = formatSubmittedAt(row.submittedAt); return (<><div className="text-foreground">{fmt.date}</div><div className="text-xs text-muted-foreground">{fmt.time}</div></>); })()}
                  </td>
                  <td className="px-6 py-4">
                    {mode === 'all' ? (
                      <FeedbackStatusBadge status={row.status} />
                    ) : (
                      renderJourneyBadge(row.googleRedirected)
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {renderStars(row.rating)}
                  </td>
                  <td className="px-6 py-4">
                    {mode === 'all' && onResendClick ? (
                      <button
                        type="button"
                        disabled={!row.patientRecordId}
                        className="inline-flex items-center justify-center whitespace-nowrap text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onResendClick) onResendClick(e, row);
                        }}
                      >
                        Resend Link
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center whitespace-nowrap text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 px-3 rounded-full border border-border bg-muted/20 text-foreground hover:bg-muted/50 transition shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick(row);
                        }}
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
