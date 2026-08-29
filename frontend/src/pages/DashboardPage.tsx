import { motion } from 'framer-motion'
import { Search, Stethoscope, UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { ConsultationPending } from '@/components/dashboard/ConsultationPending'
import {
  DashboardContentSkeleton,
  StatsCardsSkeleton,
} from '@/components/dashboard/DashboardSkeleton'
import { DashboardError } from '@/components/dashboard/DashboardError'
import { RecentRegistrations } from '@/components/dashboard/RecentRegistrations'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { LiveBedOccupancy } from '@/components/dashboard/LiveBedOccupancy'
import { PageHeader } from '@/components/shared/PageHeader'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboard } from '@/hooks/useDashboard'
import { CompleteFollowUpModal } from '@/components/patient-profile/modals/CompleteFollowUpModal'
import { RescheduleFollowUpModal } from '@/components/patient-profile/modals/RescheduleFollowUpModal'
import { TransactionModals } from '@/components/workflow/TransactionModals'
import { useCompleteFollowUp, COMPLETE_FOLLOW_UP_WORKFLOW_STEPS } from '@/hooks/useCompleteFollowUp'
import { useRescheduleFollowUp, RESCHEDULE_FOLLOW_UP_WORKFLOW_STEPS } from '@/hooks/useRescheduleFollowUp'
import type { TodayFollowupItem } from '@/api/types'
import type { PatientFollowUpRecord } from '@/data/patientProfileTypes'
import type { FollowUpStatus } from '@/data/types'

const quickActions = [
  {
    title: 'New Registration',
    description: 'Register a new patient',
    icon: UserPlus,
    path: '/registration',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'New Consultation',
    description: 'Start patient consultation',
    icon: Stethoscope,
    path: '/consultation',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    title: 'Search Patient',
    description: 'Find patient records',
    icon: Search,
    path: '/patients',
    gradient: 'from-emerald-500 to-teal-600',
  },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch, isFetching } = useDashboard()

  const [completeTarget, setCompleteTarget] = useState<TodayFollowupItem | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<TodayFollowupItem | null>(null)

  const completeHook = useCompleteFollowUp()
  const rescheduleHook = useRescheduleFollowUp()

  useEffect(() => {
    // Only apply on desktop (>= md breakpoint which is 768px in Tailwind)
    if (window.innerWidth < 768) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if a modal, dropdown, or popover is open
      // Radix typically uses role="dialog" or role="menu" or adds data-state="open" to portals
      const hasOpenModals = document.querySelector('[role="dialog"], [role="menu"]') !== null
      
      const activeElement = document.activeElement as HTMLElement | null
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable
      )

      // 1. CMD + K / CTRL + K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (hasOpenModals) return
        e.preventDefault()
        const searchInput = document.getElementById('global-patient-search-input') as HTMLInputElement | null
        if (searchInput) {
          searchInput.focus()
          setTimeout(() => searchInput.select(), 0)
        }
        return
      }

      // 2. Enter to open Quick Action
      if (e.key === 'Enter') {
        if (!isInputFocused && !hasOpenModals) {
          e.preventDefault()
          navigate('/registration')
        }
        return
      }

      // 3. Auto-focus global search on typing
      if (!isInputFocused && !hasOpenModals) {
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && /[a-zA-Z0-9]/.test(e.key)) {
          const searchInput = document.getElementById('global-patient-search-input') as HTMLInputElement | null
          if (searchInput) {
            e.preventDefault() // Prevent default so it doesn't double-type if we manually dispatch
            searchInput.focus()
            
            // In React, programmatically changing input value and triggering onChange
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(searchInput, searchInput.value + e.key)
              searchInput.dispatchEvent(new Event('input', { bubbles: true }))
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  const mapToRecord = (item: TodayFollowupItem): PatientFollowUpRecord => ({
    id: item.followupId ?? '',
    patientId: item.patientId ?? '',
    date: item.date,
    timeSlot: item.time.toLowerCase().includes('afternoon') ? 'Afternoon' : item.time.toLowerCase().includes('night') ? 'Night' : 'Morning',
    status: item.status as FollowUpStatus,
    source: 'Manual',
  })

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Clinic overview - understand your clinic status at a glance."
      />

      {isError ? (
        <DashboardError onRetry={() => refetch()} isRetrying={isFetching} />
      ) : (
        <>
          {isLoading ? <StatsCardsSkeleton /> : data ? <StatsCards cards={data.cards} /> : null}

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Link
                    to={action.path}
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 card-shadow transition-all hover:shadow-lg md:gap-4 md:p-5"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-sm md:h-12 md:w-12`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold group-hover:text-primary transition-colors">
                        {action.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {isLoading ? (
            <DashboardContentSkeleton />
          ) : data ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <RecentRegistrations registrations={data.recentRegistrations} />
                  <ConsultationPending patients={data.consultationPending} />
                  <LiveBedOccupancy />
                </div>

                <Card className="h-fit">
                  <CardHeader className="p-4 pb-3 md:p-6 md:pb-4">
                    <CardTitle className="text-base md:text-lg">Activity Feed</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                    <ActivityFeed activities={data.activityFeed} />
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : null}

          <TransactionModals transaction={completeHook} steps={[...COMPLETE_FOLLOW_UP_WORKFLOW_STEPS]} loadingTitle="Completing Follow-Up" />
          <TransactionModals transaction={rescheduleHook} steps={[...RESCHEDULE_FOLLOW_UP_WORKFLOW_STEPS]} loadingTitle="Rescheduling Follow-Up" />

          <CompleteFollowUpModal
            open={!!completeTarget}
            onOpenChange={(open) => !open && setCompleteTarget(null)}
            followUp={completeTarget ? mapToRecord(completeTarget) : null}
            onConfirm={(notes) => {
              if (completeTarget) {
                completeHook.submit(completeTarget.patientId ?? 'UNKNOWN', completeTarget.patientName, completeTarget.followupId ?? '', notes)
              }
            }}
          />

          <RescheduleFollowUpModal
            open={!!rescheduleTarget}
            onOpenChange={(open) => !open && setRescheduleTarget(null)}
            followUp={rescheduleTarget ? mapToRecord(rescheduleTarget) : null}
            onSubmit={(input) => {
              if (rescheduleTarget) {
                rescheduleHook.submit(rescheduleTarget.patientId ?? 'UNKNOWN', rescheduleTarget.patientName, input)
              }
            }}
          />
        </>
      )}
    </div>
  )
}
