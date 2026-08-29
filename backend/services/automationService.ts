import { Patient } from "../models/Patient"
import { Prescription } from "../models/Prescription"
import { FollowUp } from "../models/FollowUp"
import { Review } from "../models/Review"
import { Activity } from "../models/Activity"
import { AutomationLog } from "../models/AutomationLog"
import { whatsappService } from "./whatsappService"

export const automationService = {
  async sendWelcomeRegistration(patient: { patientId: string; name: string; phone: string; doctor: string }) {
    const text = `Hello ${patient.name}, welcome to Medicure! Your Patient ID is ${patient.patientId}. You are assigned to ${patient.doctor}. We are here to support your health journey.`

    const log = await AutomationLog.create({
      workflowType: "welcome_registration",
      recipient: { name: patient.name, phone: patient.phone, patientId: patient.patientId },
      channel: "WhatsApp",
      payload: { message: text },
      status: "SENT",
      details: `Welcome message sent for ${patient.patientId}`,
      dispatchedAt: new Date(),
    })

    await whatsappService.sendTextMessage(patient.phone, text)
    return log
  },

  async sendMedicineReminders(timeSlot: "Morning" | "Afternoon" | "Night" = "Morning") {
    const activePrescriptions = await Prescription.find({
      status: "Active",
      reminderActive: true,
      timing: { $in: [timeSlot, "Daily", "Twice daily", "Morning & Night"] },
    })

    const results = []

    for (const rx of activePrescriptions) {
      const message = `Reminder from Medicure: Hi ${rx.patientName}, time for your ${timeSlot} dose of ${rx.medicineName} (${rx.dosage}). ${rx.instructions || "Take as prescribed."}`

      const log = await AutomationLog.create({
        workflowType: "medicine_reminder",
        recipient: { name: rx.patientName, phone: rx.phone, patientId: rx.patientId },
        channel: "WhatsApp",
        payload: { medicineName: rx.medicineName, dosage: rx.dosage, timeSlot, message },
        status: "SENT",
        details: `${timeSlot} reminder sent for ${rx.medicineName}`,
        dispatchedAt: new Date(),
      })

      await whatsappService.sendTextMessage(rx.phone, message)
      results.push(log)
    }

    if (results.length > 0) {
      await Activity.create({
        type: "reminder_sent",
        title: `${timeSlot} Medicine Reminders Sent`,
        description: `Reminders sent to ${results.length} patients for ${timeSlot} doses.`,
        priority: "low",
      })
    }

    return { count: results.length, logs: results }
  },

  async sendTodayFollowUpReminders() {
    const todayStr = new Date().toISOString().split("T")[0]
    const todayFollowups = await FollowUp.find({
      followupDate: todayStr,
      status: { $in: ["Today", "Scheduled", "Upcoming"] },
    })

    const results = []

    for (const fu of todayFollowups) {
      const message = `Appointment Reminder: Hi ${fu.patientName}, you have a follow-up today at ${fu.followupTime} with ${fu.doctor} at Medicure.`

      const log = await AutomationLog.create({
        workflowType: "followup_reminder",
        recipient: { name: fu.patientName, phone: fu.phone, patientId: fu.patientId },
        channel: "WhatsApp",
        payload: { followupDate: fu.followupDate, followupTime: fu.followupTime, doctor: fu.doctor, message },
        status: "SENT",
        details: `Follow-up reminder sent for ${fu.followupTime}`,
        dispatchedAt: new Date(),
      })

      fu.status = "Today"
      await fu.save()
      await whatsappService.sendTextMessage(fu.phone, message)
      results.push(log)
    }

    if (results.length > 0) {
      await Activity.create({
        type: "follow_up_scheduled",
        title: "Follow-Up Reminders Sent",
        description: `Notifications sent for ${results.length} visits today.`,
        priority: "normal",
      })
    }

    return { count: results.length, logs: results }
  },

  async processMissedFollowUps() {
    const todayStr = new Date().toISOString().split("T")[0]
    const missed = await FollowUp.find({
      followupDate: { $lt: todayStr },
      status: { $in: ["Scheduled", "Today", "Upcoming"] },
    })

    const results = []

    for (const fu of missed) {
      fu.status = "Missed"
      fu.rescheduleCount = (fu.rescheduleCount || 0) + 1
      await fu.save()

      const log = await AutomationLog.create({
        workflowType: "missed_followup_check",
        recipient: { name: fu.patientName, phone: fu.phone, patientId: fu.patientId },
        channel: "System",
        payload: { originalDate: fu.followupDate, rescheduleCount: fu.rescheduleCount },
        status: "PROCESSED",
        details: `${fu.patientName} missed appointment on ${fu.followupDate}`,
        dispatchedAt: new Date(),
      })

      await Activity.create({
        type: "follow_up_scheduled",
        title: "Missed Follow-Up Detected",
        description: `${fu.patientName} missed appointment on ${fu.followupDate}.`,
        patientCode: fu.patientId,
        priority: "high",
      })

      results.push(log)
    }

    return { count: results.length, updated: results }
  },

  async sendReviewRequests() {
    const patients = await Patient.find({
      status: { $in: ["Active Treatment", "Completed", "Follow-Up Due"] },
    }).limit(5)

    const results = []

    for (const p of patients) {
      const existing = await Review.findOne({ patientId: p.patientId })
      if (!existing) {
        const token = `token-${p.patientId.toLowerCase()}-${Date.now().toString().slice(-4)}`
        await Review.create({
          feedbackId: `FB-${Date.now().toString().slice(-4)}`,
          patientId: p.patientId,
          patientName: p.name,
          doctorName: p.doctor,
          phone: p.phone,
          visitDate: p.lastVisitDate || new Date().toISOString().split("T")[0],
          status: "Pending",
          token,
          whatsappSent: true,
        })

        const reviewUrl = `http://localhost:5173/review/${token}`
        const message = `Dear ${p.name}, Dr. ${p.doctor} hopes you are doing well! Please share your feedback: ${reviewUrl}`

        const log = await AutomationLog.create({
          workflowType: "review_request",
          recipient: { name: p.name, phone: p.phone, patientId: p.patientId },
          channel: "WhatsApp",
          payload: { token, reviewUrl, message },
          status: "SENT",
          details: `Review link sent with token ${token}`,
          dispatchedAt: new Date(),
        })

        results.push(log)
      }
    }

    return { count: results.length, logs: results }
  },
}
