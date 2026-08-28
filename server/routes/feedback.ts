import { Router, Request, Response } from 'express'
import { Review } from '../models/Review'

const router = Router()

// GET /feedback/:token
router.get('/feedback/:token', async (req: Request, res: Response): Promise<any> => {
  try {
    const { token } = req.params
    let review = await Review.findOne({ token })

    if (!review) {
      // Create a temporary mock feedback session if not exists
      review = await Review.create({
        feedbackId: `FB-${Date.now().toString().slice(-4)}`,
        patientId: 'DERM-1001',
        patientName: 'Valued Patient',
        doctorName: 'Dr. Priya Sharma',
        phone: '+91 98765 43210',
        visitDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        token,
      })
    }

    return res.json({
      success: true,
      data: {
        feedbackId: review.feedbackId,
        patientName: review.patientName,
        doctorName: review.doctorName,
        visitDate: review.visitDate,
        status: review.status,
      },
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } })
  }
})

// POST /feedback-submit or POST /feedback/submit
router.post(['/feedback-submit', '/submit', '/feedback/submit'], async (req: Request, res: Response): Promise<any> => {
  try {
    const body = req.body
    const token = body.token || body.feedbackId
    const rating = Number(body.rating || 5)
    const comment = body.comment || body.comments || ''
    const reasons = body.reasons || []

    let review = await Review.findOne({ token })
    if (!review && body.feedbackId) {
      review = await Review.findOne({ feedbackId: body.feedbackId })
    }

    if (review) {
      review.rating = rating
      review.comment = comment
      review.reasons = reasons
      review.status = 'Completed'
      review.submittedAt = new Date()
      review.googleRedirected = rating >= 4
      await review.save()
    } else {
      await Review.create({
        feedbackId: `FB-${Date.now().toString().slice(-4)}`,
        patientId: 'DERM-1001',
        patientName: 'Patient',
        doctorName: 'Dr. Priya Sharma',
        phone: '+91 98765 00000',
        visitDate: new Date().toISOString().split('T')[0],
        status: 'Completed',
        rating,
        reasons,
        comment,
        token: token || `token-${Date.now()}`,
        submittedAt: new Date(),
        googleRedirected: rating >= 4,
      })
    }

    return res.json({
      success: true,
      message: 'Feedback submitted successfully to MongoDB.',
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } })
  }
})

export default router
