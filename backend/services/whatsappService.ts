import dotenv from 'dotenv'

dotenv.config()

const EVOLUTION_API_URL =
  process.env.EVOLUTION_API_URL || 'https://evolution-api-fj7p.onrender.com'
const EVOLUTION_API_KEY =
  process.env.EVOLUTION_API_KEY || 'dermat_clinic_secret_key_2026'
const INSTANCE_NAME =
  process.env.EVOLUTION_INSTANCE_NAME || 'dermat_clinic'

export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned
  }
  if (cleaned.length === 10) {
    return `91${cleaned}`
  }
  return cleaned
}

/**
 * Checks if a phone number is an obvious dummy placeholder
 */
export function isDemoOrDummyNumber(phone: string): boolean {
  if (!phone) return true
  const cleaned = phone.replace(/\D/g, '')

  // Only filter out obvious placeholders like all zeroes, all same digits, or less than 10 digits
  if (
    cleaned.length < 10 ||
    cleaned === '0000000000' ||
    cleaned === '910000000000' ||
    /^(\d)\1+$/.test(cleaned)
  ) {
    return true
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
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(
        `${EVOLUTION_API_URL}/instance/connectionState/${INSTANCE_NAME}`,
        {
          method: 'GET',
          headers: {
            apikey: EVOLUTION_API_KEY,
          },
          signal: controller.signal,
        }
      )
      clearTimeout(timeout)

      const json = await response.json()
      return json
    } catch (err: any) {
      return { status: 'DISCONNECTED', error: err.message }
    }
  },

  /**
   * 4. Send WhatsApp message directly via Evolution API without artificial lag
   */
  async sendTextMessage(recipientPhone: string, text: string) {
    const formattedNumber = formatPhoneNumber(recipientPhone)

    if (isDemoOrDummyNumber(recipientPhone)) {
      console.log(
        `🛡️ [Demo Safe Mode] Skipped dummy placeholder: ${recipientPhone} (${formattedNumber}).`
      )
      return {
        success: true,
        demoMode: true,
        message: 'Simulated WhatsApp message for dummy number.',
        recipient: recipientPhone,
        data: { id: `DEMO-MSG-${Date.now()}` },
      }
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      console.log(`[Evolution API: Dispatching WhatsApp] to ${formattedNumber}...`)

      const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: formattedNumber,
          text,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const data = await response.json()
      console.log(
        `[Evolution API: WhatsApp Response ${response.status}] for ${formattedNumber}:`,
        JSON.stringify(data).slice(0, 120)
      )

      return {
        success: response.ok || response.status === 200 || response.status === 201,
        data,
      }
    } catch (err: any) {
      console.warn(
        `[Evolution API: Delivery Error] Failed sending to ${formattedNumber}:`,
        err.message
      )
      return { success: false, error: err.message }
    }
  },
}
