import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  LayoutDashboard,
  Pill,
  Settings,
  Stethoscope,
  UserPlus,
  Users,
  Star,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  path?: string
  children?: { label: string; path: string }[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  {
    label: 'Registration',
    icon: UserPlus,
    children: [{ label: 'New Registration', path: '/registration' }],
  },
  {
    label: 'Consultation',
    icon: Stethoscope,
    path: '/consultation',
  },
  {
    label: 'Patients',
    icon: Users,
    children: [
      { label: 'All Patients', path: '/patients' },
      { label: 'Active Patients', path: '/patients/active' },
    ],
  },
  {
    label: 'Medicine',
    icon: Pill,
    children: [
      { label: 'Active Prescriptions', path: '/prescriptions/active' },
      { label: 'Completed Prescriptions', path: '/prescriptions/completed' },
    ],
  },
  {
    label: 'Follow-Up',
    icon: CalendarClock,
    children: [
      { label: "Today's Follow-Ups", path: '/follow-ups/today' },
      { label: 'Upcoming', path: '/follow-ups/upcoming' },
      { label: 'Missed', path: '/follow-ups/missed' },
      { label: 'Completed', path: '/follow-ups/completed' },
    ],
  },
  {
    label: 'Feedback',
    icon: Star,
    children: [
      { label: 'All Reviews', path: '/feedback/reviews' },
      { label: 'Submitted Reviews', path: '/feedback/submitted' },
    ],
  },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Settings', icon: Settings, path: '/settings' },
]

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggle: () => void
  onMobileClose: () => void
}

export function Sidebar({ collapsed, mobileOpen, onToggle, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Registration: true,
    Patients: true,
    Medicine: true,
    'Follow-Up': true,
    Feedback: true,
  })

  const toggleExpand = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (path: string) => location.pathname === path

  const isGroupActive = (item: NavItem) => {
    if (item.path && isActive(item.path)) return true
    return item.children?.some((c) => isActive(c.path)) ?? false
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar',
        'max-lg:transition-transform max-lg:duration-300',
        mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
        'lg:translate-x-0'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 overflow-hidden"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <ClipboardList className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold leading-tight text-primary">Medicure</p>
                <p className="truncate text-xs text-muted-foreground">Healthcare CRM</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const hasChildren = item.children && item.children.length > 0
          const groupActive = isGroupActive(item)

          if (!hasChildren && item.path) {
            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            )
          }

          return (
            <div key={item.label}>
              <button
                onClick={() => !collapsed && toggleExpand(item.label)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer',
                  groupActive
                    ? 'bg-primary/5 text-primary'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        expanded[item.label] && 'rotate-180'
                      )}
                    />
                  </>
                )}
              </button>
              {!collapsed && expanded[item.label] && item.children && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      onClick={onMobileClose}
                      className={cn(
                        'block rounded-lg px-3 py-2 text-sm transition-all',
                        isActive(child.path)
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      )}
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-border p-4">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-3">
            <p className="text-xs font-medium text-primary">Premium Plan</p>
            <p className="mt-1 text-xs text-muted-foreground">Enterprise clinic management</p>
          </div>
        </div>
      )}
    </motion.aside>
    </>
  )
}
