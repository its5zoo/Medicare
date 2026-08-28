import type { FeedbackStatus } from './types';

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  if (status === 'Completed') {
    return (
      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
      Pending
    </span>
  );
}
