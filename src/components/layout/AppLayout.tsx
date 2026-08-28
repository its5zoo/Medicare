import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { TransactionNotificationStack } from '@/components/TransactionNotification'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <TransactionNotificationStack />
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        data-sidebar-expanded={!sidebarCollapsed}
        className={cn(
          'transition-all duration-250 max-lg:ml-0',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        )}
      >
        <TopNavbar onMenuClick={() => setMobileOpen(true)} />
        <main data-sidebar-expanded={!sidebarCollapsed} className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
