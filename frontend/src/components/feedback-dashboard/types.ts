export type FeedbackStatus = 'Pending' | 'Completed';

export interface ReviewSummary {
  totalReviewRequests: number;
  reviewsSubmitted: number;
  pendingReviews: number;
  averageRating: number;
}

export interface DashboardReview {
  feedbackId: string;
  patientRecordId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  phone: string;
  visitDate: string;
  submittedAt: string | null;
  submittedDate: string | null;
  submittedTime: string | null;
  status: 'Completed' | 'Pending';
  rating: number | null;
  reasons: string[];
  comment: string;
  googleRedirected: boolean;
  reviewLinkOpened: boolean;
  whatsappSent: boolean;
  snapshotVersion: string;
  generatedAt: string;
  searchText: string;
}
