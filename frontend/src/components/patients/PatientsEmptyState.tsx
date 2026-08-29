import { UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PatientsEmptyStateProps {
  filteredEmpty: boolean
}

export function PatientsEmptyState({ filteredEmpty }: PatientsEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <UserPlus className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">
          {filteredEmpty ? 'No patients match your filters' : 'No patients found'}
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {filteredEmpty
            ? 'Try adjusting search or filters to find the patient you need.'
            : 'Register your first patient to start managing treatments.'}
        </p>
        {!filteredEmpty && (
          <Button variant="gradient" className="mt-6" asChild>
            <Link to="/registration">Create Registration</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
