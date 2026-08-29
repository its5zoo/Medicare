import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import { connectDB } from "./config/db.js"
import { seedDatabase } from "./seed.js"

import authRoutes from "./routes/auth.js"
import dashboardRoutes from "./routes/dashboard.js"
import patientRoutes from "./routes/patients.js"
import consultationRoutes from "./routes/consultations.js"
import prescriptionRoutes from "./routes/prescriptions.js"
import followUpRoutes from "./routes/followups.js"
import feedbackRoutes from "./routes/feedback.js"
import automationRoutes from "./routes/automation.js"
import whatsappRoutes from "./routes/whatsapp.js"

dotenv.config()

const app = express()

// Allow all origins with credentials for local dev and Vercel deployments
app.use(
  cors({
    origin: (_origin, callback) => {
      callback(null, true)
    },
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json())

// Ensure MongoDB is connected before handling any request (critical for serverless / Vercel)
app.use(async (_req, _res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('[DB Middleware Error]', err)
    next(err)
  }
})

function mount(prefix = "") {
  app.use(`${prefix}/auth`, authRoutes)
  app.use(`${prefix}/dashboard`, dashboardRoutes)
  app.use(`${prefix}/search`, dashboardRoutes)
  app.use(`${prefix}/patients`, patientRoutes)
  app.use(`${prefix}/patient`, patientRoutes)
  app.use(`${prefix}/consultations`, consultationRoutes)
  app.use(`${prefix}/prescriptions`, prescriptionRoutes)
  app.use(`${prefix}/followups`, followUpRoutes)
  app.use(`${prefix}/feedback`, feedbackRoutes)
  app.use(`${prefix}/feedback-submit`, feedbackRoutes)
  app.use(`${prefix}/automations`, automationRoutes)
  app.use(`${prefix}/whatsapp`, whatsappRoutes)
}

mount("/api")
mount("")

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

export default app
