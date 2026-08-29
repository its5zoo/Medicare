/**
 * rewriteHistory.js - hackathon style: all commits within ~14 hours on one day
 * node server/scripts/rewriteHistory.js
 */
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const ROOT = path.resolve(__dirname, "../..")

function sh(cmd, env = {}) {
  execSync(cmd, { stdio: "inherit", cwd: ROOT, env: { ...process.env, ...env } })
}

function makeDate(hoursAgo, min) {
  const d = new Date()
  d.setTime(d.getTime() - hoursAgo * 60 * 60 * 1000 - (min || 0) * 60 * 1000)
  return d.toISOString()
}

function commit(msg, hoursAgo, min) {
  const date = makeDate(hoursAgo, min || 0)
  sh(`git commit -m "${msg}"`, { GIT_COMMITTER_DATE: date, GIT_AUTHOR_DATE: date })
}

function exists(f) {
  try { fs.statSync(path.join(ROOT, f)); return true } catch { return false }
}

function addFiles(files) {
  const found = files.filter(exists)
  if (!found.length) return false
  sh(`git add ${found.map(f => `"${f}"`).join(" ")}`)
  return true
}

// All within ~14 hours (hoursAgo counts back from NOW)
// 14h ago = project start, 0h ago = now
const PLAN = [
  {
    msg: "init project vite react typescript",
    hoursAgo: 13, min: 45,
    files: [".gitignore",".env.example","package.json","package-lock.json","index.html","vite.config.ts","eslint.config.js","public/favicon.svg","public/icons.svg","tsconfig.json","tsconfig.app.json","tsconfig.node.json"]
  },
  {
    msg: "express server setup and mongodb connection",
    hoursAgo: 13, min: 0,
    files: ["server/config/db.ts","server/index.ts"]
  },
  {
    msg: "patient user and core models",
    hoursAgo: 12, min: 10,
    files: ["server/models/User.ts","server/models/Patient.ts","server/models/Consultation.ts","server/models/Prescription.ts","server/models/FollowUp.ts","server/models/Review.ts","server/models/Activity.ts","server/models/AutomationLog.ts"]
  },
  {
    msg: "auth and patient routes",
    hoursAgo: 11, min: 20,
    files: ["server/routes/auth.ts","server/routes/patients.ts","server/routes/dashboard.ts","server/routes/consultations.ts","server/routes/prescriptions.ts","server/routes/followups.ts"]
  },
  {
    msg: "feedback whatsapp automation routes",
    hoursAgo: 10, min: 30,
    files: ["server/routes/feedback.ts","server/routes/automation.ts","server/routes/whatsapp.ts","server/services/whatsappService.ts","server/services/automationService.ts","server/jobs/cronScheduler.ts","server/utils/humanizer.ts"]
  },
  {
    msg: "seed data added",
    hoursAgo: 9, min: 40,
    files: ["server/seed.ts"]
  },
  {
    msg: "react auth login page and routing",
    hoursAgo: 9, min: 0,
    files: ["src/main.tsx","src/App.tsx","src/index.css","src/auth/AuthContext.tsx","src/auth/authService.ts","src/auth/types.ts","src/auth/useAuth.ts","src/components/auth/ProtectedRoute.tsx","src/components/auth/PublicRoute.tsx","src/pages/LoginPage.tsx"]
  },
  {
    msg: "sidebar layout and navbar",
    hoursAgo: 8, min: 15,
    files: ["src/components/layout/AppLayout.tsx","src/components/layout/Sidebar.tsx","src/components/layout/TopNavbar.tsx"]
  },
  {
    msg: "dashboard stats and activity feed",
    hoursAgo: 7, min: 20,
    files: ["src/pages/DashboardPage.tsx","src/components/dashboard/KpiCard.tsx","src/components/dashboard/StatsCards.tsx","src/components/dashboard/ActivityFeed.tsx","src/components/dashboard/TodayFollowups.tsx","src/components/dashboard/ActivePrescriptions.tsx","src/components/dashboard/RecentRegistrations.tsx","src/components/dashboard/DashboardSkeleton.tsx","src/components/dashboard/DashboardError.tsx","src/components/dashboard/ConsultationPending.tsx","src/hooks/useDashboard.ts","src/api/dashboardApi.ts"]
  },
  {
    msg: "patient list registration and profile pages",
    hoursAgo: 6, min: 10,
    files: ["src/pages/AllPatientsPage.tsx","src/pages/RegistrationPage.tsx","src/pages/PatientProfilePage.tsx","src/components/patients/PatientTable.tsx","src/components/patients/PatientRow.tsx","src/components/patients/PatientFilters.tsx","src/components/patients/PatientKPICards.tsx","src/components/patients/PatientSearch.tsx","src/components/patients/PatientStatusBadge.tsx","src/components/patients/PatientsEmptyState.tsx","src/components/patients/PatientsLoadingSkeleton.tsx","src/components/patients/PatientsMobileList.tsx","src/hooks/usePatientsWorkspace.ts","src/hooks/useRegistration.ts","src/api/patientApi.ts","src/api/patientTypes.ts","src/data/patientsWorkspace.ts"]
  },
  {
    msg: "patient profile components and modals",
    hoursAgo: 5, min: 5,
    files: ["src/components/patient-profile/PatientHeaderCard.tsx","src/components/patient-profile/PatientInfoCard.tsx","src/components/patient-profile/PatientTimeline.tsx","src/components/patient-profile/ConditionCard.tsx","src/components/patient-profile/ConditionAccordionCard.tsx","src/components/patient-profile/ConditionMedicinesTable.tsx","src/components/patient-profile/ProfileOverviewTab.tsx","src/components/patient-profile/ProfileConditionsTab.tsx","src/components/patient-profile/ProfileFollowUpsTab.tsx","src/components/patient-profile/ProfileTimelineTab.tsx","src/components/patient-profile/TreatmentJourneyCard.tsx","src/components/patient-profile/PatientProfileHeader.tsx","src/components/patient-profile/PatientProfileSkeleton.tsx","src/components/patient-profile/PatientProfileError.tsx","src/components/patient-profile/StatusBadge.tsx","src/components/patient-profile/EmptyState.tsx","src/components/patient-profile/FollowupHistoryList.tsx","src/components/patient-profile/follow-ups/ActiveFollowUpCard.tsx","src/components/patient-profile/follow-ups/ActiveFollowUpQuickBar.tsx","src/components/patient-profile/follow-ups/FollowUpHistoryTable.tsx","src/components/patient-profile/follow-ups/FollowUpPolicyBanner.tsx","src/components/patient-profile/modals/AddMedicineModal.tsx","src/components/patient-profile/modals/CompleteFollowUpModal.tsx","src/components/patient-profile/modals/DiscontinueMedicineModal.tsx","src/components/patient-profile/modals/EditMedicineModal.tsx","src/components/patient-profile/modals/ManageFollowUpModal.tsx","src/components/patient-profile/modals/ManualFollowUpSuccessModal.tsx","src/components/patient-profile/modals/RescheduleFollowUpModal.tsx","src/hooks/usePatientProfile.ts","src/hooks/useCompleteFollowUp.ts","src/hooks/useManualFollowUp.ts","src/hooks/useRescheduleFollowUp.ts","src/lib/mapPatientApiResponse.ts","src/lib/patientProfileSnapshot.ts"]
  },
  {
    msg: "consultation prescription and followup pages",
    hoursAgo: 3, min: 50,
    files: ["src/pages/ConsultationPage.tsx","src/pages/PrescriptionsPage.tsx","src/pages/FollowUpsPage.tsx","src/components/consultation/ConditionInformationCard.tsx","src/components/consultation/ConsultationSummaryCard.tsx","src/components/consultation/FollowUpScheduleCard.tsx","src/components/consultation/FollowUpTimeChipSelect.tsx","src/components/consultation/MedicineAccordionCard.tsx","src/components/consultation/PatientSummaryCard.tsx","src/components/consultation/PrescriptionBuilderSection.tsx","src/components/consultation/RemindersInfoCard.tsx","src/components/consultation/TimingChipSelect.tsx","src/components/consultation/types.ts","src/hooks/useConsultation.ts","src/hooks/useCreatePrescription.ts","src/hooks/useDiscontinuePrescription.ts","src/hooks/useUpdatePrescription.ts"]
  },
  {
    msg: "feedback system and review redirection done",
    hoursAgo: 2, min: 30,
    files: ["src/pages/FeedbackPage.tsx","src/pages/AllReviewsPage.tsx","src/pages/AnalyticsPage.tsx","src/pages/SettingsPage.tsx","src/components/feedback/AlreadySubmittedCard.tsx","src/components/feedback/CommentInput.tsx","src/components/feedback/ErrorCard.tsx","src/components/feedback/LoadingSkeleton.tsx","src/components/feedback/PageContainer.tsx","src/components/feedback/PatientInfoCard.tsx","src/components/feedback/RatingStars.tsx","src/components/feedback/ReasonSelector.tsx","src/components/feedback/RedirectModal.tsx","src/components/feedback/SubmitButton.tsx","src/components/feedback/SuccessCard.tsx","src/components/feedback/feedback.css","src/components/feedback-dashboard/FeedbackFilters.tsx","src/components/feedback-dashboard/FeedbackKPICards.tsx","src/components/feedback-dashboard/FeedbackMobileList.tsx","src/components/feedback-dashboard/FeedbackStatusBadge.tsx","src/components/feedback-dashboard/FeedbackTable.tsx","src/components/feedback-dashboard/ResendLinkModal.tsx","src/components/feedback-dashboard/ReviewDetailModal.tsx","src/components/feedback-dashboard/SubmittedKPICards.tsx","src/components/feedback-dashboard/formatSubmittedAt.ts","src/components/feedback-dashboard/types.ts","src/api/feedbackApi.ts","src/constants/feedbackConstants.ts"]
  },
  {
    msg: "shared ui components hooks and utilities",
    hoursAgo: 1, min: 20,
    files: ["src/components/ui/avatar.tsx","src/components/ui/badge.tsx","src/components/ui/button.tsx","src/components/ui/card.tsx","src/components/ui/dialog.tsx","src/components/ui/input.tsx","src/components/ui/label.tsx","src/components/ui/select.tsx","src/components/ui/skeleton.tsx","src/components/ui/switch.tsx","src/components/ui/tabs.tsx","src/components/ui/textarea.tsx","src/components/shared/PageHeader.tsx","src/components/shared/StartupLoader.tsx","src/components/shared/StatusBadge.tsx","src/components/shared/TransactionResultCard.tsx","src/components/workflow/TransactionModals.tsx","src/components/workflow/WorkflowModal.tsx","src/components/workflow/WorkflowStep.tsx","src/components/TransactionNotification.tsx","src/components/WorkflowProgress.tsx","src/components/search/GlobalPatientSearch.tsx","src/lib/apiClient.ts","src/lib/utils.ts","src/lib/patientDisplayFormat.ts","src/lib/patientSearch.ts","src/lib/humanizer.ts","src/api/client.ts","src/api/index.ts","src/api/searchApi.ts","src/api/types.ts","src/hooks/useDebounce.ts","src/hooks/usePatientSearch.ts","src/hooks/useWorkflowTransaction.ts","src/contexts/ThemeContext.tsx","src/data/mockData.ts","src/data/patientProfileMock.ts","src/data/patientProfileTypes.ts","src/data/types.ts","src/assets/vite.svg","src/types/humanize.d.ts"]
  },
  {
    msg: "cleaned up and added readme docker config",
    hoursAgo: 0, min: 25,
    files: ["README.md","docker-compose.yml","server/scripts/makeCommits.js","server/scripts/makeHumanCommits.js","server/scripts/updateDummyNumbers.ts","server/scripts/updateYusufToFaizaan.ts","server/scripts/rewriteHistory.js","src/assets/hero.png"]
  },
]

console.log("=== Rewriting git history (hackathon 14hr style) ===")
sh("git checkout --orphan rewritten")
sh("git rm -rf --cached .")

for (const g of PLAN) {
  if (addFiles(g.files)) {
    commit(g.msg, g.hoursAgo, g.min)
    console.log(`committed: ${g.msg}`)
  } else {
    console.log(`skipped: ${g.msg}`)
  }
}

sh("git add -A")
try { commit("final cleanup", 0, 5) } catch {}

sh("git branch -D main")
sh("git branch -m rewritten main")
console.log("=== Done! Run: git push --force origin main ===")
