import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { WorkspacePatientStatusBadge } from '@/components/patients/PatientStatusBadge'
import { Button } from '@/components/ui/button'
import type { PatientRecord } from '@/api/types'
import { formatDate } from '@/lib/utils'

interface PatientRowProps {
  row: PatientRecord
}

export function PatientRow({ row }: PatientRowProps) {
  const navigate = useNavigate()

  const displayValue = (val: string | null | undefined) => {
    if (!val || val.trim() === '') return '-'
    return val
  }

  return (
    <tr
      className="group cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/30"
      onClick={() => navigate(`/patients/${row.patientId}`)}
    >
      <td className="px-4 py-3.5 font-mono text-xs font-medium text-primary [[data-sidebar-expanded=true]_&]:text-[11px] [[data-sidebar-expanded=true]_&]:whitespace-nowrap lg:max-w-[120px]">{row.patientId}</td>
      <td className="px-4 py-3.5">
        <p className="font-medium">{row.patientName}</p>
      </td>
      <td className="hidden px-4 py-3.5 text-muted-foreground md:table-cell [[data-sidebar-expanded=true]_&]:text-[13px] [[data-sidebar-expanded=true]_&]:whitespace-nowrap">
        {displayValue(row.phone)}
      </td>
      <td className="hidden px-4 py-3.5 text-muted-foreground lg:table-cell">
        {displayValue(row.assignedDoctor)}
      </td>
      <td className="px-4 py-3.5 [[data-sidebar-expanded=true]_&]:whitespace-nowrap">
        {row.activeMedicineCount > 0 ? (
          <span className="text-sm font-medium [[data-sidebar-expanded=true]_&]:text-xs">
            {row.activeMedicineCount} {row.activeMedicineCount === 1 ? 'Active Medicine' : 'Active Medicines'}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground [[data-sidebar-expanded=true]_&]:text-[11px]">No Active Medicines</span>
        )}
      </td>
      <td className="hidden px-4 py-3.5 sm:table-cell">
        {row.nextFollowupDate ? (
          <span className="text-sm font-medium">
            {formatDate(row.nextFollowupDate)} {row.nextFollowupTime ? `· ${row.nextFollowupTime}` : ''}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <WorkspacePatientStatusBadge status={row.status} />
      </td>
      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
        <Button
          size="sm"
          variant="outline"
          className="gap-1 opacity-80 group-hover:opacity-100 transition-all hover:border-primary hover:bg-primary/5"
          onClick={() => navigate(`/patients/${row.patientId}`)}
        >
          Profile
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </td>
    </tr>
  )
}
