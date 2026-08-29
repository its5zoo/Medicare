import { UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { WorkflowModal } from '@/components/workflow/WorkflowModal'
import { PageHeader } from '@/components/shared/PageHeader'
import { TransactionResultCard } from '@/components/shared/TransactionResultCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { REGISTRATION_WORKFLOW_STEPS, useRegistration } from '@/hooks/useRegistration'
import { cn } from '@/lib/utils'

export function RegistrationPage() {
  const navigate = useNavigate()
  const {
    form,
    errors,
    isValid,
    updateField,
    markTouched,
    setTouchedAll,
    submit,
    resetForm,
    isRunning,
    success,
    error,
    timeoutNotice,
    lastPatientCode,
  } = useRegistration()

  const [genderOpen, setGenderOpen] = useState(false)
  const [doctorOpen, setDoctorOpen] = useState(false)

  const allDoctorNames = ['Rizwana Barkat', 'Muzammil Barkat']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouchedAll()
    submit()
  }

  useEffect(() => {
    if (window.innerWidth < 768) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const hasOpenModals = document.querySelector('[role="dialog"], [role="menu"]') !== null
      const activeElement = document.activeElement as HTMLElement | null
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable ||
        activeElement.getAttribute('role') === 'combobox'
      )

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

      if (!isInputFocused && !hasOpenModals && !genderOpen && !doctorOpen) {
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && /[a-zA-Z0-9]/.test(e.key)) {
          e.preventDefault()
          const fullNameInput = document.getElementById('fullName') as HTMLInputElement | null
          if (fullNameInput) {
            fullNameInput.focus()
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(fullNameInput, fullNameInput.value + e.key)
              fullNameInput.dispatchEvent(new Event('input', { bubbles: true }))
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [genderOpen, doctorOpen])

  if (success) {
    return (
      <TransactionResultCard
        variant="success"
        title={success.title}
        lines={success.lines}
        primaryAction={{
          label: 'Create Consultation',
          onClick: () => {
            if (lastPatientCode) {
              navigate(`/consultation/${lastPatientCode}`)
            }
          },
        }}
        secondaryAction={{ label: 'Register Another Patient', onClick: resetForm }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl pb-12 md:pb-0">
      <PageHeader
        title="New Registration"
        description="Register a new patient to the clinic management system."
      />

      {error && !error.isTimeout && (
        <div className="mb-6 rounded-2xl border border-danger/30 bg-danger/5 p-4">
          <p className="font-semibold text-danger">{error.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        </div>
      )}

      {timeoutNotice && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="font-semibold text-amber-700 dark:text-amber-400">
            Processing Taking Longer Than Expected
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll notify you if the workflow completes.
          </p>
        </div>
      )}

      <WorkflowModal
        open={isRunning}
        steps={[...REGISTRATION_WORKFLOW_STEPS]}
        title="Registering Patient"
      />

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                onBlur={() => markTouched('fullName')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    document.getElementById('age')?.focus()
                  }
                }}
                error={!!errors.fullName}
                placeholder="Enter patient's full name"
                className="mt-1.5"
                disabled={isRunning}
              />
              {errors.fullName && <p className="mt-1 text-xs text-danger">{errors.fullName}</p>}
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={form.age}
                onChange={(e) => updateField('age', e.target.value)}
                onBlur={() => markTouched('age')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    setGenderOpen(true)
                  }
                }}
                error={!!errors.age}
                placeholder="Age"
                className="mt-1.5"
                disabled={isRunning}
              />
              {errors.age && <p className="mt-1 text-xs text-danger">{errors.age}</p>}
            </div>
            <div>
              <Label>Gender</Label>
              <Select
                open={genderOpen}
                onOpenChange={setGenderOpen}
                value={form.gender}
                onValueChange={(v) => {
                  updateField('gender', v)
                }}
                disabled={isRunning}
              >
                <SelectTrigger className={cn('mt-1.5', errors.gender && 'border-danger')}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent onCloseAutoFocus={(e) => {
                  e.preventDefault()
                  document.getElementById('whatsapp')?.focus()
                }}>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="mt-1 text-xs text-danger">{errors.gender}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact & Assignment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                value={form.whatsapp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                  updateField('whatsapp', val)
                }}
                onBlur={() => markTouched('whatsapp')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    setDoctorOpen(true)
                  }
                }}
                error={!!errors.whatsapp}
                placeholder="10-digit number"
                className="mt-1.5"
                disabled={isRunning}
              />
              {errors.whatsapp && <p className="mt-1 text-xs text-danger">{errors.whatsapp}</p>}
            </div>
            <div>
              <Label>Assigned Doctor</Label>
              <Select
                open={doctorOpen}
                onOpenChange={setDoctorOpen}
                value={form.doctorName}
                onValueChange={(v) => {
                  updateField('doctorName', v)
                }}
                disabled={isRunning}
              >
                <SelectTrigger className={cn('mt-1.5', errors.doctorName && 'border-danger')}>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent onCloseAutoFocus={(e) => {
                  e.preventDefault()
                  document.getElementById('address')?.focus()
                }}>
                  {allDoctorNames.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.doctorName && (
                <p className="mt-1 text-xs text-danger">{errors.doctorName}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                onBlur={() => markTouched('address')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    document.getElementById('registerBtn')?.focus()
                  }
                }}
                error={!!errors.address}
                placeholder="Full address"
                className="mt-1.5"
                disabled={isRunning}
              />
              {errors.address && <p className="mt-1 text-xs text-danger">{errors.address}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" disabled={isRunning}>Cancel</Button>
          <Button
            id="registerBtn"
            type="submit"
            variant="gradient"
            size="lg"
            disabled={!isValid || isRunning}
          >
            Register Patient
          </Button>
        </div>
      </form>
    </div>
  )
}
