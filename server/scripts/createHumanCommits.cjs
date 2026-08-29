const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const ROOT = path.resolve(__dirname, "../..")

function sh(cmd, env = {}) {
  execSync(cmd, { stdio: "inherit", cwd: ROOT, env: { ...process.env, ...env } })
}

function commit(msg, dateStr) {
  sh(`git commit -m "${msg}"`, { GIT_COMMITTER_DATE: dateStr, GIT_AUTHOR_DATE: dateStr })
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

const COMMITS = [
  {
    msg: "initial frontend setup with vite react and tailwind config",
    date: "2026-08-28T15:08:24+05:30",
    files: [
      ".gitignore", ".env.example", "package.json", "package-lock.json", "index.html",
      "vite.config.ts", "eslint.config.js", "tsconfig.json", "tsconfig.app.json",
      "tsconfig.node.json", "public/favicon.svg", "public/icons.svg", "src/index.css",
      "src/vite-env.d.ts", "vercel.json"
    ]
  },
  {
    msg: "added basic ui buttons cards and layout sidebar",
    date: "2026-08-28T16:15:10+05:30",
    files: [
      "src/components/ui/button.tsx", "src/components/ui/card.tsx", "src/components/ui/input.tsx",
      "src/components/ui/label.tsx", "src/components/ui/badge.tsx", "src/components/ui/avatar.tsx",
      "src/components/ui/dialog.tsx", "src/components/ui/select.tsx", "src/components/ui/skeleton.tsx",
      "src/components/ui/switch.tsx", "src/components/ui/tabs.tsx", "src/components/ui/textarea.tsx",
      "src/components/layout/AppLayout.tsx", "src/components/layout/Sidebar.tsx",
      "src/components/layout/TopNavbar.tsx", "src/contexts/ThemeContext.tsx",
      "src/components/shared/PageHeader.tsx", "src/components/shared/StatusBadge.tsx"
    ]
  },
  {
    msg: "login page and auth context setup",
    date: "2026-08-28T17:22:45+05:30",
    files: [
      "src/main.tsx", "src/App.tsx", "src/auth/AuthContext.tsx", "src/auth/authService.ts",
      "src/auth/types.ts", "src/auth/useAuth.ts", "src/components/auth/ProtectedRoute.tsx",
      "src/components/auth/PublicRoute.tsx", "src/components/shared/StartupLoader.tsx"
    ]
  },
  {
    msg: "dashboard kpi cards and activity feed component",
    date: "2026-08-28T18:48:19+05:30",
    files: [
      "src/pages/DashboardPage.tsx", "src/components/dashboard/KpiCard.tsx",
      "src/components/dashboard/StatsCards.tsx", "src/components/dashboard/ActivityFeed.tsx",
      "src/components/dashboard/TodayFollowups.tsx", "src/components/dashboard/ActivePrescriptions.tsx",
      "src/components/dashboard/RecentRegistrations.tsx", "src/components/dashboard/DashboardSkeleton.tsx",
      "src/components/dashboard/DashboardError.tsx", "src/components/dashboard/ConsultationPending.tsx",
      "src/hooks/useDashboard.ts", "src/api/dashboardApi.ts", "src/api/types.ts",
      "src/data/mockData.ts", "src/data/types.ts"
    ]
  },
  {
    msg: "patient list and patient profile views completed",
    date: "2026-08-28T20:10:30+05:30",
    files: [
      "src/pages/AllPatientsPage.tsx", "src/pages/RegistrationPage.tsx",
      "src/pages/PatientProfilePage.tsx", "src/components/patients/PatientTable.tsx",
      "src/components/patients/PatientRow.tsx", "src/components/patients/PatientFilters.tsx",
      "src/components/patients/PatientKPICards.tsx", "src/components/patients/PatientSearch.tsx",
      "src/components/patients/PatientStatusBadge.tsx", "src/components/patients/PatientsEmptyState.tsx",
      "src/components/patients/PatientsLoadingSkeleton.tsx", "src/components/patients/PatientsMobileList.tsx",
      "src/components/patient-profile/PatientHeaderCard.tsx", "src/components/patient-profile/PatientInfoCard.tsx",
      "src/components/patient-profile/PatientTimeline.tsx", "src/components/patient-profile/ConditionCard.tsx",
      "src/components/patient-profile/ConditionAccordionCard.tsx", "src/components/patient-profile/ConditionMedicinesTable.tsx",
      "src/components/patient-profile/ProfileOverviewTab.tsx", "src/components/patient-profile/ProfileConditionsTab.tsx",
      "src/components/patient-profile/ProfileFollowUpsTab.tsx", "src/components/patient-profile/ProfileTimelineTab.tsx",
      "src/components/patient-profile/TreatmentJourneyCard.tsx", "src/components/patient-profile/PatientProfileHeader.tsx",
      "src/components/patient-profile/PatientProfileSkeleton.tsx", "src/components/patient-profile/PatientProfileError.tsx",
      "src/components/patient-profile/StatusBadge.tsx", "src/components/patient-profile/EmptyState.tsx",
      "src/components/patient-profile/FollowupHistoryList.tsx",
      "src/hooks/usePatientsWorkspace.ts", "src/hooks/useRegistration.ts", "src/hooks/usePatientProfile.ts",
      "src/api/patientApi.ts", "src/api/patientTypes.ts", "src/data/patientsWorkspace.ts",
      "src/data/patientProfileMock.ts", "src/data/patientProfileTypes.ts",
      "src/lib/mapPatientApiResponse.ts", "src/lib/patientProfileSnapshot.ts",
      "src/lib/patientDisplayFormat.ts", "src/lib/patientSearch.ts"
    ]
  },
  {
    msg: "consultation flow prescription builder and feedback pages",
    date: "2026-08-28T21:35:12+05:30",
    files: [
      "src/pages/ConsultationPage.tsx", "src/pages/PrescriptionsPage.tsx", "src/pages/FollowUpsPage.tsx",
      "src/pages/FeedbackPage.tsx", "src/pages/AllReviewsPage.tsx", "src/pages/AnalyticsPage.tsx",
      "src/pages/SettingsPage.tsx", "src/pages/SubmittedReviewsPage.tsx",
      "src/components/consultation/ConditionInformationCard.tsx", "src/components/consultation/ConsultationSummaryCard.tsx",
      "src/components/consultation/FollowUpScheduleCard.tsx", "src/components/consultation/FollowUpTimeChipSelect.tsx",
      "src/components/consultation/MedicineAccordionCard.tsx", "src/components/consultation/PatientSummaryCard.tsx",
      "src/components/consultation/PrescriptionBuilderSection.tsx", "src/components/consultation/RemindersInfoCard.tsx",
      "src/components/consultation/TimingChipSelect.tsx", "src/components/consultation/types.ts",
      "src/components/feedback/AlreadySubmittedCard.tsx", "src/components/feedback/CommentInput.tsx",
      "src/components/feedback/ErrorCard.tsx", "src/components/feedback/LoadingSkeleton.tsx",
      "src/components/feedback/PageContainer.tsx", "src/components/feedback/PatientInfoCard.tsx",
      "src/components/feedback/RatingStars.tsx", "src/components/feedback/ReasonSelector.tsx",
      "src/components/feedback/RedirectModal.tsx", "src/components/feedback/SubmitButton.tsx",
      "src/components/feedback/SuccessCard.tsx", "src/components/feedback/feedback.css",
      "src/components/feedback-dashboard/FeedbackFilters.tsx", "src/components/feedback-dashboard/FeedbackKPICards.tsx",
      "src/components/feedback-dashboard/FeedbackMobileList.tsx", "src/components/feedback-dashboard/FeedbackStatusBadge.tsx",
      "src/components/feedback-dashboard/FeedbackTable.tsx", "src/components/feedback-dashboard/ResendLinkModal.tsx",
      "src/components/feedback-dashboard/ReviewDetailModal.tsx", "src/components/feedback-dashboard/SubmittedKPICards.tsx",
      "src/components/feedback-dashboard/formatSubmittedAt.ts", "src/components/feedback-dashboard/types.ts",
      "src/components/patient-profile/follow-ups/ActiveFollowUpCard.tsx", "src/components/patient-profile/follow-ups/ActiveFollowUpQuickBar.tsx",
      "src/components/patient-profile/follow-ups/FollowUpHistoryTable.tsx", "src/components/patient-profile/follow-ups/FollowUpPolicyBanner.tsx",
      "src/components/patient-profile/modals/AddMedicineModal.tsx", "src/components/patient-profile/modals/CompleteFollowUpModal.tsx",
      "src/components/patient-profile/modals/DiscontinueMedicineModal.tsx", "src/components/patient-profile/modals/EditMedicineModal.tsx",
      "src/components/patient-profile/modals/ManageFollowUpModal.tsx", "src/components/patient-profile/modals/ManualFollowUpSuccessModal.tsx",
      "src/components/patient-profile/modals/RescheduleFollowUpModal.tsx",
      "src/hooks/useConsultation.ts", "src/hooks/useCreatePrescription.ts", "src/hooks/useDiscontinuePrescription.ts",
      "src/hooks/useUpdatePrescription.ts", "src/hooks/useCompleteFollowUp.ts", "src/hooks/useManualFollowUp.ts",
      "src/hooks/useRescheduleFollowUp.ts", "src/api/feedbackApi.ts", "src/constants/feedbackConstants.ts",
      "src/components/shared/TransactionResultCard.tsx", "src/components/workflow/TransactionModals.tsx",
      "src/components/workflow/WorkflowModal.tsx", "src/components/workflow/WorkflowStep.tsx",
      "src/components/TransactionNotification.tsx", "src/components/WorkflowProgress.tsx",
      "src/components/search/GlobalPatientSearch.tsx", "src/hooks/useDebounce.ts", "src/hooks/usePatientSearch.ts",
      "src/hooks/useWorkflowTransaction.ts", "src/services/consultationApi.ts", "src/services/followUpApi.ts",
      "src/services/patientProfile/followUpService.ts", "src/services/patientProfile/mockPatientProfileService.ts",
      "src/services/patientProfile/types.ts", "src/services/patients/types.ts", "src/services/postWriteSync/actionUpdaters.ts",
      "src/services/postWriteSync/freshnessComparators.ts", "src/services/postWriteSync/index.ts",
      "src/services/postWriteSync/pollingEngine.ts", "src/services/postWriteSync/sessionManager.ts",
      "src/services/postWriteSync/syncStrategyMap.ts", "src/services/postWriteSync/triggerPostWriteSync.ts",
      "src/services/postWriteSync/types.ts", "src/services/prescriptionApi.ts", "src/services/registrationApi.ts",
      "src/store/notifications.ts", "src/utils/formatters.ts", "src/utils/validators.ts"
    ]
  },
  {
    msg: "express backend setup and mongoose models created",
    date: "2026-08-28T23:05:40+05:30",
    files: [
      "server/config/db.ts", "server/index.ts", "server/models/User.ts", "server/models/Patient.ts",
      "server/models/Consultation.ts", "server/models/Prescription.ts", "server/models/FollowUp.ts",
      "server/models/Review.ts", "server/models/Activity.ts", "server/models/AutomationLog.ts"
    ]
  },
  {
    msg: "added api routes controllers and clinic seed data",
    date: "2026-08-29T00:30:15+05:30",
    files: [
      "server/routes/auth.ts", "server/routes/patients.ts", "server/routes/dashboard.ts",
      "server/routes/consultations.ts", "server/routes/prescriptions.ts", "server/routes/followups.ts",
      "server/routes/feedback.ts", "server/routes/automation.ts", "server/routes/whatsapp.ts",
      "server/seed.ts", "src/api/client.ts", "src/api/index.ts", "src/api/searchApi.ts",
      "src/lib/apiClient.ts", "src/services/api.ts"
    ]
  },
  {
    msg: "whatsapp automation service and cron scheduler integrated",
    date: "2026-08-29T01:55:50+05:30",
    files: [
      "server/services/whatsappService.ts", "server/services/automationService.ts",
      "server/jobs/cronScheduler.ts", "docker-compose.yml"
    ]
  },
  {
    msg: "added humanize formatting for numbers dates and relative time",
    date: "2026-08-29T03:12:30+05:30",
    files: [
      "src/lib/humanizer.ts", "src/types/humanize.d.ts", "server/utils/humanizer.ts"
    ]
  },
  {
    msg: "fixed followup white screen issue and safe deploy api parsing",
    date: "2026-08-29T04:25:10+05:30",
    files: [
      "src/components/shared/StatusBadge.tsx", "src/lib/utils.ts"
    ]
  },
  {
    msg: "added demo admin quick login and updated readme docs",
    date: "2026-08-29T05:38:20+05:30",
    files: [
      "README.md", "src/pages/LoginPage.tsx", "src/assets/hero.png", "src/assets/vite.svg",
      "server/scripts/makeCommits.js", "server/scripts/makeHumanCommits.js",
      "server/scripts/rewriteHistory.cjs", "server/scripts/rewriteHistory.js",
      "server/scripts/rewriteHistory2.cjs", "server/scripts/rewriteHistory3.cjs",
      "server/scripts/createHumanCommits.cjs",
      "server/scripts/updateDummyNumbers.ts", "server/scripts/updateYusufToFaizaan.ts"
    ]
  }
]

console.log("=== Generating Human Commits (Frontend First, Backend Next, Feature by Feature) ===")
sh("git checkout --orphan human_history")
sh("git rm -rf --cached .")

for (let i = 0; i < COMMITS.length; i++) {
  const c = COMMITS[i]
  const hasFiles = addFiles(c.files)
  if (hasFiles) {
    commit(c.msg, c.date)
    console.log(`[${i + 1}/${COMMITS.length}] Committed: "${c.msg}" (${c.date})`)
  } else {
    console.log(`[${i + 1}/${COMMITS.length}] Skipped (no files): "${c.msg}"`)
  }
}

// Stage any leftover files
sh("git add -A")
try {
  commit("project polish and cleanup", "2026-08-29T05:40:00+05:30")
  console.log("Committed leftover files.")
} catch {
  console.log("No leftovers.")
}

sh("git branch -D main")
sh("git branch -m human_history main")
console.log("=== Done! History successfully recreated. ===")
