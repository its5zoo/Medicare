import { Router, Request, Response } from 'express'
import { whatsappService } from '../services/whatsappService.js'

const router = Router()

// GET /api/whatsapp/status
router.get('/status', async (_req: Request, res: Response): Promise<any> => {
  try {
    const status = await whatsappService.getConnectionStatus()
    return res.json({ success: true, status })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/whatsapp/create
router.post('/create', async (_req: Request, res: Response): Promise<any> => {
  try {
    const data = await whatsappService.createInstance()
    return res.json({ success: true, data })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/whatsapp/qr
router.get('/qr', async (_req: Request, res: Response): Promise<any> => {
  try {
    const data = await whatsappService.getQrCode()
    return res.json({ success: true, data })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/whatsapp/scan (Visual QR Code view for browser)
router.get(['/scan', '/view-qr'], async (_req: Request, res: Response): Promise<any> => {
  try {
    const statusData = await whatsappService.getConnectionStatus()
    const state = statusData?.instance?.state || statusData?.state

    if (state === 'open') {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>WhatsApp Connected - Dermat Clinic</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2.5rem; border-radius: 1.25rem; text-align: center; max-width: 420px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); border: 1px solid #334155; }
            .badge { background: #10b981; color: #fff; padding: 6px 16px; border-radius: 9999px; font-weight: 600; display: inline-block; margin-bottom: 1rem; }
            h1 { margin: 0 0 10px; font-size: 1.5rem; }
            p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
            .btn { display: inline-block; margin-top: 1.5rem; background: #6366f1; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">✓ Connected</span>
            <h1>WhatsApp is Active!</h1>
            <p>Your clinic WhatsApp number is linked and ready to send automated reminders and alerts.</p>
            <a href="http://localhost:5173/dashboard" class="btn">Go to Dashboard</a>
          </div>
        </body>
        </html>
      `)
    }

    const qrData = await whatsappService.getQrCode()
    const base64 = qrData?.base64 || qrData?.qrcode?.base64

    if (!base64) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Generating QR - Dermat Clinic</title>
          <meta http-equiv="refresh" content="3">
          <style>
            body { font-family: sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2rem; border-radius: 1rem; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Generating QR Code...</h2>
            <p>Please wait 3 seconds while connecting to Evolution API.</p>
          </div>
        </body>
        </html>
      `)
    }

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Scan WhatsApp QR - Dermat Clinic</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="refresh" content="20">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .card { background: #182234; padding: 2.2rem; border-radius: 1.5rem; text-align: center; max-width: 440px; width: 90%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); border: 1px solid #2d3b55; }
          h2 { margin-top: 0; margin-bottom: 0.5rem; font-size: 1.4rem; color: #ffffff; }
          p { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.4; }
          .qr-box { background: white; padding: 16px; border-radius: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); }
          .qr-box img { display: block; max-width: 250px; width: 100%; height: auto; }
          .steps { text-align: left; background: #0f172a; padding: 14px 18px; border-radius: 12px; margin-top: 1.5rem; font-size: 0.85rem; color: #cbd5e1; border: 1px solid #23304a; }
          .steps ol { margin: 0; padding-left: 20px; }
          .steps li { margin-bottom: 6px; }
          .timer { margin-top: 1rem; font-size: 0.8rem; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>📱 Connect Clinic WhatsApp</h2>
          <p>Scan this QR code using WhatsApp on your phone to link clinic automation.</p>
          <div class="qr-box">
            <img src="${base64}" alt="WhatsApp QR Code" />
          </div>
          <div class="steps">
            <ol>
              <li>Open <strong>WhatsApp</strong> on your phone</li>
              <li>Tap <strong>Settings (or 3 dots) > Linked Devices</strong></li>
              <li>Tap <strong>Link a Device</strong> and point phone at this screen</li>
            </ol>
          </div>
          <div class="timer">🔄 Auto-refreshes every 20 seconds</div>
        </div>
      </body>
      </html>
    `)
  } catch (error: any) {
    return res.status(500).send(`<h3>Error loading QR Code: ${error.message}</h3>`)
  }
})

// POST /api/whatsapp/send
router.post('/send', async (req: Request, res: Response): Promise<any> => {
  try {
    const { phone, message } = req.body
    if (!phone || !message) {
      return res.status(400).json({ success: false, message: 'Phone and message are required' })
    }
    const result = await whatsappService.sendTextMessage(phone, message)
    return res.json(result)
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
})

export default router
