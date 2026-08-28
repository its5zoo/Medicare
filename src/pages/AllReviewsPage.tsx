import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/patient-profile/EmptyState';
import { FeedbackKPICards } from '@/components/feedback-dashboard/FeedbackKPICards';
import { FeedbackFilters } from '@/components/feedback-dashboard/FeedbackFilters';
import { FeedbackTable } from '@/components/feedback-dashboard/FeedbackTable';
import { FeedbackMobileList } from '@/components/feedback-dashboard/FeedbackMobileList';
import { ReviewDetailModal } from '@/components/feedback-dashboard/ReviewDetailModal';
import { ResendLinkModal } from '@/components/feedback-dashboard/ResendLinkModal';

import { useDashboard } from '@/hooks/useDashboard';
import { DashboardContentSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { parseSubmittedAtDate } from '@/components/feedback-dashboard/formatSubmittedAt';
import type { DashboardReview } from '@/components/feedback-dashboard/types';

export function AllReviewsPage() {
  // ─── State ───
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [ratingFilter, setRatingFilter] = useState('All Ratings');
  const [doctorFilter, setDoctorFilter] = useState('All Doctors');
  const [timeFilter, setTimeFilter] = useState('All Time');

  const [selectedReview, setSelectedReview] = useState<DashboardReview | null>(null);
  const [resendTarget, setResendTarget] = useState<DashboardReview | null>(null);

  const { data, isLoading } = useDashboard();

  // ─── Data Derivation ───
  const baseDataset = data?.allReviews || [];
  const summary = data?.reviewSummary;
  
  const availableDoctors = useMemo(() => {
    const docs = new Set(baseDataset.map(r => r.doctorName));
    return Array.from(docs).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [baseDataset]);

  // ─── Filtering Logic ───
  const filteredRows = useMemo(() => {
    let result = baseDataset;

    // 1. Search (real-time, no debounce needed for small local data)
    if (search.trim() !== '') {
      const query = search.trim().toLowerCase();
      result = result.filter((r) => r.searchText.toLowerCase().includes(query));
    }

    // 2. Status
    if (statusFilter !== 'All Statuses') {
      result = result.filter((r) => r.status === statusFilter);
    }

    // 3. Rating
    if (ratingFilter !== 'All Ratings') {
      if (ratingFilter === 'No Rating') {
        result = result.filter((r) => r.rating === null);
      } else if (ratingFilter === '4-5 Stars') {
        result = result.filter((r) => r.rating !== null && r.rating >= 4);
      } else if (ratingFilter === '1-3 Stars') {
        result = result.filter((r) => r.rating !== null && r.rating <= 3 && r.rating >= 1);
      } else {
        const targetRating = parseInt(ratingFilter.split(' ')[0], 10);
        result = result.filter((r) => r.rating === targetRating);
      }
    }

    // 4. Doctor
    if (doctorFilter !== 'All Doctors') {
      result = result.filter((r) => r.doctorName === doctorFilter);
    }

    // 5. Time
    if (timeFilter !== 'All Time') {
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      result = result.filter((r) => {
        const regDate = parseSubmittedAtDate(r.submittedAt);
        if (!regDate) return false;

        const diffTime = todayDate.getTime() - regDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (timeFilter === 'Today') return diffDays === 0;
        if (timeFilter === 'Last 7 Days') return diffDays >= 0 && diffDays <= 7;
        if (timeFilter === 'Last 30 Days') return diffDays >= 0 && diffDays <= 30;

        return true;
      });
    }

    return result;
  }, [baseDataset, search, statusFilter, ratingFilter, doctorFilter, timeFilter]);

  // ─── Handlers ───
  const handleResendClick = (e: React.MouseEvent, review: DashboardReview) => {
    e.stopPropagation(); // Prevent opening the detail modal
    setResendTarget(review);
  };

  const executeResend = async () => {
    if (resendTarget) {
      try {
        const payload = {
          patient_record_id: resendTarget.patientRecordId,
          patient_id: resendTarget.patientId,
          patient_name: resendTarget.patientName,
          doctor_name: resendTarget.doctorName,
          phone: resendTarget.phone,
          visit_date: resendTarget.visitDate
        };
        await fetch('https://n8n-latest-t6cw.onrender.com/webhook/review-link-generator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        alert('Unable to resend review link.\nPlease try again.');
      }
    }
    setResendTarget(null);
  };

  if (isLoading) {
    return <DashboardContentSkeleton />;
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="All Reviews"
        description="Track patient feedback requests, submissions, ratings, and review activity."
      />

      <FeedbackKPICards 
        summary={summary} 
        onReviewsSubmittedClick={() => {
          setSearch('');
          setRatingFilter('All Ratings');
          setDoctorFilter('All Doctors');
          setTimeFilter('All Time');
          setStatusFilter('Completed');
        }}
        onPendingReviewsClick={() => {
          setSearch('');
          setRatingFilter('All Ratings');
          setDoctorFilter('All Doctors');
          setTimeFilter('All Time');
          setStatusFilter('Pending');
        }}
      />

      <FeedbackFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        ratingFilter={ratingFilter}
        onRatingFilterChange={setRatingFilter}
        doctorFilter={doctorFilter}
        onDoctorFilterChange={setDoctorFilter}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        availableDoctors={availableDoctors}
      />

      {filteredRows.length === 0 ? (
        <div className="py-12">
          <EmptyState title="No matching reviews found." />
        </div>
      ) : (
        <>
          <FeedbackTable 
            data={filteredRows} 
            onRowClick={setSelectedReview} 
            onResendClick={handleResendClick} 
          />
          <FeedbackMobileList 
            data={filteredRows} 
            onRowClick={setSelectedReview} 
            onResendClick={handleResendClick} 
          />
        </>
      )}

      {/* Modals */}
      <ReviewDetailModal
        open={!!selectedReview}
        onOpenChange={(open) => !open && setSelectedReview(null)}
        review={selectedReview}
      />

      <ResendLinkModal
        open={!!resendTarget}
        onOpenChange={(open) => !open && setResendTarget(null)}
        review={resendTarget}
        onConfirm={executeResend}
      />
    </div>
  );
}
