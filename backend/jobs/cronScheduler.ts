import cron from "node-cron"
import { automationService } from "../services/automationService.js"

export function initCronScheduler() {
  // 8am - morning meds + followup reminders
  cron.schedule("0 8 * * *", async () => {
    try {
      await automationService.sendMedicineReminders("Morning")
      await automationService.sendTodayFollowUpReminders()
    } catch (err) {
      console.error("[cron 8am]", err)
    }
  })

  // 1:30pm - afternoon meds
  cron.schedule("30 13 * * *", async () => {
    try {
      await automationService.sendMedicineReminders("Afternoon")
    } catch (err) {
      console.error("[cron 1:30pm]", err)
    }
  })

  // 8:30pm - night meds
  cron.schedule("30 20 * * *", async () => {
    try {
      await automationService.sendMedicineReminders("Night")
    } catch (err) {
      console.error("[cron 8:30pm]", err)
    }
  })

  // midnight - missed followups + review requests
  cron.schedule("0 0 * * *", async () => {
    try {
      await automationService.processMissedFollowUps()
      await automationService.sendReviewRequests()
    } catch (err) {
      console.error("[cron midnight]", err)
    }
  })

  console.log("cron jobs started")
}
