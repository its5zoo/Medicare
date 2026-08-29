import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import { connectDB } from "./config/db"
import { seedDatabase } from "./seed"

import authRoutes from "./routes/auth"
import dashboardRoutes from "./routes/dashboard"
import patientRoutes from "./routes/patients"
import consultationRoutes from "./routes/consultations"
import prescriptionRoutes from "./routes/prescriptions"
import followUpRoutes from "./routes/followups"
import feedbackRoutes from "./routes/feedback"
import automationRoutes from "./routes/automation"
import whatsappRoutes from "./routes/whatsapp"

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
