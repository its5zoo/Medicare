import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/patient-profile/EmptyState';
import { SubmittedKPICards } from '@/components/feedback-dashboard/SubmittedKPICards';
import { FeedbackFilters } from '@/components/feedback-dashboard/FeedbackFilters';
import { FeedbackTable } from '@/components/feedback-dashboard/FeedbackTable';
import { FeedbackMobileList } from '@/components/feedback-dashboard/FeedbackMobileList';
import { ReviewDetailModal } from '@/components/feedback-dashboard/ReviewDetailModal';

import { useDashboard } from '@/hooks/useDashboard';
import { DashboardContentSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { parseSubmittedAtDate } from '@/components/feedback-dashboard/formatSubmittedAt';
import type { DashboardReview } from '@/components/feedback-dashboard/types';

export function SubmittedReviewsPage() {
  // ─── State ───
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All Ratings');
  const [journeyFilter, setJourneyFilter] = useState('All Journeys');
  const [doctorFilter, setDoctorFilter] = useState('All Doctors');
  const [timeFilter, setTimeFilter] = useState('All Time');

  const [selectedReview, setSelectedReview] = useState<DashboardReview | null>(null);

  const { data, isLoading } = useDashboard();

  // ─── Data Derivation ───
  // Hard ceiling: Only ever process Completed reviews
  const baseDataset = useMemo(() => {
    return (data?.allReviews || []).filter((r) => r.status === 'Completed');
  }, [data?.allReviews]);
  
  const availableDoctors = useMemo(() => {
    const docs = new Set(baseDataset.map(r => r.doctorName));
    return Array.from(docs).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [baseDataset]);

  // ─── Filtering Logic ───
  const filteredRows = useMemo(() => {
    let result = baseDataset;

    // 1. Search
    if (search.trim() !== '') {
      const query = search.trim().toLowerCase();
      result = result.filter((r) => r.searchText.toLowerCase().includes(query));
    }

    // 2. Rating
    if (ratingFilter !== 'All Ratings') {
      if (ratingFilter === 'No Rating') {
        result = result.filter((r) => r.rating === null);
      } else if (ratingFilter === '4-5 Stars') {
        result = result.filter((r) => r.rating !== null && r.rating >= 4);
      } else if (ratingFilter === '1-3 Stars') {
        result = result.filter((r) => r.rating !== null && r.rating >= 1 && r.rating <= 3);
      } else {
        const targetRating = parseInt(ratingFilter.split(' ')[0], 10);
        result = result.filter((r) => r.rating === targetRating);
      }
    }

    // 3. Review Journey (Google Redirect)
    if (journeyFilter !== 'All Journeys') {
      if (journeyFilter === 'Public Review') {
        result = result.filter((r) => r.googleRedirected === true);
      } else if (journeyFilter === 'Internal Feedback') {
        result = result.filter((r) => r.googleRedirected === false);
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
  }, [baseDataset, search, ratingFilter, journeyFilter, doctorFilter, timeFilter]);

  if (isLoading) {
    return <DashboardContentSkeleton />;
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Submitted Reviews"
        description="Deep dive analytics into completed patient feedback and external review conversion."
      />

      <SubmittedKPICards 
        data={baseDataset} 
        onTotalSubmittedClick={() => {
          setSearch('');
          setRatingFilter('All Ratings');
          setDoctorFilter('All Doctors');
          setJourneyFilter('All Journeys');
          setTimeFilter('All Time');
        }}
        onHighRatingsClick={() => {
          setSearch('');
          setRatingFilter('4-5 Stars');
          setDoctorFilter('All Doctors');
          setJourneyFilter('All Journeys');
          setTimeFilter('All Time');
        }}
        onPublicJourneyClick={() => {
          setSearch('');
          setRatingFilter('All Ratings');
          setDoctorFilter('All Doctors');
          setJourneyFilter('Public Review');
          setTimeFilter('All Time');
        }}
      />

      <FeedbackFilters
        mode="submitted"
        search={search}
        onSearchChange={setSearch}
        statusFilter=""
        onStatusFilterChange={() => {}}
        ratingFilter={ratingFilter}
        onRatingFilterChange={setRatingFilter}
        journeyFilter={journeyFilter}
        onJourneyFilterChange={setJourneyFilter}
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
            mode="submitted"
            data={filteredRows} 
            onRowClick={setSelectedReview} 
          />
          <FeedbackMobileList 
            mode="submitted"
            data={filteredRows} 
            onRowClick={setSelectedReview} 
          />
        </>
      )}

      {/* Modals */}
      <ReviewDetailModal
        open={!!selectedReview}
        onOpenChange={(open) => !open && setSelectedReview(null)}
        review={selectedReview}
      />
    </div>
  );
}
