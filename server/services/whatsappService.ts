import dotenv from 'dotenv'

dotenv.config()

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080'
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'dermat_clinic_secret_key_2026'
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'dermat_clinic'

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('91') && cleaned.length === 12) return cleaned
  if (cleaned.length === 10) return `91${cleaned}`
  return cleaned
}

/**
 * Checks if a phone number is a simulated demo dummy number
 */
export function isDemoOrDummyNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')

  // Safe dummy number patterns that should never be sent via real WhatsApp
  if (
    cleaned.startsWith('910000') ||
    cleaned.startsWith('9190000') ||
    cleaned.startsWith('00000') ||
    cleaned.startsWith('9198000') ||
    cleaned.startsWith('9199999') ||
    cleaned.startsWith('9112345') ||
    cleaned === '919800000000' ||
    cleaned.length < 10 ||
    /^(\d)\1+$/.test(cleaned)
  ) {
    return true
  }

  // If a specific test phone whitelist is configured in .env, only allow that single number
  const allowedTestPhone = process.env.WHATSAPP_TEST_PHONE
  if (allowedTestPhone) {
    const cleanedAllowed = allowedTestPhone.replace(/\D/g, '')
    if (cleaned !== cleanedAllowed && !cleaned.endsWith(cleanedAllowed)) {
      return true
    }
  }

  return false
}

export const whatsappService = {
  /**
   * 1. Create a new WhatsApp instance in Evolution API
   */
  async createInstance() {
    try {
      const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          instanceName: INSTANCE_NAME,
          token: EVOLUTION_API_KEY,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      })

      return await response.json()
    } catch (err: any) {
      console.warn('[Evolution API] Could not create instance:', err.message)
      return null
    }
  },

  /**
   * 2. Connect instance and get QR code base64 or state
   */
  async getQrCode() {
    try {
      const response = await fetch(`${EVOLUTION_API_URL}/instance/connect/${INSTANCE_NAME}`, {
        method: 'GET',
        headers: {
          apikey: EVOLUTION_API_KEY,
        },
      })

      return await response.json()
    } catch (err: any) {
      console.warn('[Evolution API] Could not get QR code:', err.message)
      return null
    }
  },

  /**
   * 3. Check connection state (open, connecting, close)
   */
  async getConnectionStatus() {
    try {
      const response = await fetch(
        `${EVOLUTION_API_URL}/instance/connectionState/${INSTANCE_NAME}`,
        {
          method: 'GET',
          headers: {
            apikey: EVOLUTION_API_KEY,
          },
        }
      )

      return await response.json()
    } catch (err: any) {
      return { status: 'DISCONNECTED', error: err.message }
    }
  },

  /**
   * 4. Send WhatsApp message (with Demo Safe-Mode protection)
   */
  async sendTextMessage(recipientPhone: string, text: string) {
    const formattedNumber = formatPhoneNumber(recipientPhone)

    // Check if number is dummy/demo
    if (isDemoOrDummyNumber(recipientPhone)) {
      console.log(
        `🛡️ [Demo Safe Mode] Skipped sending real WhatsApp to dummy number: ${recipientPhone} (${formattedNumber}). Logged in CRM records.`
      )
      return {
        success: true,
        demoMode: true,
        message: 'Simulated WhatsApp message for demo dummy patient.',
        recipient: recipientPhone,
        data: { id: `DEMO-MSG-${Date.now()}` },
      }
    }

    try {
      const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: formattedNumber,
          options: {
            delay: 1200,
            presence: 'composing',
          },
          text,
        }),
      })

      const data = await response.json()
      console.log(`[Evolution API: WhatsApp Sent] to ${formattedNumber}`)
      return { success: true, data }
    } catch (err: any) {
      console.warn(
        `[Evolution API: Fallback/Offline] Could not send to ${formattedNumber}:`,
        err.message
      )
      return { success: false, error: err.message }
    }
  },
}
