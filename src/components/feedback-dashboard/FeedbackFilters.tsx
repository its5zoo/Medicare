import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FeedbackFiltersProps {
  mode?: 'all' | 'submitted';
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  ratingFilter: string;
  onRatingFilterChange: (val: string) => void;
  doctorFilter: string;
  onDoctorFilterChange: (val: string) => void;
  timeFilter: string;
  onTimeFilterChange: (val: string) => void;
  journeyFilter?: string;
  onJourneyFilterChange?: (val: string) => void;
  availableDoctors: string[];
}

export function FeedbackFilters({
  mode = 'all',
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  ratingFilter,
  onRatingFilterChange,
  journeyFilter,
  onJourneyFilterChange,
  doctorFilter,
  onDoctorFilterChange,
  timeFilter,
  onTimeFilterChange,
  availableDoctors,
}: FeedbackFiltersProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4 flex flex-col gap-3 sm:flex-row flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search feedback ID, patient name, phone..."
            className="pl-10 w-full"
          />
        </div>

        {mode === 'all' && (
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Statuses">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        )}

        {mode === 'submitted' && onJourneyFilterChange && journeyFilter !== undefined && (
          <Select value={journeyFilter} onValueChange={onJourneyFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Review Journey" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Journeys">All Journeys</SelectItem>
              <SelectItem value="Public Review">Public Review</SelectItem>
              <SelectItem value="Internal Feedback">Internal Feedback</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select value={ratingFilter} onValueChange={onRatingFilterChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Ratings">All Ratings</SelectItem>
            <SelectItem value="5 Stars">5 Stars</SelectItem>
            <SelectItem value="4 Stars">4 Stars</SelectItem>
            <SelectItem value="3 Stars">3 Stars</SelectItem>
            <SelectItem value="2 Stars">2 Stars</SelectItem>
            <SelectItem value="1 Star">1 Star</SelectItem>
            <SelectItem value="4-5 Stars">4–5 Stars</SelectItem>
            <SelectItem value="1-3 Stars">1–3 Stars</SelectItem>
            <SelectItem value="No Rating">No Rating</SelectItem>
          </SelectContent>
        </Select>

        <Select value={doctorFilter} onValueChange={onDoctorFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Doctors">All Doctors</SelectItem>
            {availableDoctors.map((doc) => (
              <SelectItem key={doc} value={doc}>
                {doc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeFilter} onValueChange={onTimeFilterChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Time">All Time</SelectItem>
            <SelectItem value="Today">Today</SelectItem>
            <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
            <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
