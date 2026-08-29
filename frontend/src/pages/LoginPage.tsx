import {  useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import { Activity, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginPage() {
  // const navigate = useNavigate()
  const { login,  retryInitialization } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic inline validation
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    const response = await login({ username, password })

    if (response.success) {
      // Trigger the global session check. This will momentarily mount the StartupLoader,
      // and once authenticated, the useEffect above will route us to the dashboard.
      retryInitialization()
    } else {
      setIsSubmitting(false)
      // Display the normalized error message from authService
      setError(response.error?.message || 'Something went wrong. Please try again.')
    }
  }

  const handleDemoLogin = async () => {
    setUsername('admin')
    setPassword('password123')
    setError(null)
    setIsSubmitting(true)

    const response = await login({ username: 'admin', password: 'password123' })

    if (response.success) {
      retryInitialization()
    } else {
      setIsSubmitting(false)
      setError(response.error?.message || 'Something went wrong. Please try again.')
    }
  }


  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* LEFT COLUMN: Premium Branding (Hidden on Mobile) */}
      <div className="hidden w-1/2 flex-col justify-between border-r border-border bg-muted/30 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">Medicure CRM</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight mb-6">
            Modern patient management for dermatology clinics.
          </h1>
          <ul className="space-y-4 text-muted-foreground">
            {[
              'Patient Registration',
              'Consultations',
              'Follow-Ups',
              'Prescriptions',
              'Analytics',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Dermatology CRM. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: Login Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Mobile-only header since the left column is hidden */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Dermatology CRM</span>
          </div>

          <Card className="border-border/50 shadow-xl sm:p-2">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
              <CardDescription className="text-base">
                Sign in to access your dashboard and patient records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-lg bg-red-100 p-3 text-sm font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isSubmitting}
                      className="h-11"
                      autoComplete="username"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      className="h-11"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                {/* Simple Clean Demo Login Section (No Neon) */}
                <div className="pt-2">
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/60" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground font-medium">Quick Demo Access</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleDemoLogin}
                      className="w-full inline-flex items-center justify-center rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Login as Demo Admin
                    </button>
                  </div>
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Admin credentials: <span className="font-mono text-foreground">admin</span> / <span className="font-mono text-foreground">password123</span>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
