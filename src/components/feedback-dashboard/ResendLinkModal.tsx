import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { DashboardReview } from './types';

interface ResendLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: DashboardReview | null;
  onConfirm: () => void;
}

export function ResendLinkModal({ open, onOpenChange, review, onConfirm }: ResendLinkModalProps) {
  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resend Feedback Link</DialogTitle>
          <DialogDescription>
            Are you sure you want to resend the feedback link to this patient?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-sm text-muted-foreground">
          <p>
            <strong>Patient:</strong> {review.patientName} ({review.patientId})
          </p>
          <p>
            <strong>Phone:</strong> {review.phone}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
