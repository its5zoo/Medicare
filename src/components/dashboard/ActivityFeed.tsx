import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bell,
  CalendarCheck,
  ClipboardList,
  Pill,
  UserPlus,
} from 'lucide-react'
import type { ActivityFeedItem } from '@/api/types'
import { cn } from '@/lib/utils'
import { humanizeRelativeTime } from '@/lib/humanizer'

type ActivityIconConfig = {
  icon: typeof UserPlus
  color: string
}

function getActivityIcon(type: string, title: string): ActivityIconConfig {
  const normalized = `${type} ${title}`.toLowerCase()

  if (normalized.includes('registration') || normalized.includes('registered')) {
    return { icon: UserPlus, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' }
  }
  if (normalized.includes('consultation')) {
    return {
      icon: ClipboardList,
      color: normalized.includes('completed')
        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
        : 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    }
  }
  if (normalized.includes('prescription') || normalized.includes('medicine')) {
    return { icon: Pill, color: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400' }
  }
  if (normalized.includes('follow')) {
    return {
      icon: CalendarCheck,
      color: normalized.includes('completed')
        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
        : 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    }
  }
  if (normalized.includes('reminder')) {
    return { icon: Bell, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' }
  }

  return { icon: ClipboardList, color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' }
}

function formatRelativeTime(timestamp: string): string {
  return humanizeRelativeTime(timestamp)
}

interface ActivityFeedProps {
  activities: ActivityFeedItem[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-0 max-h-[420px] overflow-y-auto hide-scrollbar md:max-h-none md:overflow-visible pr-1 md:pr-0">
      {activities.map((activity, index) => {
        const config = getActivityIcon(activity.type, activity.title)
        const Icon = config.icon
        const isLast = index === activities.length - 1

        return (
          <motion.div
            key={`${activity.createdAt}-${activity.title}-${index}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-3 pb-4 md:gap-4 md:pb-6"
          >
            {!isLast && (
              <div className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-border md:left-[19px] md:top-10 md:h-[calc(100%-16px)]" />
            )}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl md:h-10 md:w-10',
                config.color
              )}
            >
              <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5 md:pt-1">
              <div className="flex items-start justify-between gap-2">
                {activity.patientCode ? (
                  <button
                    type="button"
                    className="text-left text-sm font-medium hover:underline focus:outline-none line-clamp-2 break-words"
                    onClick={() => navigate(`/patients/${activity.patientCode}`)}
                  >
                    {activity.title}
                  </button>
                ) : (
                  <p className="text-sm font-medium line-clamp-2 break-words">{activity.title}</p>
                )}
                <span className="shrink-0 text-[10px] text-muted-foreground md:text-xs">
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 break-words md:text-sm">{activity.description}</p>
              {activity.patientCode && (
                <p className="mt-0.5 text-[10px] text-muted-foreground/70 md:text-xs">{activity.patientCode}</p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
