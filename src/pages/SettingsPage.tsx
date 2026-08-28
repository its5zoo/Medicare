import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/contexts/ThemeContext'

export function SettingsPage() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Settings"
        description="Manage clinic preferences and account settings."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Clinic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Clinic Name</Label>
              <Input defaultValue="Automated Dermat Clinic" className="mt-1.5" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input defaultValue="+91 98765 00000" className="mt-1.5" />
            </div>
            <div>
              <Label>Email</Label>
              <Input defaultValue="admin@dematclinic.in" className="mt-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Toggle dark theme</p>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              'WhatsApp reminders for follow-ups',
              'New patient registration alerts',
              'Prescription expiry notifications',
            ].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <p className="text-sm">{item}</p>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="gradient">Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
