import { BrowserRouter, Navigate, Route, Routes, Outlet } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/auth/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PublicRoute } from '@/components/auth/PublicRoute'
import { LoginPage } from '@/pages/LoginPage'
import { AllPatientsPage } from '@/pages/AllPatientsPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { ConsultationPage } from '@/pages/ConsultationPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { FollowUpsPage } from '@/pages/FollowUpsPage'
import { PatientProfilePage } from '@/pages/PatientProfilePage'
import { PrescriptionsPage } from '@/pages/PrescriptionsPage'
import { RegistrationPage } from '@/pages/RegistrationPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { FeedbackPage } from '@/pages/FeedbackPage'
import { AllReviewsPage } from '@/pages/AllReviewsPage'
import { SubmittedReviewsPage } from '@/pages/SubmittedReviewsPage'
import { DataHealthPage } from '@/pages/DataHealthPage'
import { MedicineTrackerPage } from '@/pages/MedicineTrackerPage'
import { BedsPage } from '@/pages/BedsPage'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public feedback route - no auth required */}
          <Route path="/review/:token" element={<FeedbackPage />} />

          {/* CRM App - wrapped with AuthProvider */}
          <Route
            element={
              <AuthProvider>
                <Outlet />
              </AuthProvider>
            }
          >
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="registration" element={<RegistrationPage />} />
                <Route path="consultation" element={<ConsultationPage />} />
                <Route path="consultation/:patientId" element={<ConsultationPage />} />
                <Route path="patients" element={<AllPatientsPage />} />
                <Route path="patients/active" element={<AllPatientsPage filterActive />} />
                <Route path="patients/:id" element={<PatientProfilePage />} />
                <Route path="prescriptions" element={<PrescriptionsPage />} />
                <Route path="prescriptions/active" element={<PrescriptionsPage />} />
                <Route path="prescriptions/completed" element={<PrescriptionsPage completed />} />
                <Route path="medicine/tracker" element={<MedicineTrackerPage />} />
                <Route path="medicine/inventory" element={<MedicineTrackerPage />} />
                <Route path="beds" element={<BedsPage filterStatus="all" />} />
                <Route path="beds/all" element={<BedsPage filterStatus="all" />} />
                <Route path="beds/occupied" element={<BedsPage filterStatus="occupied" />} />
                <Route path="beds/available" element={<BedsPage filterStatus="available" />} />
                <Route path="beds/maintenance" element={<BedsPage filterStatus="maintenance" />} />
                <Route path="follow-ups/*" element={<Navigate to="/beds" replace />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="feedback/reviews" element={<AllReviewsPage />} />
                <Route path="feedback/submitted" element={<SubmittedReviewsPage />} />
                <Route path="data-health" element={<DataHealthPage />} />
                <Route path="data-quality" element={<DataHealthPage />} />
                <Route path="health" element={<DataHealthPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
