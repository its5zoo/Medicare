import { Router, Request, Response } from 'express'
import { AutomationLog } from '../models/AutomationLog.js'
import { automationService } from '../services/automationService.js'

const router = Router()

// GET /api/automations/logs
router.get('/logs', async (_req: Request, res: Response): Promise<any> => {
  try {
    const logs = await AutomationLog.find().sort({ createdAt: -1 }).limit(50)
    const stats = {
      totalDispatched: await AutomationLog.countDocuments({ status: 'SENT' }),
      totalProcessed: await AutomationLog.countDocuments(),
      medicineReminders: await AutomationLog.countDocuments({ workflowType: 'medicine_reminder' }),
      followupReminders: await AutomationLog.countDocuments({ workflowType: 'followup_reminder' }),
      missedChecks: await AutomationLog.countDocuments({ workflowType: 'missed_followup_check' }),
      reviewRequests: await AutomationLog.countDocuments({ workflowType: 'review_request' }),
    }

    return res.json({
      success: true,
      data: {
        stats,
        logs,
      },
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } })
  }
})

// POST /api/automations/trigger
router.post('/trigger', async (req: Request, res: Response): Promise<any> => {
  try {
    const { action, slot } = req.body
    let result: any

    switch (action) {
      case 'medicine_reminder':
        result = await automationService.sendMedicineReminders(slot || 'Morning')
        break
      case 'today_followup':
        result = await automationService.sendTodayFollowUpReminders()
        break
      case 'missed_check':
        result = await automationService.processMissedFollowUps()
        break
      case 'review_request':
        result = await automationService.sendReviewRequests()
        break
      default:
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_ACTION', message: `Unknown automation action: ${action}` },
        })
    }

    return res.json({
      success: true,
      message: `Automation ${action} triggered successfully.`,
      result,
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } })
  }
})

export default router
