import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  color?: string
  className?: string
}

export function Sparkline({ data, color = '#2563eb', className }: SparklineProps) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 80
  const height = 32
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} className={cn('overflow-visible', className)}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity={0.8}
      />
    </svg>
  )
}

interface KpiCardProps {
  label: string
  value: number | string
  trend: number
  sparkline: number[]
  icon: ReactNode
  iconBg: string
  delay?: number
  onClick?: () => void
}

export function KpiCard({ label, value, trend, sparkline, icon, iconBg, delay = 0, onClick }: KpiCardProps) {
  const isPositive = trend >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'rounded-2xl border border-border bg-card p-3 card-shadow transition-shadow hover:shadow-lg md:p-5',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl md:h-11 md:w-11', iconBg)}>
          {icon}
        </div>
        <Sparkline data={sparkline} className="hidden sm:block" />
      </div>
      <div className="mt-2 md:mt-4">
        <p className="text-xs text-muted-foreground truncate md:text-sm">{label}</p>
        <div className="mt-0.5 flex items-end gap-1.5 md:mt-1 md:gap-2">
          <span className="text-2xl font-bold tracking-tight md:text-3xl">{value}</span>
          <span
            className={cn(
              'mb-1 flex items-center gap-0.5 text-xs font-medium',
              isPositive ? 'text-emerald-600' : 'text-red-500'
            )}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}
