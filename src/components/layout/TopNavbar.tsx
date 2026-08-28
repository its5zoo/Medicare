import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Loader2, LogOut, Menu, Moon, Plus, Sun, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlobalPatientSearch } from '@/components/search/GlobalPatientSearch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTheme } from '@/contexts/ThemeContext'
import { useDashboard } from '@/hooks/useDashboard'
import { useAuth } from '@/auth/useAuth'

export function TopNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const { data, isLoading } = useDashboard()
  const { logout } = useAuth()

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setLogoutError(null)
    try {
      const response = await logout()
      if (!response.success) {
        throw new Error(response.error?.message || 'Logout failed')
      }
      setIsLogoutDialogOpen(false)
    } catch (err: any) {
      setIsLoggingOut(false)
      setLogoutError('Failed to logout. Please try again.')
      setTimeout(() => setLogoutError(null), 5000)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border glass px-4 sm:gap-4 sm:px-6">
        <Button variant="ghost" size="icon" className="lg:hidden shrink-0 min-h-[44px] min-w-[44px]" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        <GlobalPatientSearch
          patientSearchIndex={data?.patientSearchIndex}
          isIndexLoading={isLoading}
        />

        <div className="flex items-center gap-2 [[data-sidebar-expanded=true]_&]:ml-auto [[data-sidebar-expanded=true]_&]:gap-4 [[data-sidebar-expanded=false]_&]:ml-auto [[data-sidebar-expanded=false]_&]:gap-6 [[data-sidebar-expanded=false]_&]:pr-4">
          <Button
            variant="gradient"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => navigate('/registration')}
          >
            <Plus className="h-4 w-4" />
            Quick Action
          </Button>

          <div className="hidden items-center gap-2 rounded-xl border border-border px-3 py-1.5 sm:flex">
            {isDark ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
            <Switch checked={isDark} onCheckedChange={toggleTheme} />
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-muted/60 transition-colors cursor-pointer min-h-[44px] min-w-[44px]">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AM</AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium leading-none">Admin Manager</p>
                  <p className="text-xs text-muted-foreground">Clinic Manager</p>
                </div>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 w-48 rounded-2xl border border-border bg-card p-1 shadow-xl"
              >
                <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted/60">
                  <User className="h-4 w-4" /> Profile
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted/60"
                  onClick={() => navigate('/settings')}
                >
                  Settings
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 focus:bg-red-50 dark:focus:bg-red-950/50"
                  onClick={() => setIsLogoutDialogOpen(true)}
                >
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      <Dialog open={isLogoutDialogOpen} onOpenChange={(open) => !isLoggingOut && setIsLogoutDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full-screen logout loading overlay */}
      {isLoggingOut && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
          aria-busy="true"
          role="alert"
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-6" />
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Logging out securely...</h2>
          <p className="mt-2 text-muted-foreground">Please wait while we clear your session.</p>
        </div>
      )}

      {/* Error Toast */}
      {logoutError && (
        <div className="fixed bottom-4 right-4 z-[10000] rounded-lg bg-red-600 px-4 py-3 text-white shadow-lg animate-in fade-in slide-in-from-bottom-4">
          <p className="text-sm font-medium">{logoutError}</p>
        </div>
      )}
    </>
  )
}
